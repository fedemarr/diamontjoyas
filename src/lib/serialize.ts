import type { Prisma } from "@prisma/client";

/**
 * `Prisma.Decimal` serializa a JSON como string (vía su `toJSON()`), no
 * como number — si no se convierte acá, el cliente recibe "50000" en vez
 * de 50000 y hay que parsear en todos lados. Se convierte una sola vez,
 * en el borde de la API.
 */
export function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  return value == null ? null : value.toNumber();
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; variants: true; category: true };
}>;

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export function serializeOrder(order: OrderWithItems) {
  return {
    ...order,
    shippingAddress: order.shippingAddress as Prisma.InputJsonValue | null,
    shippingCost: order.shippingCost.toNumber(),
    subtotal: order.subtotal.toNumber(),
    discount: order.discount.toNumber(),
    total: order.total.toNumber(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      subtotal: item.subtotal.toNumber(),
      unitCost: item.unitCost == null ? null : item.unitCost.toNumber(),
    })),
  };
}

/** Convierte los Decimal de un producto (y sus variantes) a number. */
export function serializeProduct(product: ProductWithRelations) {
  return {
    ...product,
    price: decimalToNumber(product.price),
    weightGrams: decimalToNumber(product.weightGrams),
    laborCost: decimalToNumber(product.laborCost),
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    cost: decimalToNumber(product.cost),
    variants: product.variants.map((v) => ({
      ...v,
      priceDelta: decimalToNumber(v.priceDelta),
      weightGrams: decimalToNumber(v.weightGrams),
    })),
  };
}
