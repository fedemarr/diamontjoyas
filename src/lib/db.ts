import { PrismaClient } from "@prisma/client";

/**
 * Singleton de Prisma Client. En dev, Next.js recarga módulos en caliente
 * y cada recarga crearía una conexión nueva a la DB si no se cachea la
 * instancia en `globalThis` — esto evita agotar el pool de conexiones.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
