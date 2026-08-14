import { z } from "zod";

import { ARGENTINA_PROVINCES } from "@/lib/shipping";

export const shippingAddressSchema = z.object({
  street: z.string().min(1, "Ingresá la calle"),
  number: z.string().min(1, "Ingresá el número"),
  floor: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "Ingresá la localidad"),
  province: z.enum(ARGENTINA_PROVINCES, { error: "Elegí una provincia" }),
  postalCode: z.string().min(3, "Ingresá el código postal"),
  notes: z.string().max(300).optional().or(z.literal("")),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Ingresá tu nombre completo").max(150),
    customerEmail: z.email("Ingresá un email válido"),
    customerPhone: z.string().min(6, "Ingresá un teléfono válido").max(30),
    customerDni: z.string().max(20).optional().or(z.literal("")),
    shippingMethod: z.enum(["ENVIO_DOMICILIO", "SUCURSAL_CORREO", "RETIRO_LOCAL"]),
    shippingAddress: shippingAddressSchema.optional(),
    paymentMethod: z.enum(["MERCADO_PAGO", "TRANSFERENCIA", "EFECTIVO"]),
    items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
    couponCode: z.string().optional().or(z.literal("")),
    customerNotes: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod !== "RETIRO_LOCAL" && !data.shippingAddress) {
      ctx.addIssue({
        code: "custom",
        path: ["shippingAddress"],
        message: "Completá la dirección de envío",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const couponPreviewSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});
