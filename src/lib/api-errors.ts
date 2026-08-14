import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { CloudinaryConfigError } from "@/lib/cloudinary";
import { CouponError } from "@/lib/coupon";
import { MercadoPagoConfigError } from "@/lib/mercadopago";
import { PricingError } from "@/lib/pricing";

/** Manejo consistente de errores en todas las rutas /api/*. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof PricingError || error instanceof CouponError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof CloudinaryConfigError || error instanceof MercadoPagoConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "campo";
      return NextResponse.json(
        { error: `Ya existe un registro con ese ${target} — tiene que ser único.` },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "No se encontró el registro." }, { status: 404 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
}
