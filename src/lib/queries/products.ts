import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { db } from "@/lib/db";
import { getGoldPrices, getProductPrice, type GoldPrices } from "@/lib/pricing";

/**
 * `cost` NUNCA se selecciona en estas queries — sección 8 del prompt
 * maestro ("cost... NUNCA expuesto al público"). No alcanza con "no
 * mostrarlo en el JSX": mejor ni traerlo de la base en las queries que
 * alimentan el storefront.
 */
const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  sku: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
  material: true,
  pricingMode: true,
  price: true,
  weightGrams: true,
  laborCost: true,
  compareAtPrice: true,
  stock: true,
  lowStockAlert: true,
  trackStock: true,
  isFeatured: true,
  metaTitle: true,
  metaDescription: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { where: { isActive: true }, orderBy: { name: "asc" as const } },
} satisfies Prisma.ProductSelect;

export type PublicProduct = Prisma.ProductGetPayload<{ select: typeof PUBLIC_PRODUCT_SELECT }>;

export interface PublicProductWithPrice extends PublicProduct {
  currentPrice: number;
}

function attachPrice<T extends PublicProduct>(
  product: T,
  goldPrices: GoldPrices
): T & { currentPrice: number } {
  let currentPrice = 0;
  try {
    currentPrice = getProductPrice(product, goldPrices).toNumber();
  } catch {
    currentPrice = 0;
  }
  return { ...product, currentPrice };
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "name";

export interface CatalogFilters {
  categorySlug?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  q?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

/**
 * Catálogo público. El rango de precio filtra sobre el precio YA
 * calculado — como `BY_WEIGHT` no tiene `price` fijo en la base, el
 * filtro se aplica en memoria después de calcular `currentPrice` (el
 * catálogo no es tan grande como para que esto pese).
 */
export async function getProducts(filters: CatalogFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const goldPrices = await getGoldPrices().catch(
    () => ({ goldPricePerGram18k: 0, goldPricePerGramLow: 0 }) as unknown as GoldPrices
  );

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    isActive: true,
    ...(filters.categorySlug && { category: { slug: filters.categorySlug } }),
    ...(filters.material && { material: filters.material as Prisma.EnumMaterialFilter["equals"] }),
    ...(filters.inStockOnly && { stock: { gt: 0 } }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "name"
      ? { name: "asc" }
      : filters.sort === "price-asc" || filters.sort === "price-desc"
        ? { createdAt: "desc" } // se reordena en memoria por currentPrice más abajo
        : { createdAt: "desc" };

  const all = await db.product.findMany({ where, orderBy, select: PUBLIC_PRODUCT_SELECT });
  let withPrice = all.map((p) => attachPrice(p, goldPrices));

  if (filters.minPrice != null) {
    withPrice = withPrice.filter((p) => p.currentPrice >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    withPrice = withPrice.filter((p) => p.currentPrice <= filters.maxPrice!);
  }
  if (filters.sort === "price-asc") {
    withPrice.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (filters.sort === "price-desc") {
    withPrice.sort((a, b) => b.currentPrice - a.currentPrice);
  }

  const total = withPrice.length;
  const start = (page - 1) * pageSize;
  const items = withPrice.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export const getFeaturedProducts = cache(async (limit = 8) => {
  const [products, goldPrices] = await Promise.all([
    db.product.findMany({
      where: { deletedAt: null, isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: PUBLIC_PRODUCT_SELECT,
    }),
    getGoldPrices().catch(() => ({ goldPricePerGram18k: 0, goldPricePerGramLow: 0 }) as unknown as GoldPrices),
  ]);
  return products.map((p) => attachPrice(p, goldPrices));
});

export const getGold18kProducts = cache(async (limit = 8) => {
  const [products, goldPrices] = await Promise.all([
    db.product.findMany({
      where: { deletedAt: null, isActive: true, material: "ORO_18K" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: PUBLIC_PRODUCT_SELECT,
    }),
    getGoldPrices().catch(() => ({ goldPricePerGram18k: 0, goldPricePerGramLow: 0 }) as unknown as GoldPrices),
  ]);
  return products.map((p) => attachPrice(p, goldPrices));
});

export const getProductBySlug = cache(async (slug: string) => {
  const [product, goldPrices] = await Promise.all([
    db.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      select: PUBLIC_PRODUCT_SELECT,
    }),
    getGoldPrices().catch(() => ({ goldPricePerGram18k: 0, goldPricePerGramLow: 0 }) as unknown as GoldPrices),
  ]);
  if (!product) return null;
  return attachPrice(product, goldPrices);
});

export const getRelatedProducts = cache(async (categoryId: string, excludeId: string, limit = 4) => {
  const [products, goldPrices] = await Promise.all([
    db.product.findMany({
      where: { deletedAt: null, isActive: true, categoryId, id: { not: excludeId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: PUBLIC_PRODUCT_SELECT,
    }),
    getGoldPrices().catch(() => ({ goldPricePerGram18k: 0, goldPricePerGramLow: 0 }) as unknown as GoldPrices),
  ]);
  return products.map((p) => attachPrice(p, goldPrices));
});

/** Fire-and-forget — no bloquea el render de la ficha si falla. */
export function incrementProductViews(id: string) {
  db.product.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
}
