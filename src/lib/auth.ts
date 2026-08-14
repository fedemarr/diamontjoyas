import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

/**
 * Config completa (Node runtime): agrega el Credentials provider sobre
 * `authConfig`. `AUTH_SECRET` se lee automáticamente de env — no hace
 * falta pasarlo acá.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        // Rate limit por IP contra fuerza bruta (sección 8 del prompt maestro).
        const ip = getRequestIp(request);
        const rate = checkRateLimit(`login:${ip}`, 10, 10 * 60 * 1000);
        if (!rate.success) {
          throw new Error("Demasiados intentos. Esperá 10 minutos y volvé a intentar.");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });

        // Mismo resultado (null) exista o no el email, esté activo o no,
        // para no filtrar por respuesta qué emails existen en el sistema.
        if (!user || user.deletedAt || !user.isActive) return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

/** IP del request en el callback de authorize (next-auth v5 lo pasa como 2do arg). */
function getRequestIp(request?: Request): string {
  if (!request) return "unknown";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
