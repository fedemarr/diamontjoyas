import { z } from "zod";

/**
 * URL de imagen: acepta tanto una URL absoluta (Cloudinary, `https://...`)
 * como una ruta local dentro de `public/` (`/products/foo.jpg`,
 * `/banner1.png`) — `z.url()` solo por sí solo rechaza esto último porque
 * exige protocolo, y bloqueaba en silencio el guardado de cualquier
 * producto/categoría/banner que usara una imagen local en vez de una
 * subida a Cloudinary.
 */
export const imageUrlSchema = z
  .string()
  .refine((value) => value.startsWith("/") || z.url().safeParse(value).success, {
    message: "URL de imagen inválida",
  });
