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
      const isLoggedIn = !!auth?.user;
      const isProtected =
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/api/admin");

      return isProtected ? isLoggedIn : true;
    },
    jwt({ token, user }) {
      // `user` solo viene definido en el sign-in inicial (lo devuelve
      // `authorize()` en lib/auth.ts, siempre con `id`) — en refrescos
      // posteriores del JWT viene `undefined` y el token conserva lo ya guardado.
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
