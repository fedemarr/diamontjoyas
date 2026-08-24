import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": la usa el middleware (corre en el Edge Runtime de
 * Next.js, sin acceso a Node APIs). Por eso NO tiene el Credentials
 * provider acá — ese necesita bcrypt + Prisma, que son Node-only, y se
 * agrega en `lib/auth.ts` para el resto del sistema (route handlers,
 * server components, server actions).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminArea =
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/api/admin");

      // El área admin SOLO acepta sesiones "admin" — una sesión de cliente
      // logueado en la tienda no debe poder entrar acá aunque esté logueada.
      if (isAdminArea) return auth?.user?.kind === "admin";

      // `/cuenta` (excepto login/registro) se protege a nivel de página,
      // no acá — así conviven los dos `pages.signIn` sin pelearse.
      return true;
    },
    jwt({ token, user }) {
      // `user` solo viene definido en el sign-in inicial (lo devuelve
      // `authorize()` en lib/auth.ts, siempre con `id`) — en refrescos
      // posteriores del JWT viene `undefined` y el token conserva lo ya guardado.
      // `user` es la unión discriminada por `kind` — se copia entero (no
      // campo por campo) para que TS la angoste bien en ambos lados.
      if (user?.id) {
        Object.assign(token, user);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, token);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
