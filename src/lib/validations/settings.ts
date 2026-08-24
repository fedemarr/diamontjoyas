import { z } from "zod";

import { imageUrlSchema } from "@/lib/validations/common";

export const goldPriceUpdateSchema = z.object({
  goldPricePerGram18k: z.number().positive("Tiene que ser mayor a 0"),
  goldPricePerGramLow: z.number().positive("Tiene que ser mayor a 0"),
});

export type GoldPriceUpdateInput = z.infer<typeof goldPriceUpdateSchema>;

/**
 * Schema completo de Settings (sección 3 del prompt maestro) — todos los
 * campos editables desde el admin sin deploy. `Setting` es key-value libre,
 * este schema es la única lista de "qué claves existen y cómo se validan".
 */
export const settingsUpdateSchema = z.object({
  storeName: z.string().min(1, "El nombre de la tienda es obligatorio").max(80),
  logoUrl: z.union([imageUrlSchema, z.literal("")]).optional(),
  maintenanceMode: z.boolean(),

  heroTitle: z.string().max(120),
  heroSubtitle: z.string().max(200),
  aboutText: z.string().max(600),
  whatsappOrderTemplate: z.string().max(500),

  whatsapp: z.string().max(30).optional().or(z.literal("")),
  email: z.union([z.email("Email inválido"), z.literal("")]).optional(),
  address: z.string().max(200).optional().or(z.literal("")),
  businessHours: z.string().max(200).optional().or(z.literal("")),
  instagram: z.string().max(200).optional().or(z.literal("")),
  facebook: z.string().max(200).optional().or(z.literal("")),

  shippingRates: z.object({
    amba: z.number().min(0),
    interior: z.number().min(0),
    retiroLocal: z.number().min(0),
  }),
  freeShippingThreshold: z.number().min(0).optional().nullable(),

  transferDiscountPercent: z.number().min(0).max(100),
  installmentsEnabled: z.boolean(),
  installmentsCount: z.number().int().min(1).max(12),
  bankAlias: z.string().max(120).optional().or(z.literal("")),
  bankCbu: z.string().max(60).optional().or(z.literal("")),
  bankHolderName: z.string().max(120).optional().or(z.literal("")),

  // Cadenas a medida (cotizador del home): precio por gramo de plata y
  // enchapado (el oro ya tiene su propio Setting en /admin/precio-oro), más
  // los supuestos con los que se arma el "desde $X" orientativo.
  silverPricePerGram: z.number().positive("Tiene que ser mayor a 0"),
  platedPricePerGram: z.number().positive("Tiene que ser mayor a 0"),
  customChainGramsPerCm: z.number().positive("Tiene que ser mayor a 0"),
  customChainLaborCost: z.number().min(0),

  // Popup promocional (modal al cargar el home) — reusa Setting en vez de
  // un modelo propio, mismo patrón que el resto de la configuración.
  popupEnabled: z.boolean(),
  popupTitle: z.string().max(80).optional().or(z.literal("")),
  popupMessage: z.string().max(300).optional().or(z.literal("")),
  popupImageUrl: z.union([imageUrlSchema, z.literal("")]).optional(),
  popupLinkUrl: z.string().max(300).optional().or(z.literal("")),
  popupButtonText: z.string().max(40).optional().or(z.literal("")),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
