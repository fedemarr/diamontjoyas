import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations/category";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        icon: data.icon || null,
        order: data.order,
        isActive: data.isActive,
        parentId: data.parentId || null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CATEGORY_CREATE",
      entity: "Category",
      entityId: category.id,
      changes: { after: category },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
