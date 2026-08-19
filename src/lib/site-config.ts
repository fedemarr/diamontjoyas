/**
 * Contenido estático del storefront para la Fase 1 (layout base).
 * A partir de la Fase 5 esto se reemplaza por datos reales de la base
 * (Category, Announcement, Setting) — se deja acá centralizado para que
 * ese reemplazo sea un cambio de origen de datos, no de componentes.
 */

export const siteConfig = {
  name: "DIAMONDVA.Co",
  description:
    "Joyas enchapadas, oro bajo, oro 18k y plata 925. Envíos a todo el país desde San Miguel, Buenos Aires.",
  location: "San Miguel, Buenos Aires, Argentina",
  instagram: {
    handle: "@diamondva.co",
    url: "https://instagram.com/diamondva.co",
  },
  contactInstagram: {
    handle: "@_alealbornoz",
    url: "https://instagram.com/_alealbornoz",
  },
} as const;

export const categories = [
  { name: "Cadenas", slug: "cadenas" },
  { name: "Anillos", slug: "anillos" },
  { name: "Pulseras", slug: "pulseras" },
] as const;

/** Placeholder — se reemplaza por el modelo Announcement en la Fase 5. */
export const announcements = [
  "Envíos a todo el país · Retiro sin cargo en San Miguel",
  "Hasta 6 cuotas con Mercado Pago",
  "Descuento especial pagando por transferencia",
] as const;

export const legalLinks = [
  { name: "Términos y condiciones", slug: "terminos-y-condiciones" },
  { name: "Política de privacidad", slug: "politica-de-privacidad" },
  { name: "Cambios y devoluciones", slug: "cambios-y-devoluciones" },
  { name: "Botón de arrepentimiento", slug: "boton-de-arrepentimiento" },
] as const;
