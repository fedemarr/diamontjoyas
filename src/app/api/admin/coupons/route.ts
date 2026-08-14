import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations/coupon";

const include = { _count: { select: { orders: true } } } as const;

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const coupons = await db.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include,
  });

  return NextResponse.json({
    coupons: coupons.map((c) => ({
      ...c,
      value: c.value.toNumber(),
      minPurchase: c.minPurchase?.toNumber() ?? null,
      validFrom: c.validFrom.toISOString(),
      validUntil: c.validUntil.toISOString(),
      orderCount: c._count.orders,
    })),
    total: coupons.length,
  });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = couponSchema.parse(body);

    const coupon = await db.coupon.create({
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
      action: "COUPON_CREATE",
      entity: "Coupon",
      entityId: coupon.id,
      changes: { after: data },
    });

    return NextResponse.json({ coupon: { ...coupon, value: coupon.value.toNumber() } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
