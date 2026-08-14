import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { reorderCategoriesSchema } from "@/lib/validations/category";

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const { ids } = reorderCategoriesSchema.parse(body);

    await db.$transaction(
      ids.map((id, index) => db.category.update({ where: { id }, data: { order: index } }))
    );

    await logAudit({
      userId: session.user.id,
      action: "CATEGORY_REORDER",
      entity: "Category",
      entityId: ids.join(","),
      changes: { order: ids },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
