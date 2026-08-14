import { z } from "zod";

/**
 * Schema = tipo (sección 1 del prompt maestro): se usa tanto en el
 * formulario de login (React Hook Form) como en `authorize()` del
 * Credentials provider — una sola fuente de verdad.
 */
export const loginSchema = z.object({
  email: z.email({ message: "Ingresá un email válido" }),
  password: z.string().min(1, { message: "Ingresá tu contraseña" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
