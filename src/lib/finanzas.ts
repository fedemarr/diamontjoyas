import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export interface FinanceSummaryData {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  revenue: number;
  orderCount: number;
  approvedCount: number;
  averageTicket: number;
  grossMargin: number;
  grossMarginPercent: number;
  series: { label: string; value: number }[];
  byCategory: { name: string; value: number; count: number }[];
  byMaterial: { name: string; value: number; count: number }[];
  topProducts: { name: string; sku: string; quantity: number; revenue: number }[];
  previous: {
    revenue: number;
    orderCount: number;
    approvedCount: number;
    averageTicket: number;
    grossMargin: number;
  };
}

/** Cantidad de días entre dos fechas (inclusive por arriba). */
function daysBetween(from: Date, to: Date): number {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}

/** Agrega ventas por día (o por semana si el período es largo). */
function buildSeries(from: Date, to: Date, orders: { createdAt: Date; total: Prisma.Decimal }[]): { label: string; value: number }[] {
  const days = daysBetween(from, to);
  const weekly = days > 31;

  const bucketKey = (date: Date) => {
    if (!weekly) return date.toISOString().slice(0, 10);
    // Semana que empieza en lunes.
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    return monday.toISOString().slice(0, 10);
  };

  const totals = new Map<string, number>();
  for (const o of orders) {
    const key = bucketKey(o.createdAt);
    totals.set(key, (totals.get(key) ?? 0) + o.total.toNumber());
  }

  // Rellenar los buckets vacíos para que la serie sea continua.
  const buckets: string[] = [];
  const cursor = new Date(from);
  const inc = (d: Date) => d.setDate(d.getDate() + (weekly ? 7 : 1));
  while (cursor <= to) {
    buckets.push(bucketKey(cursor));
    inc(cursor);
  }

  return [...new Set(buckets)].map((label) => ({ label, value: totals.get(label) ?? 0 }));
}

/**
 * Resumen de finanzas (sección 5 del prompt maestro): ingresos por período
 * sobre pedidos con pago aprobado, margen bruto con `unitCost`/`cost`
 * (snapshot histórico), ventas por categoría y material, top productos y
 * comparativa contra el período anterior de la misma duración.
 */
export async function getFinanceSummary(from: Date, to: Date): Promise<FinanceSummaryData> {
  const periodMs = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - periodMs);
  const previousTo = new Date(to.getTime() - periodMs);

  const [orders, previousOrders] = await Promise.all([
    db.order.findMany({
      where: { paymentStatus: "APPROVED", createdAt: { gte: from, lte: to } },
      include: {
        items: { include: { product: { select: { cost: true, material: true, categoryId: true } } } },
      },
    }),
    db.order.findMany({
      where: { paymentStatus: "APPROVED", createdAt: { gte: previousFrom, lte: previousTo } },
      include: { items: { include: { product: { select: { cost: true } } } } },
    }),
  ]);

  const [orderCount, previousOrderCount] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: from, lte: to } } }),
    db.order.count({ where: { createdAt: { gte: previousFrom, lte: previousTo } } }),
  ]);

  const categories = await db.category.findMany({ select: { id: true, name: true } });

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  function itemCost(item: { unitCost: Prisma.Decimal | null; quantity: number; subtotal: Prisma.Decimal; product: { cost: Prisma.Decimal | null } | null }): number {
    const unit = item.unitCost ?? item.product?.cost ?? null;
    return unit == null ? 0 : unit.toNumber() * item.quantity;
  }

  let revenue = 0;
  let grossMargin = 0;
  const byCategory = new Map<string, { value: number; count: number }>();
  const byMaterial = new Map<string, { value: number; count: number }>();
  const topProducts = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    revenue += order.total.toNumber();
    for (const item of order.items) {
      grossMargin += item.subtotal.toNumber() - itemCost(item);

      const cat = item.product ? categoryName.get(item.product.categoryId) : null;
      if (cat) {
        const cur = byCategory.get(cat) ?? { value: 0, count: 0 };
        byCategory.set(cat, { value: cur.value + item.subtotal.toNumber(), count: cur.count + item.quantity });
      }

      if (item.product) {
        const cur = byMaterial.get(item.product.material) ?? { value: 0, count: 0 };
        byMaterial.set(item.product.material, {
          value: cur.value + item.subtotal.toNumber(),
          count: cur.count + item.quantity,
        });
      }

      const top = topProducts.get(item.productName) ?? { name: item.productName, sku: item.productSku, quantity: 0, revenue: 0 };
      top.quantity += item.quantity;
      top.revenue += item.subtotal.toNumber();
      topProducts.set(item.productName, top);
    }
  }

  // Previous period (ingresos + margen, para la comparativa del panel).
  let previousRevenue = 0;
  let previousGrossMargin = 0;
  for (const order of previousOrders) {
    previousRevenue += order.total.toNumber();
    for (const item of order.items) {
      previousGrossMargin += item.subtotal.toNumber() - itemCost(item);
    }
  }
  const previousApproved = previousOrders.length;

  const approvedCount = orders.length;

  const series = buildSeries(from, to, orders);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    previousFrom: previousFrom.toISOString(),
    previousTo: previousTo.toISOString(),
    revenue,
    orderCount,
    approvedCount,
    averageTicket: approvedCount > 0 ? revenue / approvedCount : 0,
    grossMargin,
    grossMarginPercent: revenue > 0 ? (grossMargin / revenue) * 100 : 0,
    series,
    byCategory: [...byCategory.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.value - a.value),
    byMaterial: [...byMaterial.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.value - a.value),
    topProducts: [...topProducts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    previous: {
      revenue: previousRevenue,
      orderCount: previousOrderCount,
      approvedCount: previousApproved,
      averageTicket: previousApproved > 0 ? previousRevenue / previousApproved : 0,
      grossMargin: previousGrossMargin,
    },
  };
}

/** Filas planas por ítem para exportar CSV/Excel (sección 5 del prompt). */
export async function getFinanceExportRows(from: Date, to: Date) {
  const orders = await db.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      items: { include: { product: { select: { cost: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return orders.flatMap((order) =>
    order.items.map((item) => ({
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString().slice(0, 10),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      customer: order.customerName,
      product: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      lineSubtotal: item.subtotal.toNumber(),
      lineCost: item.unitCost ?? item.product?.cost ?? null,
      lineMargin: item.subtotal.toNumber() - (item.unitCost ?? item.product?.cost ?? new Prisma.Decimal(0)).toNumber() * item.quantity,
    }))
  );
}
