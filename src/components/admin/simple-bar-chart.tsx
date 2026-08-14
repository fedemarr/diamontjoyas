import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Gráfico de barras minimalista en CSS puro (sin librería): mantiene el
 * dark luxury, no agrega dependencias pesadas y responde a hover con el
 * valor exacto de la barra.
 */
export function SimpleBarChart({
  data,
  height = 180,
  className,
  formatValue,
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex w-full items-end gap-1" style={{ height }}>
        {data.map((point, i) => (
          <div
            key={`${point.label}-${i}`}
            className="group relative flex flex-1 flex-col justify-end"
            title={`${point.label}: ${formatValue?.(point.value) ?? point.value}`}
          >
            <div
              className="w-full rounded-t-sm bg-gradient-gold opacity-80 transition-opacity group-hover:opacity-100"
              style={{ height: `${Math.max((point.value / max) * 100, point.value > 0 ? 4 : 1.5)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {data.map((point, i) => (
          <span
            key={`${point.label}-${i}`}
            className="flex-1 truncate text-center text-[10px] text-silver"
            title={point.label}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-ink-border bg-ink-soft p-5",
        highlight && "border-gold/40 bg-gold/5"
      )}
    >
      <p className="text-xs font-medium tracking-luxury text-silver uppercase">{label}</p>
      <p className="font-display text-2xl font-semibold text-bone">{value}</p>
      {sub && <p className="text-xs text-silver">{sub}</p>}
    </div>
  );
}

/** Barra de comparación porcentual (finanzas). */
export function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <span className="text-xs text-silver">sin dato previo</span>;
  const delta = ((current - previous) / previous) * 100;
  const positive = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      )}
    >
      {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}
