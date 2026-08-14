import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// `next-auth/jwt` es un `export *` de este módulo — algunas versiones de
// TS no mergean bien la augmentación de arriba a través del re-export,
// así que se declara también acá directamente por las dudas.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
