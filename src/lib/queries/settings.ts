import { cache } from "react";

import { db } from "@/lib/db";

/**
 * Shape esperada de los Settings públicos (sección 3 del prompt maestro).
 * Todo opcional/con default acá porque `Setting` es un key-value libre —
 * si el admin todavía no cargó algo, el storefront no se rompe.
 */
export interface PublicSettings {
  storeName: string;
  logoUrl: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  businessHours: string | null;
  shippingRates: { amba?: number; interior?: number; retiroLocal?: number } | null;
  freeShippingThreshold: number | null;
  transferDiscountPercent: number;
  installmentsEnabled: boolean;
  installmentsCount: number;
  heroTitle: string | null;
  heroSubtitle: string | null;
  aboutText: string | null;
  whatsappOrderTemplate: string;
  maintenanceMode: boolean;
  bankAlias: string | null;
  bankCbu: string | null;
  bankHolderName: string | null;
  silverPricePerGram: number;
  platedPricePerGram: number;
  customChainGramsPerCm: number;
  customChainLaborCost: number;
}

const DEFAULTS: PublicSettings = {
  storeName: "DIAMONDVA.Co",
  logoUrl: null,
  whatsapp: null,
  email: null,
  address: null,
  instagram: null,
  facebook: null,
  businessHours: null,
  shippingRates: null,
  freeShippingThreshold: null,
  transferDiscountPercent: 0,
  installmentsEnabled: false,
  installmentsCount: 1,
  heroTitle: "Piezas que se notan, brillo que perdura",
  heroSubtitle: "Enchapadas, oro bajo y oro 18k. Envíos a todo el país.",
  aboutText: null,
  whatsappOrderTemplate: "Hola! Quiero consultar por *{{productName}}* — {{productUrl}}",
  maintenanceMode: false,
  bankAlias: null,
  bankCbu: null,
  bankHolderName: null,
  silverPricePerGram: 0,
  platedPricePerGram: 0,
  customChainGramsPerCm: 1.2,
  customChainLaborCost: 5000,
};

/**
 * `cache()` de React deduplica esta consulta dentro del mismo render — el
 * home compone Header/Footer/Hero/etc. como componentes independientes
 * que piden Settings cada uno, pero solo pega una vez a la base.
 */
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  const rows = await db.setting.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return {
    ...DEFAULTS,
    ...Object.fromEntries(
      Object.keys(DEFAULTS).map((key) => [key, byKey.has(key) ? byKey.get(key) : DEFAULTS[key as keyof PublicSettings]])
    ),
  } as PublicSettings;
});

export function buildWhatsappUrl(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
