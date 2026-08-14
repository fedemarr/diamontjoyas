import { Prisma } from "@prisma/client";
import Papa from "papaparse";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { materialEnum } from "@/lib/validations/product";

const importBodySchema = z.object({ csv: z.string().min(1, "El archivo CSV está vacío") });

interface ImportRow {
  sku?: string;
  name?: string;
  slug?: string;
  categorySlug?: string;
  material?: string;
  pricingMode?: string;
  price?: string;
  weightGrams?: string;
  laborCost?: string;
  compareAtPrice?: string;
  cost?: string;
  stock?: string;
  lowStockAlert?: string;
  trackStock?: string;
  isActive?: string;
  isFeatured?: string;
  description?: string;
}

function toDecimal(value: string | undefined): Prisma.Decimal | null {
  if (!value || value.trim() === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return new Prisma.Decimal(n);
}

/**
 * Importación masiva por CSV (sección 5 del prompt maestro — "para
 * cargar catálogo masivo sin sufrir"). Upsert por `sku`: crea si no
 * existe, actualiza si ya existe. Errores por fila no frenan el resto
 * del archivo — se reportan todos juntos al final.
 *
 * No maneja imágenes/variantes (eso se carga desde el uploader del
 * producto) — el CSV es para datos y precios en volumen.
 */
export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const { csv } = importBodySchema.parse(body);

    const parsed = Papa.parse<ImportRow>(csv, { header: true, skipEmptyLines: true });

    const categories = await db.category.findMany({ where: { deletedAt: null } });
    const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

    const results = {
      created: 0,
      updated: 0,
      errors: [] as { row: number; sku?: string; message: string }[],
    };

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNumber = i + 2; // +1 header, +1 base 1

      try {
        if (!row.sku?.trim()) throw new Error("Falta la columna sku");
        if (!row.name?.trim()) throw new Error("Falta la columna name");

        const categoryId = row.categorySlug ? categoryIdBySlug.get(row.categorySlug) : undefined;
        if (!categoryId) {
          throw new Error(`Categoría "${row.categorySlug ?? ""}" no existe (usar el slug)`);
        }

        const materialResult = materialEnum.safeParse(row.material);
        if (!materialResult.success) {
          throw new Error(`Material "${row.material ?? ""}" inválido`);
        }

        const pricingMode: "FIXED" | "BY_WEIGHT" =
          row.pricingMode === "BY_WEIGHT" ? "BY_WEIGHT" : "FIXED";

        const data = {
          name: row.name,
          slug: row.slug?.trim() || slugify(row.name),
          description: row.description || null,
          categoryId,
          material: materialResult.data,
          pricingMode,
          price: pricingMode === "FIXED" ? toDecimal(row.price) : null,
          weightGrams: pricingMode === "BY_WEIGHT" ? toDecimal(row.weightGrams) : null,
          laborCost: pricingMode === "BY_WEIGHT" ? (toDecimal(row.laborCost) ?? new Prisma.Decimal(0)) : null,
          compareAtPrice: toDecimal(row.compareAtPrice),
          cost: toDecimal(row.cost),
          stock: row.stock ? parseInt(row.stock, 10) || 0 : 0,
          lowStockAlert: row.lowStockAlert ? parseInt(row.lowStockAlert, 10) || 3 : 3,
          trackStock: row.trackStock !== "false",
          isActive: row.isActive !== "false",
          isFeatured: row.isFeatured === "true",
        };

        if (pricingMode === "FIXED" && data.price == null) {
          throw new Error("pricingMode FIXED necesita price");
        }
        if (pricingMode === "BY_WEIGHT" && data.weightGrams == null) {
          throw new Error("pricingMode BY_WEIGHT necesita weightGrams");
        }

        const existing = await db.product.findUnique({ where: { sku: row.sku } });

        if (existing) {
          await db.product.update({ where: { sku: row.sku }, data });
          results.updated++;
        } else {
          await db.product.create({ data: { ...data, sku: row.sku } });
          results.created++;
        }
      } catch (rowError) {
        results.errors.push({
          row: rowNumber,
          sku: row.sku,
          message: rowError instanceof Error ? rowError.message : "Error desconocido",
        });
      }
    }

    await logAudit({
      userId: session.user.id,
      action: "PRODUCT_CSV_IMPORT",
      entity: "Product",
      entityId: "bulk",
      changes: results,
    });

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error);
  }
}
