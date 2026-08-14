import { NextResponse, type NextRequest } from "next/server";

import { calculateCouponDiscount, validateCoupon } from "@/lib/coupon";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { couponPreviewSchema } from "@/lib/validations/checkout";

/**
 * Preview público del cupón para el carrito. El descuento acá es solo
 * para mostrarle algo al usuario — /api/checkout lo vuelve a calcular
 * desde cero, nunca confía en lo que devuelve este endpoint.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`coupon:${ip}`, 20, 5 * 60 * 1000);
  if (!rate.success) {
    return NextResponse.json({ error: "Demasiados intentos, esperá un momento." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { code, subtotal } = couponPreviewSchema.parse(body);

    const coupon = await validateCoupon(code, subtotal);
    const discount = calculateCouponDiscount(coupon, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toNumber(),
      discount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cupón inválido";
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
