"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { DeltaBadge, SimpleBarChart, StatCard } from "@/components/admin/simple-bar-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { finanzasApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";
import { MATERIAL_LABELS } from "@/lib/materials";

const PRESETS = [
  { label: "Hoy", days: 0 },
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
  { label: "Este año", days: 365 },
] as const;

function toDateInput(date: Date): string {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 10);
}

export default function FinanzasPage() {
  const [preset, setPreset] = useState<string>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = useMemo(() => {
    if (customFrom && customTo) return { from: customFrom, to: customTo };
    const days = Number(preset);
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - days * 86_400_000);
    return { from: toDateInput(fromDate), to: toDateInput(toDate) };
  }, [preset, customFrom, customTo]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["finanzas", from, to],
    queryFn: () => finanzasApi.summary(from, to),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Finanzas</h1>
          <p className="text-sm text-silver">Ingresos, márgenes y ventas — solo pedidos con pago aprobado.</p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-ink-border bg-transparent text-bone"
        >
          <a href={`/api/admin/finanzas/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}>
            <Download className="size-4" />
            Exportar CSV
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={preset} onValueChange={(v) => { setPreset(v); setCustomFrom(""); setCustomTo(""); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.days} value={String(p.days)}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          aria-label="Desde"
          className="w-40 border-ink-border bg-ink-soft text-bone"
        />
        <Input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          aria-label="Hasta"
          className="w-40 border-ink-border bg-ink-soft text-bone"
        />
        <p className="text-sm text-silver">
          {from} → {to}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-silver">Calculando...</p>
      ) : isError || !data ? (
        <p className="text-sm text-danger">No se pudieron calcular las finanzas.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Ingresos"
              value={formatARS(data.revenue)}
              highlight
              sub={
                <span className="inline-flex items-center gap-1">
                  vs período anterior: <DeltaBadge current={data.revenue} previous={data.previous.revenue} />
                </span>
              }
            />
            <StatCard
              label="Pedidos"
              value={String(data.approvedCount)}
              sub={`${data.orderCount} pedidos en total en el período`}
            />
            <StatCard
              label="Ticket promedio"
              value={formatARS(data.averageTicket)}
              sub={
                <span className="inline-flex items-center gap-1">
                  vs previo: <DeltaBadge current={data.averageTicket} previous={data.previous.averageTicket} />
                </span>
              }
            />
            <StatCard
              label="Margen bruto"
              value={formatARS(data.grossMargin)}
              sub={`${data.grossMarginPercent.toFixed(1)}% de los ingresos`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
              <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
                Ventas por día
              </h2>
              <div className="mt-4">
                <SimpleBarChart data={data.series} formatValue={(v) => formatARS(v)} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
                <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
                  Ventas por categoría
                </h2>
                <BreakdownList items={data.byCategory} />
              </div>
              <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
                <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
                  Ventas por material
                </h2>
                <BreakdownList
                  items={data.byMaterial.map((m) => ({ ...m, name: MATERIAL_LABELS[m.name] ?? m.name }))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ink-border bg-ink-soft">
            <div className="border-b border-ink-border px-5 py-4">
              <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
                Top productos del período
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-silver">
                      Sin ventas en este período.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topProducts.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell className="text-bone">{p.name}</TableCell>
                      <TableCell className="text-silver">{p.sku}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                      <TableCell className="text-right">{formatARS(p.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownList({ items }: { items: { name: string; value: number; count: number }[] }) {
  if (items.length === 0) return <p className="mt-3 text-sm text-silver">Sin ventas en este período.</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="mt-3 flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-bone">{item.name}</span>
            <span className="text-silver">
              {formatARS(item.value)} · {item.count} uds
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink">
            <div
              className="h-full rounded-full bg-gradient-gold"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
