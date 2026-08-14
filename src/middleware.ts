import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Protege /admin/* y /api/admin/* — sin sesión válida redirige a /login
 * (sección 5 del prompt maestro). Corre en el Edge Runtime, por eso usa
 * `authConfig` (sin Credentials/bcrypt/Prisma) y no `lib/auth.ts`.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
