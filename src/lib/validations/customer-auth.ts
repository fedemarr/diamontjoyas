import { z } from "zod";

/**
 * Cuenta de cliente (storefront) — separada de `validations/auth.ts`
 * (login del panel admin). Mismo patrón: un solo schema para el form y
 * para `authorize()` del provider "customer-login".
 */
export const customerLoginSchema = z.object({
  email: z.email({ message: "Ingresá un email válido" }),
  password: z.string().min(1, { message: "Ingresá tu contraseña" }),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

export const customerRegisterSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre completo").max(150),
  email: z.email({ message: "Ingresá un email válido" }),
  phone: z.string().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña tiene que tener al menos 8 caracteres").max(100),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
