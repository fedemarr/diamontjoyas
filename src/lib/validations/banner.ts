import { z } from "zod";

import { imageUrlSchema } from "@/lib/validations/common";

export const bannerSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  subtitle: z.string().max(200).optional().nullable(),
  imageUrl: imageUrlSchema,
  // Acepta "" además de url/null — el form manda "" cuando el campo
  // (opcional) está vacío, y z.url() solo por sí solo lo rechazaría
  // bloqueando el submit en silencio (mismo problema que tuvo el checkout).
  mobileImageUrl: z.union([imageUrlSchema, z.literal("")]).optional().nullable(),
  linkUrl: z.string().max(300).optional().nullable(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const announcementSchema = z.object({
  text: z.string().min(1, "El texto es obligatorio").max(160),
  linkUrl: z.string().max(300).optional().nullable(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type BannerInput = z.infer<typeof bannerSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
