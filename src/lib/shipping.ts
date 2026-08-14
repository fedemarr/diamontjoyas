/**
 * Cálculo de envío (sección 4 del prompt maestro: "cálculo de envío por
 * provincia/CP según shippingRates"). `Setting.shippingRates` solo tiene
 * dos tarifas (amba / interior) — se simplifica CABA + Provincia de
 * Buenos Aires como "AMBA" y el resto del país como "interior". Es una
 * simplificación real (AMBA técnicamente son partidos puntuales del GBA,
 * no toda la provincia) pero coincide con cómo está modelado Settings.
 */

export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export type Province = (typeof ARGENTINA_PROVINCES)[number];

const AMBA_PROVINCES: readonly string[] = ["Buenos Aires", "CABA"];

export type ShippingMethod = "ENVIO_DOMICILIO" | "SUCURSAL_CORREO" | "RETIRO_LOCAL";

export interface ShippingRates {
  amba?: number;
  interior?: number;
  retiroLocal?: number;
}

export function calculateShippingCost(
  method: ShippingMethod,
  province: string | null,
  rates: ShippingRates | null
): number {
  if (method === "RETIRO_LOCAL") return rates?.retiroLocal ?? 0;
  if (!province) return rates?.interior ?? 0;
  return AMBA_PROVINCES.includes(province) ? (rates?.amba ?? 0) : (rates?.interior ?? 0);
}
