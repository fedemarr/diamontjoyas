import { cache } from "react";

import { db } from "@/lib/db";

/**
 * Público, sin login — sección 4 del prompt maestro (/seguimiento/[code]).
 * Solo lo que un cliente necesita ver de su propio pedido: nada de
 * `internalNotes`, `unitCost` ni datos de otros pedidos.
 */
export const getOrderByPublicCode = cache(async (code: string) => {
  return db.order.findUnique({
    where: { publicCode: code },
    select: {
      id: true,
      orderNumber: true,
      publicCode: true,
      customerName: true,
      shippingMethod: true,
      shippingAddress: true,
      shippingCost: true,
      subtotal: true,
      discount: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      trackingCode: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          unitPrice: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  });
});
