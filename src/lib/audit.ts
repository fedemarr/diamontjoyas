import { db } from "@/lib/db";

export async function logAudit(params: {
  /** null para acciones disparadas por el sistema (ej. webhook de MP), sin admin logueado. */
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  /** Objeto libre (ej. { before, after }) — puede traer Decimal/Date de Prisma. */
  changes: unknown;
  ip?: string | null;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      // Serializa Decimal/Date de Prisma a algo que el campo Json acepte.
      changes: JSON.parse(JSON.stringify(params.changes)),
      ip: params.ip ?? null,
    },
  });
}
