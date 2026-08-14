import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { db } from "@/lib/db";
import { getGoldPrices, getProductPrice } from "@/lib/pricing";
import { goldPriceUpdateSchema } from "@/lib/validations/settings";

/**
 * Preview antes de confirmar (sección 5 del prompt maestro): compara el
 * precio de cada producto BY_WEIGHT con los valores actuales vs. los
 * propuestos, sin tocar la base.
 */
export async function POST(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const proposed = goldPriceUpdateSchema.parse(body);

    const current = await getGoldPrices();
    const proposedPrices = {
      goldPricePerGram18k: new Prisma.Decimal(proposed.goldPricePerGram18k),
      goldPricePerGramLow: new Prisma.Decimal(proposed.goldPricePerGramLow),
    };

    const products = await db.product.findMany({
      where: { deletedAt: null, pricingMode: "BY_WEIGHT" },
      orderBy: { name: "asc" },
    });

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      material: p.material,
      oldPrice: getProductPrice(p, current).toNumber(),
      newPrice: getProductPrice(p, proposedPrices).toNumber(),
    }));

    return NextResponse.json({ items, affectedCount: items.length });
  } catch (error) {
    return handleApiError(error);
  }
}
