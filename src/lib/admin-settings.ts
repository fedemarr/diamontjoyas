import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { SettingsUpdateInput } from "@/lib/validations/settings";
import type { SettingsState } from "@/types/admin";

/**
 * Estado completo de Settings para el panel admin (sección 5 del prompt
 * maestro). A diferencia de `getPublicSettings` (storefront), acá vienen
 * TODAS las claves, incluidas las de configuración que no son públicas.
 */

const DEFAULT_SHIPPING = { amba: 4500, interior: 7500, retiroLocal: 0 };

const DEFAULTS: SettingsState = {
  storeName: "DIAMONDVA.Co",
  logoUrl: null,
  maintenanceMode: false,
  heroTitle: "Piezas que se notan, brillo que perdura",
  heroSubtitle: "Enchapadas, oro bajo y oro 18k. Envíos a todo el país.",
  aboutText: "",
  whatsappOrderTemplate: "Hola! Quiero consultar por *{{productName}}* — {{productUrl}}",
  whatsapp: null,
  email: null,
  address: null,
  businessHours: null,
  instagram: null,
  facebook: null,
  shippingRates: DEFAULT_SHIPPING,
  freeShippingThreshold: null,
  transferDiscountPercent: 0,
  installmentsEnabled: false,
  installmentsCount: 6,
  bankAlias: null,
  bankCbu: null,
  bankHolderName: null,
  silverPricePerGram: 0,
  platedPricePerGram: 0,
  customChainGramsPerCm: 1.2,
  customChainLaborCost: 5000,
};

export async function getSettingsState(): Promise<SettingsState> {
  const rows = await db.setting.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return {
    ...DEFAULTS,
    ...Object.fromEntries(
      Object.keys(DEFAULTS).map((key) => [
        key,
        byKey.has(key) ? byKey.get(key) : DEFAULTS[key as keyof SettingsState],
      ])
    ),
  } as SettingsState;
}

/** Upsert en lote de todos los Settings editables (una sola llamada a PUT). */
export async function updateSettingsState(data: SettingsUpdateInput): Promise<SettingsState> {
  const entries = Object.entries(data).map(([key, value]) => [key, value] as [string, unknown]);

  await db.$transaction(
    entries.map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        create: { key, value: value as Prisma.InputJsonValue },
        update: { value: value as Prisma.InputJsonValue },
      })
    )
  );

  return getSettingsState();
}
