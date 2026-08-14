import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(80),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .max(80)
    .regex(slugRegex, "Solo minúsculas, números y guiones (ej: anillos-y-sellos)"),
  description: z.string().max(500).optional().or(z.literal("")),
  imageUrl: z.union([z.url("URL de imagen inválida"), z.literal("")]).optional(),
  icon: z.string().max(40).optional().or(z.literal("")),
  // Sin .default(): el form siempre manda estos dos vía defaultValues de
  // RHF — con .default() acá, zodResolver infiere un tipo "input" con
  // estos campos opcionales que no matchea el tipo del form (fricción
  // conocida de RHF + Zod).
  order: z.number().int().min(0),
  isActive: z.boolean(),
  parentId: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const reorderCategoriesSchema = z.object({
  ids: z.array(z.string()).min(1),
});
