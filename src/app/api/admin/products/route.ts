import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getGoldPrices, getProductPrice, type GoldPrices } from "@/lib/pricing";
import { decimalToNumber, serializeProduct } from "@/lib/serialize";
import { productQuerySchema, productSchema } from "@/lib/validations/product";

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.q && {
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { sku: { contains: query.q, mode: "insensitive" } },
        ],
      }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.material && { material: query.material }),
      ...(query.isActive && { isActive: query.isActive === "true" }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "name"
        ? { name: "asc" }
        : query.sort === "stock"
          ? { stock: "asc" }
          : query.sort === "price"
            ? { price: "asc" }
            : { createdAt: "desc" };

    let goldPrices: GoldPrices;
    try {
      goldPrices = await getGoldPrices();
    } catch {
      goldPrices = {
        goldPricePerGram18k: new Prisma.Decimal(0),
        goldPricePerGramLow: new Prisma.Decimal(0),
      };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    const items = products.map((p) => {
      let currentPrice: number | null = null;
      try {
        currentPrice = getProductPrice(p, goldPrices).toNumber();
      } catch {
        currentPrice = null;
      }

      return {
        ...p,
        price: decimalToNumber(p.price),
        weightGrams: decimalToNumber(p.weightGrams),
        laborCost: decimalToNumber(p.laborCost),
        compareAtPrice: decimalToNumber(p.compareAtPrice),
        cost: decimalToNumber(p.cost),
        currentPrice,
      };
    });

    return NextResponse.json({
      products: items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await db.product.create({
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
      include: { images: true, variants: true, category: true },
    });

    await logAudit({
      userId: session.user.id,
      action: "PRODUCT_CREATE",
      entity: "Product",
      entityId: product.id,
      changes: { after: product },
    });

    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
