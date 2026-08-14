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
  if (!session?.user) {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { session };
}
