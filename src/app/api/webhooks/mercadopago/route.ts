import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { NextResponse, type NextRequest } from "next/server";

import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { emitEvent } from "@/lib/events";
import { fetchPayment, mapMpStatusToPaymentStatus } from "@/lib/mercadopago";
import { reserveStock } from "@/lib/stock";

/**
 * Webhook de Mercado Pago (sección 6 del prompt maestro):
 * 1. Verifica la firma x-signature — si no valida, 401.
 * 2. Nunca confía en el body del webhook: vuelve a consultar el pago a
 *    la API de MP.
 * 3. Idempotente: un mismo pago ya procesado devuelve 200 sin reprocesar.
 * 4. Si `approved`: descuenta stock en transacción y confirma el pedido.
 * 5. Responde 200 rápido.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!secret) {
    console.error("MP_WEBHOOK_SECRET no configurado — no se puede validar el webhook.");
    return NextResponse.json({ error: "No configurado" }, { status: 503 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
      toleranceSeconds: 5 * 60,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.error("Firma de webhook de MP inválida:", error.reason, error.requestId);
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    throw error;
  }

  let body: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await request.json();
  } catch {
    // algunos pings de MP no traen body — no es un error
  }

  const paymentId = dataId ?? body.data?.id;
  const eventType = body.type ?? url.searchParams.get("type");

  if (eventType !== "payment" || !paymentId) {
    // Ignoramos otros tipos de notificación (merchant_order, etc.)
    return NextResponse.json({ ok: true });
  }

  try {
    // Nunca confiar en el status que manda el body del webhook — se
    // vuelve a pedir el pago a la API de MP.
    const payment = await fetchPayment(paymentId);
    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) {
      console.error(`Webhook de MP: no se encontró la Order ${orderId} (pago ${paymentId}).`);
      return NextResponse.json({ ok: true });
    }

    // Idempotencia: mismo pago, mismo status ya aplicado → no reprocesar.
    const newStatus = mapMpStatusToPaymentStatus(payment.status ?? "pending");
    if (order.mpPaymentId === String(paymentId) && order.paymentStatus === newStatus) {
      return NextResponse.json({ ok: true });
    }

    const wasAlreadyApproved = order.paymentStatus === "APPROVED";

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          mpPaymentId: String(paymentId),
          paymentStatus: newStatus,
          ...(newStatus === "APPROVED" && { orderStatus: "CONFIRMADO" }),
        },
      });

      // Descuenta stock una sola vez, la primera vez que se aprueba.
      if (newStatus === "APPROVED" && !wasAlreadyApproved) {
        await reserveStock(tx, order.items);
      }
    });

    // userId null: este cambio lo dispara el webhook de MP, no un admin
    // logueado — logAudit ya acepta userId opcional para este caso.
    await logAudit({
      userId: null,
      action: "ORDER_PAYMENT_WEBHOOK",
      entity: "Order",
      entityId: order.id,
      changes: { mpPaymentId: paymentId, paymentStatus: newStatus },
    }).catch((err) => {
      console.error("No se pudo registrar el AuditLog del webhook:", err);
    });

    if (newStatus === "APPROVED" && !wasAlreadyApproved) {
      await emitEvent("order.payment_approved", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        publicCode: order.publicCode,
        customerEmail: order.customerEmail,
      });
    } else if (newStatus === "REJECTED") {
      await emitEvent("order.payment_rejected", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error);
    // 200 igual: MP reintenta con backoff si devolvemos error, y no
    // queremos reintentos infinitos por un bug transitorio nuestro una
    // vez que ya lo logueamos.
    return NextResponse.json({ ok: true });
  }
}
