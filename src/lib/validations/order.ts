import { z } from "zod";

export const orderListQuerySchema = z.object({
  q: z.string().optional(),
  orderStatus: z.enum(["NUEVO", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGADO", "CANCELADO"]).optional(),
  paymentStatus: z
    .enum(["PENDING", "APPROVED", "IN_PROCESS", "REJECTED", "REFUNDED", "CANCELLED"])
    .optional(),
  paymentMethod: z.enum(["MERCADO_PAGO", "TRANSFERENCIA", "EFECTIVO"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const orderUpdateSchema = z.object({
  orderStatus: z
    .enum(["NUEVO", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGADO", "CANCELADO"])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "APPROVED", "IN_PROCESS", "REJECTED", "REFUNDED", "CANCELLED"])
    .optional(),
  trackingCode: z.string().max(80).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
});

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
