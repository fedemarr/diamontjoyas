import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * El middleware ya protege /api/admin/*, pero cada route handler vuelve a
 * chequear la sesión (defensa en profundidad) y la necesita de todos
 * modos para el `userId` del AuditLog.
 */
export async function requireSession(): Promise<
  { session: Session; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const session = await auth();
  // El middleware ya filtra por `kind === "admin"` en /api/admin/*, pero
  // esta segunda validación es la que de verdad importa como defensa en
  // profundidad — sin el chequeo de `kind`, una sesión de CLIENTE con un
  // `user.id` válido pasaba el `!session?.user` de arriba igual.
  if (session?.user?.kind !== "admin") {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { session };
}
