import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getProductPrice, PricingError, type GoldPrices, type PricingInput } from "@/lib/pricing-core";

export * from "@/lib/pricing-core";

/**
 * Lee los dos Settings de precio del oro desde la base. Se llama UNA vez
 * por request (no por producto) y el resultado se pasa a `getProductPrice`
 * para cada producto — evita N+1 queries en grillas/listados.
 */
export async function getGoldPrices(): Promise<GoldPrices> {
  const settings = await db.setting.findMany({
    where: { key: { in: ["goldPricePerGram18k", "goldPricePerGramLow"] } },
  });

  const byKey = new Map(settings.map((s) => [s.key, s.value]));
  const gram18k = byKey.get("goldPricePerGram18k");
  const gramLow = byKey.get("goldPricePerGramLow");

  if (typeof gram18k !== "number" || typeof gramLow !== "number") {
    throw new PricingError(
      "Faltan los Settings goldPricePerGram18k / goldPricePerGramLow en la base " +
        "(¿se corrió el seed?)."
    );
  }

  return {
    goldPricePerGram18k: new Prisma.Decimal(gram18k),
    goldPricePerGramLow: new Prisma.Decimal(gramLow),
  };
}

/** Atajo: trae los Settings vigentes y calcula el precio en un solo paso. */
export async function getProductPriceFromSettings(
  input: PricingInput
): Promise<Prisma.Decimal> {
  const goldPrices = await getGoldPrices();
  return getProductPrice(input, goldPrices) as Prisma.Decimal;
}
