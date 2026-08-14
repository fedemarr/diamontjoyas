import Decimal from "decimal.js";

/**
 * Cálculo de precio — sección 3 del prompt maestro. DIFERENCIAL CLAVE:
 * el precio del oro se mueve todo el tiempo, el admin actualiza UN valor
 * por gramo y acá se recalculan todos los productos BY_WEIGHT.
 *
 *   precioFinal = FIXED     → price
 *   precioFinal = BY_WEIGHT → weightGrams * goldPricePerGram(material) + laborCost
 *
 * Redondeo a centena de pesos hacia arriba. `getProductPrice()` es el
 * ÚNICO lugar del sistema que hace esta cuenta — grilla, ficha, carrito,
 * checkout y admin (incluido el preview en vivo del form) siempre pasan
 * por acá, nunca duplican la fórmula.
 *
 * Este módulo es "puro" a propósito (usa `decimal.js` directo, no
 * `@prisma/client`) para poder importarse tanto en el server como en
 * componentes de cliente (el preview de precio del form de producto).
 * `lib/pricing.ts` agrega encima las funciones que sí tocan la base.
 */

export type PricingMode = "FIXED" | "BY_WEIGHT";

/** Materiales con precio por gramo configurado en Settings. */
export type GoldMaterial = "ORO_18K" | "ORO_BAJO";

export type Material = GoldMaterial | "ENCHAPADO" | "PLATA_925" | "ACERO_QUIRURGICO";

const GOLD_MATERIALS: readonly GoldMaterial[] = ["ORO_18K", "ORO_BAJO"];

function isGoldMaterial(material: Material): material is GoldMaterial {
  return (GOLD_MATERIALS as readonly Material[]).includes(material);
}

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export interface GoldPrices {
  /** Setting `goldPricePerGram18k` — precio por gramo de ORO_18K. */
  goldPricePerGram18k: Decimal;
  /** Setting `goldPricePerGramLow` — precio por gramo de ORO_BAJO. */
  goldPricePerGramLow: Decimal;
}

/** Subconjunto de campos de `Product` que necesita el cálculo de precio. */
export interface PricingInput {
  pricingMode: PricingMode;
  material: Material;
  price?: Decimal | number | string | null;
  weightGrams?: Decimal | number | string | null;
  laborCost?: Decimal | number | string | null;
}

/** Redondeo a centena de pesos hacia arriba (ej: 50101 → 50200). */
export function roundUpToHundred(value: Decimal): Decimal {
  return value.dividedBy(100).ceil().times(100);
}

/** Precio por gramo vigente para un material, según el Setting cargado. */
export function getGoldPricePerGram(material: Material, goldPrices: GoldPrices): Decimal {
  if (!isGoldMaterial(material)) {
    throw new PricingError(
      `El material "${material}" no tiene precio por gramo configurado. ` +
        `Solo ORO_18K y ORO_BAJO admiten pricingMode BY_WEIGHT.`
    );
  }

  return material === "ORO_18K" ? goldPrices.goldPricePerGram18k : goldPrices.goldPricePerGramLow;
}

/**
 * Precio final de un producto. Función pura y sincrónica — no toca la
 * base de datos, por eso es fácil de testear y de reusar en cualquier
 * lugar (server components, route handlers, scripts de admin, o el
 * preview en vivo del form de producto en el cliente).
 */
export function getProductPrice(input: PricingInput, goldPrices: GoldPrices): Decimal {
  if (input.pricingMode === "FIXED") {
    if (input.price == null) {
      throw new PricingError("Producto con pricingMode FIXED sin `price` definido.");
    }
    return roundUpToHundred(new Decimal(input.price));
  }

  // BY_WEIGHT
  if (input.weightGrams == null) {
    throw new PricingError("Producto con pricingMode BY_WEIGHT sin `weightGrams` definido.");
  }

  const pricePerGram = getGoldPricePerGram(input.material, goldPrices);
  const weight = new Decimal(input.weightGrams);
  const labor = input.laborCost != null ? new Decimal(input.laborCost) : new Decimal(0);

  return roundUpToHundred(weight.times(pricePerGram).plus(labor));
}
