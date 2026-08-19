/**
 * Datos crudos del seed (sección 9 del prompt maestro). Separado de
 * `seed.ts` para que la orquestación (upserts, hashing, cálculo de
 * precios) no se pierda en medio de ~20 productos de ejemplo.
 *
 * Imágenes: placeholders de placehold.co con la paleta de marca
 * (fondo --ink, texto --gold) — no dependen de que un ID de foto externo
 * siga existiendo. Se reemplazan por las fotos reales del cliente en
 * Cloudinary más adelante (Fase 4).
 */

function placeholder(text: string, size = "800x800") {
  // .png explícito: placehold.co sirve SVG por default, y next/image lo
  // rechaza (bloquea SVG por seguridad salvo que se habilite a propósito).
  return `https://placehold.co/${size}/0B0B0C/C9A227.png?text=${encodeURIComponent(text)}`;
}

/** Sin texto — para banners, que ya llevan su propio título/subtítulo en HTML encima. */
function blankPlaceholder(size: string) {
  return `https://placehold.co/${size}/141416/141416.png`;
}

export const categoriesData = [
  {
    name: "Cadenas",
    slug: "cadenas",
    description: "Cadenas en oro 18k, oro bajo, enchapado y plata 925.",
    icon: "link",
    order: 0,
    imageUrl: placeholder("Cadenas", "600x400"),
  },
  {
    name: "Anillos",
    slug: "anillos",
    description: "Anillos y sellos grabables en distintos materiales.",
    icon: "circle",
    order: 1,
    imageUrl: placeholder("Anillos", "600x400"),
  },
  {
    name: "Pulseras",
    slug: "pulseras",
    description: "Pulseras, esclavas y tenis en oro y enchapado.",
    icon: "circle-dot",
    order: 2,
    imageUrl: placeholder("Pulseras", "600x400"),
  },
] as const;

type ProductSeed = {
  sku: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: (typeof categoriesData)[number]["slug"];
  material:
    | "ORO_18K"
    | "ORO_BAJO"
    | "ENCHAPADO"
    | "PLATA_925";
  pricingMode: "FIXED" | "BY_WEIGHT";
  price?: number;
  weightGrams?: number;
  laborCost?: number;
  compareAtPrice?: number;
  stock: number;
  isFeatured?: boolean;
};

export const productsData: ProductSeed[] = [
  // ── Cadenas ──────────────────────────────────────────────────────────
  {
    sku: "DVA-CAD-001",
    slug: "cadena-figaro-oro-18k",
    name: "Cadena Fígaro Oro 18k",
    description:
      "Cadena Fígaro clásica en oro 18k, 50cm. Pieza atemporal, ideal para uso diario.",
    categorySlug: "cadenas",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 8.2,
    laborCost: 18000,
    stock: 5,
    isFeatured: true,
  },
  {
    sku: "DVA-CAD-002",
    slug: "cadena-cubana-enchapada",
    name: "Cadena Cubana Enchapada",
    description: "Cadena cubana enchapada en oro, 55cm, cierre reforzado.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 32000,
    compareAtPrice: 38000,
    stock: 14,
  },
  {
    sku: "DVA-CAD-003",
    slug: "cadena-barbada-plata-925",
    name: "Cadena Barbada Plata 925",
    description: "Cadena barbada en plata 925, 45cm, terminación pulida.",
    categorySlug: "cadenas",
    material: "PLATA_925",
    pricingMode: "FIXED",
    price: 24500,
    stock: 10,
  },
  {
    sku: "DVA-CAD-004",
    slug: "cadena-rolo-oro-bajo",
    name: "Cadena Rolo Oro Bajo",
    description: "Cadena rolo en oro bajo, 60cm, eslabones finos.",
    categorySlug: "cadenas",
    material: "ORO_BAJO",
    pricingMode: "BY_WEIGHT",
    weightGrams: 6.5,
    laborCost: 8000,
    stock: 9,
  },

  // ── Anillos ────────────────────────────────────────────────────────
  {
    sku: "DVA-ANI-001",
    slug: "sello-oro-18k-iniciales",
    name: "Sello Oro 18k Iniciales",
    description: "Sello en oro 18k para grabar iniciales, base chata.",
    categorySlug: "anillos",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 6.8,
    laborCost: 22000,
    stock: 4,
    isFeatured: true,
  },
  {
    sku: "DVA-ANI-002",
    slug: "anillo-solitario-enchapado",
    name: "Anillo Solitario Enchapado",
    description: "Anillo solitario enchapado en oro con circonia central.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 18500,
    stock: 20,
  },
  {
    sku: "DVA-ANI-003",
    slug: "sello-oro-bajo-grabado",
    name: "Sello Oro Bajo Grabado",
    description: "Sello en oro bajo con guarda grabada en el contorno.",
    categorySlug: "anillos",
    material: "ORO_BAJO",
    pricingMode: "BY_WEIGHT",
    weightGrams: 5.4,
    laborCost: 9000,
    stock: 7,
  },

  // ── Pulseras ─────────────────────────────────────────────────────
  {
    sku: "DVA-PUL-001",
    slug: "esclava-chata-oro-18k",
    name: "Esclava Chata Oro 18k",
    description: "Esclava de eslabón chato en oro 18k, 19cm.",
    categorySlug: "pulseras",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 5.9,
    laborCost: 14000,
    stock: 6,
  },
  {
    sku: "DVA-PUL-002",
    slug: "pulsera-tenis-enchapada",
    name: "Pulsera Tenis Enchapada",
    description: "Pulsera tenis enchapada en oro con circonias engarzadas.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 27500,
    compareAtPrice: 32000,
    stock: 11,
    isFeatured: true,
  },
];

export const announcementsData = [
  { text: "Envíos a todo el país · Retiro sin cargo en San Miguel", order: 0 },
  { text: "Hasta 6 cuotas con Mercado Pago", order: 1 },
  { text: "Descuento especial pagando por transferencia", order: 2 },
];

export const bannersData = [
  {
    title: "Nueva colección",
    subtitle: "Oro 18k con diseños exclusivos",
    imageUrl: "/banner1diamont.png",
    mobileImageUrl: "/banner1diamont.png",
    linkUrl: "/tienda?material=ORO_18K",
    order: 0,
  },
  {
    title: "Envíos a todo el país",
    subtitle: "Retirá gratis en San Miguel o recibilo en tu casa",
    imageUrl: "/banner2diamont.png",
    mobileImageUrl: "/banner2diamont.png",
    linkUrl: "/tienda",
    order: 1,
  },
];

export const couponData = {
  code: "BIENVENIDA10",
  type: "PERCENT" as const,
  value: 10,
  minPurchase: 20000,
  maxUses: 100,
};

export const settingsData: Record<string, unknown> = {
  goldPricePerGram18k: 95000,
  goldPricePerGramLow: 38000,
  storeName: "DIAMONDVA.Co",
  logoUrl: "/logo.png",
  // TODO: el dueño completa los datos reales desde el admin (Fase 4/7) —
  // estos son placeholders explícitos, no datos de contacto reales.
  whatsapp: "+54 9 11 0000-0000",
  email: "hola@diamondva.co",
  address: "San Miguel, Provincia de Buenos Aires, Argentina",
  instagram: "https://instagram.com/diamondva.co",
  facebook: "",
  businessHours: "Lunes a viernes 10 a 18 h · Sábados 10 a 13 h",
  shippingRates: { amba: 4500, interior: 7500, retiroLocal: 0 },
  freeShippingThreshold: 80000,
  transferDiscountPercent: 10,
  installmentsEnabled: true,
  installmentsCount: 6,
  heroTitle: "Piezas que se notan, brillo que perdura",
  heroSubtitle: "Enchapadas, oro bajo, oro 18k y plata 925. Envíos a todo el país.",
  aboutText:
    "DIAMONDVA.Co es una joyería de San Miguel, Buenos Aires, especializada en " +
    "joyas enchapadas, oro bajo, oro 18k y plata 925, con envíos a todo el país.",
  whatsappOrderTemplate: "Hola! Quiero consultar por *{{productName}}* — {{productUrl}}",
  maintenanceMode: false,
  // Transferencia bancaria (checkout, sección 4) — placeholders explícitos.
  bankAlias: "DIAMONDVA.MP",
  bankCbu: "0000003100000000000000",
  bankHolderName: "DIAMONDVA.Co",
};
