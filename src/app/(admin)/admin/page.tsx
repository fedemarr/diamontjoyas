"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { SimpleBarChart, StatCard } from "@/components/admin/simple-bar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/lib/admin-api";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/lib/order-labels";

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.summary,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return <p className="text-sm text-silver">Cargando dashboard...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-danger">No se pudieron cargar los datos.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-bone">Dashboard</h1>
        <p className="text-sm text-silver">Resumen de ventas y alertas de la tienda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Vendido hoy"
          value={currency.format(data.todayRevenue)}
          sub={`${data.todayOrders} pedidos`}
          highlight
        />
        <StatCard label="Esta semana" value={currency.format(data.weekRevenue)} />
        <StatCard label="Este mes" value={currency.format(data.monthRevenue)} />
        <StatCard
          label="Ticket promedio"
          value={currency.format(data.averageTicket)}
          sub="últimos 30 días"
        />
        <StatCard
          label="Pedidos pendientes"
          value={String(data.pendingOrders)}
          sub="por confirmar o despachar"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-luxury text-gold-light uppercase">
            Ventas — últimos 30 días
          </h2>
          <SimpleBarChart
            data={data.monthSeries.map((p) => ({ label: p.label, value: p.value }))}
            height={200}
            formatValue={(v) => currency.format(v)}
          />
          <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-border pt-4">
            {data.ordersByStatus.map((s) => (
              <span
                key={s.status}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${orderStatusBadgeClass(s.status)}`}
              >
                {ORDER_STATUS_LABELS[s.status]}
                <span className="font-semibold">{s.count}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-luxury text-gold-light uppercase">
            Top productos del mes
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-silver">Todavía no hay ventas este mes.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-ink-border">
              {data.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-ink-border text-xs text-gold-light">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-bone">{p.name}</p>
                    <p className="text-xs text-silver">{p.quantity} unidades</p>
                  </div>
                  <span className="text-sm font-medium text-gold-light">{currency.format(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {data.lowStock.length > 0 && (
        <section className="rounded-lg border border-danger/30 bg-danger/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-danger" />
            <h2 className="text-sm font-semibold text-danger">Stock bajo</h2>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.lowStock.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/productos/${p.id}/editar`}
                  className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/20"
                >
                  {p.name}
                  <span className="font-semibold">
                    {p.stock} / alerta {p.lowStockAlert}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-ink-border bg-ink-soft p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-luxury text-gold-light uppercase">Últimos pedidos</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 text-gold-light hover:bg-ink-border hover:text-gold-light"
          >
            <Link href="/admin/pedidos">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-sm text-silver">Aún no hay pedidos.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-border">
            {data.recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="flex flex-wrap items-center gap-3 py-2.5 transition-colors hover:bg-ink-border/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-bone">
                      {o.customerName} · {o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-silver">
                      {o.items.length} {o.items.length === 1 ? "producto" : "productos"} ·{" "}
                      {currency.format(o.total)}
                    </p>
                  </div>
                  <Badge variant="outline" className={orderStatusBadgeClass(o.orderStatus)}>
                    {ORDER_STATUS_LABELS[o.orderStatus]}
                  </Badge>
                  <Badge variant="outline" className={paymentStatusBadgeClass(o.paymentStatus)}>
                    {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
