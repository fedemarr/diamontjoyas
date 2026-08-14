import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  subtitle: z.string().max(200).optional().nullable(),
  imageUrl: z.url("URL de imagen inválida"),
  mobileImageUrl: z.url("URL de imagen inválida").optional().nullable(),
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
