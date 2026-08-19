import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const materialEnum = z.enum([
  "ORO_18K",
  "ORO_BAJO",
  "ENCHAPADO",
  "PLATA_925",
]);

export const pricingModeEnum = z.enum(["FIXED", "BY_WEIGHT"]);

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.url("URL de imagen inválida"),
  alt: z.string().min(1, "El texto alternativo es obligatorio (accesibilidad y SEO)").max(150),
  order: z.number().int().min(0),
  isPrimary: z.boolean(),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre de variante obligatorio (ej: 45cm)").max(60),
  sku: z.string().min(1, "SKU de variante obligatorio").max(40),
  priceDelta: z.number(),
  weightGrams: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
});

export const productSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio").max(150),
    slug: z
      .string()
      .min(1, "El slug es obligatorio")
      .max(150)
      .regex(slugRegex, "Solo minúsculas, números y guiones"),
    description: z.string().max(3000).optional().or(z.literal("")),
    sku: z.string().min(1, "El SKU es obligatorio").max(40),
    categoryId: z.string().min(1, "Elegí una categoría"),
    material: materialEnum,
    pricingMode: pricingModeEnum,
    price: z.number().positive("Tiene que ser mayor a 0").optional().nullable(),
    weightGrams: z.number().positive("Tiene que ser mayor a 0").optional().nullable(),
    laborCost: z.number().min(0).optional().nullable(),
    compareAtPrice: z.number().positive().optional().nullable(),
    cost: z.number().min(0).optional().nullable(),
    // Sin .default() en los campos de abajo: el form siempre los manda
    // vía defaultValues de RHF — con .default() acá, zodResolver infiere
    // un tipo "input" opcional que no matchea el tipo del form.
    stock: z.number().int().min(0),
    lowStockAlert: z.number().int().min(0),
    trackStock: z.boolean(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    order: z.number().int().min(0),
    metaTitle: z.string().max(70).optional().or(z.literal("")),
    metaDescription: z.string().max(160).optional().or(z.literal("")),
    images: z.array(productImageSchema),
    variants: z.array(productVariantSchema),
  })
  // Regla condicional (sección 3 del prompt maestro): la DB no puede
  // validar esto sola, por eso vive acá — un único lugar, usado tanto en
  // el form del admin como en el endpoint que lo recibe.
  .superRefine((data, ctx) => {
    if (data.pricingMode === "FIXED") {
      if (data.price == null) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "El precio es obligatorio en modo Precio fijo",
        });
      }
    } else {
      if (data.weightGrams == null) {
        ctx.addIssue({
          code: "custom",
          path: ["weightGrams"],
          message: "El peso en gramos es obligatorio en modo Por peso",
        });
      }
      if (data.material !== "ORO_18K" && data.material !== "ORO_BAJO") {
        ctx.addIssue({
          code: "custom",
          path: ["material"],
          message: "Solo Oro 18k y Oro bajo admiten precio por peso",
        });
      }
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["activate", "deactivate", "delete"]),
});

export const productQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  material: materialEnum.optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "name", "stock", "price"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
