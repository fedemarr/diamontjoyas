import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre").max(120),
  email: z.email("Ingresá un email válido"),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(10, "Contanos un poco más (mínimo 10 caracteres)").max(2000),
  // Honeypot anti-spam (sección 8 del prompt maestro): los bots suelen
  // llenar todos los campos visibles. Este campo está oculto con CSS, así
  // que un humano deja `website` vacío.
  website: z.string().max(500).optional().or(z.literal("")),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const contactMessageListQuerySchema = z.object({
  q: z.string().optional(),
  isRead: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
