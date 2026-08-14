import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { bulkActionSchema } from "@/lib/validations/product";

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const { ids, action } = bulkActionSchema.parse(body);

    let count: number;

    if (action === "delete") {
      // slug/sku quedan "liberados" al borrar — cada fila necesita un
      // sufijo distinto, por eso no se puede usar updateMany acá.
      const products = await db.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, slug: true, sku: true },
      });

      await db.$transaction(
        products.map((p) =>
          db.product.update({
            where: { id: p.id },
            data: {
              deletedAt: new Date(),
              isActive: false,
              slug: `${p.slug}-eliminado-${Date.now().toString(36)}-${p.id.slice(0, 4)}`,
              sku: `${p.sku}-eliminado-${Date.now().toString(36)}-${p.id.slice(0, 4)}`,
            },
          })
        )
      );
      count = products.length;
    } else {
      const result = await db.product.updateMany({
        where: { id: { in: ids } },
        data: { isActive: action === "activate" },
      });
      count = result.count;
    }

    await logAudit({
      userId: session.user.id,
      action: `PRODUCT_BULK_${action.toUpperCase()}`,
      entity: "Product",
      entityId: ids.join(","),
      changes: { ids, action },
    });

    return NextResponse.json({ ok: true, count });
  } catch (error) {
    return handleApiError(error);
  }
}
