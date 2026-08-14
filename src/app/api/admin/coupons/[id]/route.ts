import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations/coupon";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = couponSchema.parse(body);

    const before = await db.coupon.findUniqueOrThrow({ where: { id } });

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        code: data.code,
        type: data.type,
        value: new Prisma.Decimal(data.value),
        minPurchase: data.minPurchase == null ? null : new Prisma.Decimal(data.minPurchase),
        maxUses: data.maxUses ?? null,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: data.isActive,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "COUPON_UPDATE",
      entity: "Coupon",
      entityId: coupon.id,
      changes: { before, after: data },
    });

    return NextResponse.json({ coupon: { ...coupon, value: coupon.value.toNumber() } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const before = await db.coupon.findUniqueOrThrow({ where: { id } });

    // Soft delete: se desactiva en vez de borrarse, para no romper el
    // snapshot de `couponCode` que guardan los pedidos ya hechos.
    await db.coupon.update({ where: { id }, data: { isActive: false } });

    await logAudit({
      userId: session.user.id,
      action: "COUPON_DELETE",
      entity: "Coupon",
      entityId: id,
      changes: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
