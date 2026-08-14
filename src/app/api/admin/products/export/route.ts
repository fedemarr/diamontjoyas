import Papa from "papaparse";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { db } from "@/lib/db";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const products = await db.product.findMany({
      where: { deletedAt: null },
      include: { category: { select: { slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    const rows = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      categorySlug: p.category.slug,
      material: p.material,
      pricingMode: p.pricingMode,
      price: p.price?.toString() ?? "",
      weightGrams: p.weightGrams?.toString() ?? "",
      laborCost: p.laborCost?.toString() ?? "",
      compareAtPrice: p.compareAtPrice?.toString() ?? "",
      cost: p.cost?.toString() ?? "",
      stock: p.stock,
      lowStockAlert: p.lowStockAlert,
      trackStock: p.trackStock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      description: p.description ?? "",
    }));

    const csv = Papa.unparse(rows);
    const filename = `diamondva-productos-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
