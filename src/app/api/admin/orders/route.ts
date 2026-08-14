import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { orderListQuerySchema } from "@/lib/validations/order";

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const parsed = orderListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  const where: Prisma.OrderWhereInput = {
    ...(parsed.orderStatus ? { orderStatus: parsed.orderStatus } : {}),
    ...(parsed.paymentStatus ? { paymentStatus: parsed.paymentStatus } : {}),
    ...(parsed.paymentMethod ? { paymentMethod: parsed.paymentMethod } : {}),
    ...(parsed.dateFrom || parsed.dateTo
      ? {
          createdAt: {
            ...(parsed.dateFrom ? { gte: new Date(parsed.dateFrom) } : {}),
            ...(parsed.dateTo ? { lte: new Date(parsed.dateTo) } : {}),
          },
        }
      : {}),
    ...(parsed.q
      ? {
          OR: [
            { orderNumber: { contains: parsed.q, mode: "insensitive" } },
            { publicCode: { contains: parsed.q, mode: "insensitive" } },
            { customerName: { contains: parsed.q, mode: "insensitive" } },
            { customerEmail: { contains: parsed.q, mode: "insensitive" } },
            { customerPhone: { contains: parsed.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
      include: { items: true },
    }),
  ]);

  return NextResponse.json({
    orders: orders.map(serializeOrder),
    total,
    page: parsed.page,
    pageSize: parsed.pageSize,
    totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
  });
}
