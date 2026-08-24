import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-errors";
import { auth } from "@/lib/auth";
import { calculateCouponDiscount, validateCoupon } from "@/lib/coupon";
import { db } from "@/lib/db";
import { emitEvent } from "@/lib/events";
import { createPaymentPreference, MercadoPagoConfigError } from "@/lib/mercadopago";
import { formatOrderNumber, generatePublicCode } from "@/lib/order-number";
import { getGoldPrices, getProductPrice } from "@/lib/pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateShippingCost } from "@/lib/shipping";
import { getPublicSettings } from "@/lib/queries/settings";
import { checkoutSchema } from "@/lib/validations/checkout";

/** 5% para clientes logueados que no usan cupón — no configurable por ahora. */
const MEMBER_DISCOUNT_PERCENT = 5;

class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`checkout:${ip}`, 8, 5 * 60 * 1000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá unos minutos y volvé a intentar." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // 1) Traer productos/variantes reales — el precio y el stock del
    // cliente NUNCA se usan (sección 8 del prompt maestro).
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isActive: true },
      include: { variants: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const goldPrices = await getGoldPrices();
    const settings = await getPublicSettings();

    let subtotal = new Prisma.Decimal(0);
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
    const mpItems: { id: string; title: string; quantity: number; unitPrice: number }[] = [];

    for (const line of data.items) {
      const product = productById.get(line.productId);
      if (!product) {
        throw new CheckoutError(`Uno de los productos del carrito ya no está disponible.`, 409);
      }

      let unitPrice = getProductPrice(product, goldPrices);
      let variant = null;
      if (line.variantId) {
        variant = product.variants.find((v) => v.id === line.variantId && v.isActive) ?? null;
        if (!variant) {
          throw new CheckoutError(`La variante elegida para "${product.name}" ya no existe.`, 409);
        }
        unitPrice = unitPrice.plus(variant.priceDelta);
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (product.trackStock && availableStock < line.quantity) {
        throw new CheckoutError(
          `No hay stock suficiente de "${product.name}"${variant ? ` (${variant.name})` : ""}. Quedan ${availableStock}.`,
          409
        );
      }

      const lineSubtotal = unitPrice.times(line.quantity);
      subtotal = subtotal.plus(lineSubtotal);

      orderItemsData.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: variant ? `${product.name} — ${variant.name}` : product.name,
        productSku: variant?.sku ?? product.sku,
        unitPrice,
        quantity: line.quantity,
        subtotal: lineSubtotal,
        unitCost: product.cost,
      });

      mpItems.push({
        id: variant?.sku ?? product.sku,
        title: variant ? `${product.name} — ${variant.name}` : product.name,
        quantity: line.quantity,
        unitPrice: unitPrice.toNumber(),
      });
    }

    // 2) Cupón — recalculado server-side, nunca se confía en un
    // descuento que venga del cliente.
    let discount = new Prisma.Decimal(0);
    let couponId: string | null = null;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const coupon = await validateCoupon(data.couponCode, subtotal.toNumber());
      discount = new Prisma.Decimal(calculateCouponDiscount(coupon, subtotal.toNumber()));
      couponId = coupon.id;
      couponCode = coupon.code;
    }

    // 2.1) 5% de socio — solo si hay sesión de CLIENTE (nunca admin) y no
    // se usó cupón (no se combinan). El customerId también se lee de la
    // sesión, nunca del body, para que no se pueda falsear.
    let customerId: string | null = null;
    let memberDiscountApplied = false;
    if (!data.couponCode) {
      const session = await auth();
      if (session?.user?.kind === "customer") {
        customerId = session.user.id;
        discount = subtotal.times(MEMBER_DISCOUNT_PERCENT).dividedBy(100);
        memberDiscountApplied = true;
      }
    }

    // 3) Envío
    const shippingCost = new Prisma.Decimal(
      calculateShippingCost(
        data.shippingMethod,
        data.shippingAddress?.province ?? null,
        settings.shippingRates
      )
    );

    const total = subtotal.minus(discount).plus(shippingCost);

    // NOTA: el stock NO se descuenta acá. Se reserva recién cuando el pago
    // se confirma — automático vía webhook para MERCADO_PAGO (sección 6),
    // y manual desde el admin para TRANSFERENCIA/EFECTIVO (pantalla de
    // pedidos, Fase 7) — así no se reserva stock de pedidos que nunca se
    // terminan de pagar.

    // 4) Crear la Order — orderNumber se arma después del insert con el
    // orderSeq autoincrement (atómico, sin condición de carrera).
    const publicCode = generatePublicCode();

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: "PENDIENTE",
          publicCode,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerDni: data.customerDni || null,
          customerId,
          memberDiscountApplied,
          shippingMethod: data.shippingMethod,
          shippingAddress: data.shippingAddress
            ? (data.shippingAddress as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          shippingCost,
          subtotal,
          discount,
          total,
          couponId,
          couponCode,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "NUEVO",
          customerNotes: data.customerNotes || null,
          items: { createMany: { data: orderItemsData } },
        },
      });

      const orderNumber = formatOrderNumber(created.orderSeq);
      const updated = await tx.order.update({
        where: { id: created.id },
        data: { orderNumber },
      });

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }

      return updated;
    });

    await emitEvent("order.created", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      publicCode: order.publicCode,
      total: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
    });

    // 5) Redirect según método de pago.
    if (data.paymentMethod === "MERCADO_PAGO") {
      try {
        const preference = await createPaymentPreference({
          orderId: order.id,
          orderNumber: order.orderNumber,
          items: mpItems,
          shippingCost: shippingCost.toNumber(),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          publicCode: order.publicCode,
        });

        await db.order.update({
          where: { id: order.id },
          data: { mpPreferenceId: preference.id },
        });

        const redirectUrl =
          process.env.MP_ENVIRONMENT === "production"
            ? preference.init_point
            : (preference.sandbox_init_point ?? preference.init_point);

        return NextResponse.json({
          orderId: order.id,
          publicCode: order.publicCode,
          redirectUrl,
        });
      } catch (mpError) {
        if (mpError instanceof MercadoPagoConfigError) {
          return NextResponse.json({ error: mpError.message }, { status: 503 });
        }
        console.error("Error creando preferencia de Mercado Pago:", mpError);
        return NextResponse.json(
          { error: "No se pudo iniciar el pago con Mercado Pago. Probá de nuevo en un momento." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      orderId: order.id,
      publicCode: order.publicCode,
      redirectUrl: `/checkout/exito?code=${order.publicCode}`,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}
