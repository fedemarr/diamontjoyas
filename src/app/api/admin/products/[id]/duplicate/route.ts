import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const original = await db.product.findUniqueOrThrow({
      where: { id },
      include: { images: true, variants: true },
    });

    const suffix = Date.now().toString(36);

    const copy = await db.product.create({
      data: {
        name: `${original.name} (copia)`,
        slug: `${original.slug}-copia-${suffix}`,
        description: original.description,
        sku: `${original.sku}-COPY-${suffix.toUpperCase()}`,
        categoryId: original.categoryId,
        material: original.material,
        pricingMode: original.pricingMode,
        price: original.price,
        weightGrams: original.weightGrams,
        laborCost: original.laborCost,
        compareAtPrice: original.compareAtPrice,
        cost: original.cost,
        stock: 0,
        lowStockAlert: original.lowStockAlert,
        trackStock: original.trackStock,
        isActive: false,
        isFeatured: false,
        order: original.order,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        images: {
          create: original.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
            isPrimary: img.isPrimary,
          })),
        },
        variants: {
          create: original.variants.map((v) => ({
            name: v.name,
            sku: `${v.sku}-COPY-${suffix}`,
            priceDelta: v.priceDelta,
            weightGrams: v.weightGrams,
            stock: 0,
            isActive: v.isActive,
          })),
        },
      },
      include: { images: true, variants: true, category: true },
    });

    await logAudit({
      userId: session.user.id,
      action: "PRODUCT_DUPLICATE",
      entity: "Product",
      entityId: copy.id,
      changes: { sourceId: original.id },
    });

    return NextResponse.json({ product: serializeProduct(copy) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
