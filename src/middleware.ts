import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Middleware (Edge Runtime): protege /admin/* y /api/admin/* con NextAuth
 * y aplica un rate limit global por IP sobre todas las APIs (sección 8 del
 * prompt maestro). El mapa en memoria es por aislado — en Vercel el límite
 * real termina siendo N × instancias; es el fallback documentado en
 * `lib/rate-limit.ts` hasta tener credenciales de Upstash.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rate = checkRateLimit(`global:${ip}`, 300, 60_000);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Esperá un momento y volvé a intentar." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
