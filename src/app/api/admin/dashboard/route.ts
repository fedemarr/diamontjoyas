import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthStart = startOfMonth(now);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  const approvedToday = db.order.aggregate({
    where: { paymentStatus: "APPROVED", createdAt: { gte: today } },
    _sum: { total: true },
    _count: true,
  });
  const countToday = db.order.count({ where: { createdAt: { gte: today } } });
  const approvedWeek = db.order.aggregate({
    where: { paymentStatus: "APPROVED", createdAt: { gte: weekAgo } },
    _sum: { total: true },
  });
  const approvedMonth = db.order.aggregate({
    where: { paymentStatus: "APPROVED", createdAt: { gte: monthStart } },
    _sum: { total: true },
    _count: true,
  });
  const pendingOrders = db.order.count({ where: { orderStatus: "NUEVO" } });
  const lowStock = db.product.findMany({
    where: {
      deletedAt: null,
      trackStock: true,
      stock: { lte: db.product.fields.lowStockAlert },
    },
    orderBy: { stock: "asc" },
    take: 8,
    select: { id: true, name: true, sku: true, stock: true, lowStockAlert: true },
  });
  const recentOrders = db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { items: true },
  });
  const ordersByStatus = db.order.groupBy({
    by: ["orderStatus"],
    _count: { _all: true },
  });

  const [approvedTodayRes, todayOrders, approvedWeekRes, approvedMonthRes, pending, lowStockRes, recent, byStatus] =
    await Promise.all([
      approvedToday,
      countToday,
      approvedWeek,
      approvedMonth,
      pendingOrders,
      lowStock,
      recentOrders,
      ordersByStatus,
    ]);

  // Top productos del último mes (por cantidad vendida, pago aprobado).
  const topProductRows = await db.orderItem.groupBy({
    by: ["productName", "productSku"],
    where: { order: { paymentStatus: "APPROVED", createdAt: { gte: monthAgo } } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // Serie diaria del mes corriente.
  const monthOrders = await db.order.findMany({
    where: { paymentStatus: "APPROVED", createdAt: { gte: monthStart } },
    select: { createdAt: true, total: true },
  });
  const dailyTotals = new Map<string, number>();
  for (const o of monthOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + o.total.toNumber());
  }
  const monthSeries: { label: string; value: number }[] = [];
  const cursor = new Date(monthStart);
  while (cursor <= now) {
    const key = cursor.toISOString().slice(0, 10);
    monthSeries.push({ label: key.slice(8, 10), value: dailyTotals.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const monthRevenue = approvedMonthRes._sum.total?.toNumber() ?? 0;
  const monthCount = approvedMonthRes._count;

  return NextResponse.json({
    todayRevenue: approvedTodayRes._sum.total?.toNumber() ?? 0,
    todayOrders,
    weekRevenue: approvedWeekRes._sum.total?.toNumber() ?? 0,
    monthRevenue,
    averageTicket: monthCount > 0 ? monthRevenue / monthCount : 0,
    pendingOrders: pending,
    lowStock: lowStockRes,
    recentOrders: recent.map(serializeOrder),
    topProducts: topProductRows.map((t) => ({
      name: t.productName,
      sku: t.productSku,
      quantity: t._sum.quantity ?? 0,
      revenue: t._sum.subtotal?.toNumber() ?? 0,
    })),
    ordersByStatus: byStatus.map((b) => ({ status: b.orderStatus, count: b._count._all })),
    monthSeries,
  });
}
