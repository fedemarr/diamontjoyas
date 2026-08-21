import Decimal from "decimal.js";

import type { Material } from "@/lib/pricing-core";

/**
 * Cotizador del formulario "Cadena a medida" del home. NO es un precio
 * final — el peso real depende del diseño exacto que se conversa por
 * WhatsApp — es un piso orientativo ("desde $X") para que el cliente tenga
 * una referencia antes de escribir. Por eso:
 *
 *   1. Redondea PARA ABAJO a la centena (nunca mostramos un "desde" más
 *      caro de lo que después se termina cobrando).
 *   2. Es una función pura (no toca la base), así se puede recalcular en
 *      vivo en el cliente a medida que el usuario cambia material/largo/
 *      grosor, sin ida y vuelta al server.
 *
 * `settings` viene de `PublicSettings` (home) o del form de Configuración
 * (admin) — mismos 6 números en los dos lados, una sola fórmula.
 */

export type ChainThickness = "FINA" | "MEDIANA" | "GRUESA";

/** Multiplicador sobre `customChainGramsPerCm` (que es la densidad "mediana"). */
export const THICKNESS_MULTIPLIER: Record<ChainThickness, number> = {
  FINA: 0.7,
  MEDIANA: 1,
  GRUESA: 1.4,
};

export const THICKNESS_LABELS: Record<ChainThickness, string> = {
  FINA: "Fina",
  MEDIANA: "Mediana",
  GRUESA: "Gruesa",
};

export interface CustomChainPriceSettings {
  goldPricePerGram18k: number;
  goldPricePerGramLow: number;
  silverPricePerGram: number;
  platedPricePerGram: number;
  customChainGramsPerCm: number;
  customChainLaborCost: number;
}

function pricePerGramFor(material: Material, settings: CustomChainPriceSettings): number {
  switch (material) {
    case "ORO_18K":
      return settings.goldPricePerGram18k;
    case "ORO_BAJO":
      return settings.goldPricePerGramLow;
    case "PLATA_925":
      return settings.silverPricePerGram;
    case "ENCHAPADO":
      return settings.platedPricePerGram;
  }
}

export interface CustomChainEstimateInput {
  material: Material;
  lengthCm: number;
  thickness: ChainThickness;
}

/** Devuelve 0 si falta algún dato para estimar (el caller decide qué mostrar). */
export function estimateCustomChainPrice(
  input: CustomChainEstimateInput,
  settings: CustomChainPriceSettings
): number {
  const { material, lengthCm, thickness } = input;
  if (!Number.isFinite(lengthCm) || lengthCm <= 0) return 0;

  const pricePerGram = pricePerGramFor(material, settings);
  if (!Number.isFinite(pricePerGram) || pricePerGram <= 0) return 0;

  const grams = new Decimal(lengthCm)
    .times(settings.customChainGramsPerCm)
    .times(THICKNESS_MULTIPLIER[thickness]);

  const raw = grams.times(pricePerGram).plus(settings.customChainLaborCost);

  return raw.dividedBy(100).floor().times(100).toNumber();
}
