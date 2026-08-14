import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { emitEvent } from "@/lib/events";
import { serializeOrder } from "@/lib/serialize";
import { reserveStock } from "@/lib/stock";
import { orderUpdateSchema } from "@/lib/validations/order";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const order = await db.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = orderUpdateSchema.parse(body);

    const before = await db.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    // Confirmación manual (transferencia/efectivo): cuando el admin marca
    // APPROVED, se descuenta stock acá — es el equivalente al webhook de MP.
    const approvingNow =
      data.paymentStatus === "APPROVED" &&
      before.paymentStatus !== "APPROVED" &&
      before.paymentMethod !== "MERCADO_PAGO";

    const order = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(data.orderStatus !== undefined ? { orderStatus: data.orderStatus } : {}),
          ...(data.paymentStatus !== undefined ? { paymentStatus: data.paymentStatus } : {}),
          ...(data.trackingCode !== undefined ? { trackingCode: data.trackingCode } : {}),
          ...(data.internalNotes !== undefined ? { internalNotes: data.internalNotes } : {}),
        },
        include: { items: true },
      });

      if (approvingNow) {
        await tx.order.update({
          where: { id },
          data: { orderStatus: "CONFIRMADO" },
        });
        updated.orderStatus = "CONFIRMADO";
        await reserveStock(tx, before.items);
      }

      return updated;
    });

    await logAudit({
      userId: session.user.id,
      action: "ORDER_UPDATE",
      entity: "Order",
      entityId: order.id,
      changes: {
        before: {
          orderStatus: before.orderStatus,
          paymentStatus: before.paymentStatus,
          trackingCode: before.trackingCode,
        },
        after: {
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          trackingCode: order.trackingCode,
        },
      },
    });

    if (approvingNow) {
      await emitEvent("order.payment_approved", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        publicCode: order.publicCode,
        customerEmail: order.customerEmail,
      });
    }

    if (
      data.orderStatus === "ENVIADO" &&
      before.orderStatus !== "ENVIADO" &&
      order.trackingCode
    ) {
      await emitEvent("order.shipped", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        publicCode: order.publicCode,
        customerEmail: order.customerEmail,
        trackingCode: order.trackingCode,
      });
    } else if (data.orderStatus === "ENTREGADO" && before.orderStatus !== "ENTREGADO") {
      await emitEvent("order.delivered", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        publicCode: order.publicCode,
        customerEmail: order.customerEmail,
      });
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
