import type { Coupon } from "@prisma/client";

import { db } from "@/lib/db";

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponError";
  }
}

/**
 * Válido para carrito (preview) y checkout (recalculo final) — un único
 * lugar, igual que `getProductPrice()`. Nunca confiar en el descuento
 * que manda el cliente.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<Coupon> {
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    throw new CouponError("El cupón no existe o no está activo.");
  }

  const now = new Date();
  if (coupon.validFrom > now) {
    throw new CouponError("El cupón todavía no está vigente.");
  }
  if (coupon.validUntil < now) {
    throw new CouponError("El cupón venció.");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponError("El cupón alcanzó el límite de usos.");
  }
  if (coupon.minPurchase != null && subtotal < coupon.minPurchase.toNumber()) {
    throw new CouponError(`El cupón requiere una compra mínima de ${coupon.minPurchase.toString()}.`);
  }

  return coupon;
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  const raw =
    coupon.type === "PERCENT" ? (subtotal * coupon.value.toNumber()) / 100 : coupon.value.toNumber();
  return Math.min(raw, subtotal);
}
