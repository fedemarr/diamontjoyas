import type { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from "@prisma/client";

/**
 * Labels y colores de estados (sección 5 del prompt maestro) — un único
 * lugar para el admin de pedidos, el detalle y el storefront.
 */

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NUEVO: "Nuevo",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "NUEVO",
  "CONFIRMADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  IN_PROCESS: "En proceso",
  REJECTED: "Rechazado",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MERCADO_PAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo en local",
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  ENVIO_DOMICILIO: "Envío a domicilio",
  SUCURSAL_CORREO: "Sucursal de correo",
  RETIRO_LOCAL: "Retiro en local",
};

/** Clase Tailwind para el badge de cada estado de pedido. */
export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "NUEVO":
      return "border-gold/40 bg-gold/10 text-gold-light";
    case "CONFIRMADO":
      return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    case "PREPARANDO":
      return "border-amber-400/40 bg-amber-400/10 text-amber-300";
    case "ENVIADO":
      return "border-violet-400/40 bg-violet-400/10 text-violet-300";
    case "ENTREGADO":
      return "border-success/40 bg-success/10 text-success";
    case "CANCELADO":
      return "border-danger/40 bg-danger/10 text-danger";
  }
}

/** Clase Tailwind para el badge de cada estado de pago. */
export function paymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "APPROVED":
      return "border-success/40 bg-success/10 text-success";
    case "PENDING":
      return "border-amber-400/40 bg-amber-400/10 text-amber-300";
    case "IN_PROCESS":
      return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    case "REJECTED":
    case "CANCELLED":
      return "border-danger/40 bg-danger/10 text-danger";
    case "REFUNDED":
      return "border-silver/40 bg-silver/10 text-silver";
  }
}
