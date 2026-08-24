import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Dos clases de sesión conviven en el mismo NextAuth: "admin" (panel,
 * tabla `User`, tiene `role`) y "customer" (cuenta de cliente en la
 * tienda, tabla `Customer`, sin `role`). Union discriminada por `kind`
 * para que TS angoste el tipo solo con un `if (kind === "admin")`, sin
 * necesidad de non-null assertions en cada lugar que lee `role`.
 */
type AppUser =
  | { kind: "admin"; id: string; role: Role }
  | { kind: "customer"; id: string };

export type SessionKind = AppUser["kind"];

declare module "next-auth" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, no se puede usar `type` acá
  interface User extends AppUser {}

  interface Session {
    user: AppUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, no se puede usar `type` acá
  interface JWT extends AppUser {}
}

// `next-auth/jwt` es un `export *` de este módulo — algunas versiones de
// TS no mergean bien la augmentación de arriba a través del re-export,
// así que se declara también acá directamente por las dudas.
declare module "@auth/core/jwt" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, no se puede usar `type` acá
  interface JWT extends AppUser {}
}
