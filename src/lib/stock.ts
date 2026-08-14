import type { Prisma } from "@prisma/client";

/**
 * Reserva de stock compartida (secciones 6-7 del prompt maestro).
 * La usa el webhook de Mercado Pago cuando un pago se aprueba y el admin
 * cuando confirma manualmente un pedido por transferencia/efectivo —
 * el mismo código, un solo lugar, para que nunca haya dos formas de
 * descontar stock.
 */
export async function reserveStock(
  tx: Prisma.TransactionClient,
  items: { productId: string | null; variantId: string | null; quantity: number }[]
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (variant) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: Math.min(item.quantity, variant.stock) } },
        });
      }
    } else if (item.productId) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product?.trackStock) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Math.min(item.quantity, product.stock) } },
        });
      }
    }
  }
}
