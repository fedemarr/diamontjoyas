import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER_STEPS = [
  { key: "NUEVO", label: "Recibido" },
  { key: "CONFIRMADO", label: "Confirmado" },
  { key: "PREPARANDO", label: "Preparando" },
  { key: "ENVIADO", label: "Enviado" },
  { key: "ENTREGADO", label: "Entregado" },
] as const;

const PAYMENT_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pago pendiente", className: "border-gold/40 text-gold-light" },
  APPROVED: { label: "Pago aprobado", className: "border-success/40 text-success" },
  IN_PROCESS: { label: "Pago en proceso", className: "border-gold/40 text-gold-light" },
  REJECTED: { label: "Pago rechazado", className: "border-danger/40 text-danger" },
  REFUNDED: { label: "Reembolsado", className: "border-silver/40 text-silver" },
  CANCELLED: { label: "Cancelado", className: "border-silver/40 text-silver" },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const info = PAYMENT_LABELS[status] ?? { label: status, className: "border-silver/40 text-silver" };
  return (
    <Badge variant="outline" className={info.className}>
      {info.label}
    </Badge>
  );
}

export function OrderTimeline({ orderStatus }: { orderStatus: string }) {
  if (orderStatus === "CANCELADO") {
    return (
      <Badge variant="outline" className="border-danger/40 text-danger">
        Pedido cancelado
      </Badge>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === orderStatus);

  return (
    <div className="flex items-center">
      {ORDER_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs",
                  reached ? "border-gold bg-gold text-ink" : "border-ink-border text-silver"
                )}
              >
                {reached ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[0.65rem]", reached ? "text-bone" : "text-silver")}>
                {step.label}
              </span>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={cn("mx-1 h-px flex-1", reached ? "bg-gold" : "bg-ink-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
