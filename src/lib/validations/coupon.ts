import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "El código tiene que tener al menos 2 caracteres")
    .max(40)
    .transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"], { error: "Elegí un tipo de cupón" }),
  value: z.number().positive("El valor tiene que ser mayor a 0"),
  minPurchase: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().positive("Tiene que ser mayor a 0").optional().nullable(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean(),
});

export const couponListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type CouponInput = z.infer<typeof couponSchema>;
