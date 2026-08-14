import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";
import { productSchema } from "@/lib/validations/product";

const include = { images: true, variants: true, category: true } as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const product = await db.product.findUniqueOrThrow({ where: { id }, include });
    return NextResponse.json({ product: serializeProduct(product) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = productSchema.parse(body);

    const before = await db.product.findUniqueOrThrow({ where: { id }, include });

    const product = await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          sku: data.sku,
          categoryId: data.categoryId,
          material: data.material,
          pricingMode: data.pricingMode,
          price: data.pricingMode === "FIXED" ? data.price : null,
          weightGrams: data.pricingMode === "BY_WEIGHT" ? data.weightGrams : null,
          laborCost: data.pricingMode === "BY_WEIGHT" ? (data.laborCost ?? 0) : null,
          compareAtPrice: data.compareAtPrice ?? null,
          cost: data.cost ?? null,
          stock: data.stock,
          lowStockAlert: data.lowStockAlert,
          trackStock: data.trackStock,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          order: data.order,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          images: {
            create: data.images.map((img) => ({
              url: img.url,
              alt: img.alt,
              order: img.order,
              isPrimary: img.isPrimary,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              priceDelta: v.priceDelta,
              weightGrams: v.weightGrams ?? null,
              stock: v.stock,
              isActive: v.isActive,
            })),
          },
        },
        include,
      });
    });

    await logAudit({
      userId: session.user.id,
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: product.id,
      changes: { before, after: product },
    });

    return NextResponse.json({ product: serializeProduct(product) });
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
    const before = await db.product.findUniqueOrThrow({ where: { id } });

    // slug/sku quedan "liberados" al borrar (soft delete no vacía los
    // @unique) — si no, no se puede volver a crear un producto con el
    // mismo nombre/SKU.
    const freedSuffix = `-eliminado-${Date.now().toString(36)}`;
    const product = await db.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        slug: `${before.slug}${freedSuffix}`,
        sku: `${before.sku}${freedSuffix}`,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: product.id,
      changes: { before, after: product },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
