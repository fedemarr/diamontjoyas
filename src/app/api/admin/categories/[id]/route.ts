import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations/category";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = categorySchema.partial().parse(body);

    const before = await db.category.findUniqueOrThrow({ where: { id } });

    const category = await db.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.icon !== undefined && { icon: data.icon || null }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CATEGORY_UPDATE",
      entity: "Category",
      entityId: category.id,
      changes: { before, after: category },
    });

    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const before = await db.category.findUniqueOrThrow({ where: { id } });

    // El slug queda "liberado" al borrar (soft delete no vacía el
    // @unique) — si no, no se puede volver a crear una categoría con el
    // mismo nombre.
    const category = await db.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        slug: `${before.slug}-eliminada-${Date.now().toString(36)}`,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CATEGORY_DELETE",
      entity: "Category",
      entityId: category.id,
      changes: { before, after: category },
    });

    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
