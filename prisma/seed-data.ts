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
    description: "Cadenas en oro 18k, oro bajo, enchapado y acero quirúrgico.",
    icon: "link",
    order: 0,
    imageUrl: placeholder("Cadenas", "600x400"),
  },
  {
    name: "Anillos y Sellos",
    slug: "anillos-y-sellos",
    description: "Anillos y sellos grabables en distintos materiales.",
    icon: "circle",
    order: 1,
    imageUrl: placeholder("Anillos y Sellos", "600x400"),
  },
  {
    name: "Dijes",
    slug: "dijes",
    description: "Dijes para combinar con tu cadena favorita.",
    icon: "gem",
    order: 2,
    imageUrl: placeholder("Dijes", "600x400"),
  },
  {
    name: "Pulseras y Esclavas",
    slug: "pulseras-y-esclavas",
    description: "Pulseras, esclavas y tenis en oro y enchapado.",
    icon: "circle-dot",
    order: 3,
    imageUrl: placeholder("Pulseras y Esclavas", "600x400"),
  },
  {
    name: "Aros",
    slug: "aros",
    description: "Aros de todos los días y para ocasiones especiales.",
    icon: "disc",
    order: 4,
    imageUrl: placeholder("Aros", "600x400"),
  },
  {
    name: "Conjuntos",
    slug: "conjuntos",
    description: "Sets combinados listos para regalar.",
    icon: "layers",
    order: 5,
    imageUrl: placeholder("Conjuntos", "600x400"),
  },
  {
    name: "Alianzas",
    slug: "alianzas",
    description: "Alianzas de casamiento en oro 18k y enchapado.",
    icon: "infinity",
    order: 6,
    imageUrl: placeholder("Alianzas", "600x400"),
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
    | "PLATA_925"
    | "ACERO_QUIRURGICO";
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

  // ── Anillos y Sellos ────────────────────────────────────────────────
  {
    sku: "DVA-ANI-001",
    slug: "sello-oro-18k-iniciales",
    name: "Sello Oro 18k Iniciales",
    description: "Sello en oro 18k para grabar iniciales, base chata.",
    categorySlug: "anillos-y-sellos",
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
    categorySlug: "anillos-y-sellos",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 18500,
    stock: 20,
  },
  {
    sku: "DVA-ANI-003",
    slug: "anillo-minimalista-acero",
    name: "Anillo Minimalista Acero Quirúrgico",
    description: "Anillo liso minimalista en acero quirúrgico, no se oxida.",
    categorySlug: "anillos-y-sellos",
    material: "ACERO_QUIRURGICO",
    pricingMode: "FIXED",
    price: 9800,
    stock: 30,
  },
  {
    sku: "DVA-ANI-004",
    slug: "sello-oro-bajo-grabado",
    name: "Sello Oro Bajo Grabado",
    description: "Sello en oro bajo con guarda grabada en el contorno.",
    categorySlug: "anillos-y-sellos",
    material: "ORO_BAJO",
    pricingMode: "BY_WEIGHT",
    weightGrams: 5.4,
    laborCost: 9000,
    stock: 7,
  },

  // ── Dijes ────────────────────────────────────────────────────────────
  {
    sku: "DVA-DIJ-001",
    slug: "dije-corazon-oro-18k",
    name: "Dije Corazón Oro 18k",
    description: "Dije corazón liso en oro 18k, ideal para regalo.",
    categorySlug: "dijes",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 2.1,
    laborCost: 9000,
    stock: 8,
    isFeatured: true,
  },
  {
    sku: "DVA-DIJ-002",
    slug: "dije-cruz-enchapada",
    name: "Dije Cruz Enchapada",
    description: "Dije cruz enchapado en oro, terminación brillante.",
    categorySlug: "dijes",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 8900,
    stock: 25,
  },
  {
    sku: "DVA-DIJ-003",
    slug: "dije-inicial-plata-925",
    name: "Dije Inicial Plata 925",
    description: "Dije con inicial a elección en plata 925.",
    categorySlug: "dijes",
    material: "PLATA_925",
    pricingMode: "FIXED",
    price: 7200,
    stock: 18,
  },

  // ── Pulseras y Esclavas ─────────────────────────────────────────────
  {
    sku: "DVA-PUL-001",
    slug: "esclava-chata-oro-18k",
    name: "Esclava Chata Oro 18k",
    description: "Esclava de eslabón chato en oro 18k, 19cm.",
    categorySlug: "pulseras-y-esclavas",
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
    categorySlug: "pulseras-y-esclavas",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 27500,
    compareAtPrice: 32000,
    stock: 11,
    isFeatured: true,
  },
  {
    sku: "DVA-PUL-003",
    slug: "pulsera-acero-quirurgico",
    name: "Pulsera Acero Quirúrgico",
    description: "Pulsera cadena en acero quirúrgico, ajustable.",
    categorySlug: "pulseras-y-esclavas",
    material: "ACERO_QUIRURGICO",
    pricingMode: "FIXED",
    price: 11500,
    stock: 22,
  },

  // ── Aros ─────────────────────────────────────────────────────────────
  {
    sku: "DVA-ARO-001",
    slug: "aros-argolla-oro-18k",
    name: "Aros Argolla Oro 18k",
    description: "Argollas lisas en oro 18k, 12mm de diámetro.",
    categorySlug: "aros",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 3.4,
    laborCost: 11000,
    stock: 9,
  },
  {
    sku: "DVA-ARO-002",
    slug: "aros-abridores-enchapados",
    name: "Aros Abridores Enchapados",
    description: "Aros abridores enchapados en oro, uso diario.",
    categorySlug: "aros",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 6500,
    stock: 28,
  },
  {
    sku: "DVA-ARO-003",
    slug: "aros-perlas-plata-925",
    name: "Aros Perlas Plata 925",
    description: "Aros colgantes con perla cultivada, base plata 925.",
    categorySlug: "aros",
    material: "PLATA_925",
    pricingMode: "FIXED",
    price: 9900,
    stock: 15,
  },

  // ── Conjuntos ────────────────────────────────────────────────────────
  {
    sku: "DVA-CJT-001",
    slug: "conjunto-collar-aros-enchapado",
    name: "Conjunto Collar y Aros Enchapado",
    description: "Set de collar corto y aros a juego, enchapado en oro.",
    categorySlug: "conjuntos",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 21900,
    compareAtPrice: 26000,
    stock: 8,
    isFeatured: true,
  },
  {
    sku: "DVA-CJT-002",
    slug: "conjunto-dije-cadena-oro-bajo",
    name: "Conjunto Dije y Cadena Oro Bajo",
    description: "Dije corazón con su cadena a juego, en oro bajo.",
    categorySlug: "conjuntos",
    material: "ORO_BAJO",
    pricingMode: "BY_WEIGHT",
    weightGrams: 4.6,
    laborCost: 7000,
    stock: 6,
  },

  // ── Alianzas ─────────────────────────────────────────────────────────
  {
    sku: "DVA-ALZ-001",
    slug: "alianza-clasica-oro-18k",
    name: "Alianza Clásica Oro 18k",
    description: "Alianza clásica lisa en oro 18k, 4mm de ancho (par).",
    categorySlug: "alianzas",
    material: "ORO_18K",
    pricingMode: "BY_WEIGHT",
    weightGrams: 9.5,
    laborCost: 26000,
    stock: 4,
    isFeatured: true,
  },
  {
    sku: "DVA-ALZ-002",
    slug: "alianza-texturada-enchapada",
    name: "Alianza Texturada Enchapada",
    description: "Alianza con textura martillada, enchapado en oro.",
    categorySlug: "alianzas",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: 15900,
    stock: 12,
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
    imageUrl: blankPlaceholder("1600x600"),
    mobileImageUrl: blankPlaceholder("800x1000"),
    linkUrl: "/tienda?material=ORO_18K",
    order: 0,
  },
  {
    title: "Envíos a todo el país",
    subtitle: "Retirá gratis en San Miguel o recibilo en tu casa",
    imageUrl: blankPlaceholder("1600x600"),
    mobileImageUrl: blankPlaceholder("800x1000"),
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
  logoUrl: placeholder("DIAMONDVA.Co", "400x400"),
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
  heroSubtitle: "Enchapadas, oro bajo y oro 18k. Envíos a todo el país.",
  aboutText:
    "DIAMONDVA.Co es una joyería de San Miguel, Buenos Aires, especializada en " +
    "joyas enchapadas, oro bajo y oro 18k, con envíos a todo el país.",
  whatsappOrderTemplate: "Hola! Quiero consultar por *{{productName}}* — {{productUrl}}",
  maintenanceMode: false,
  // Transferencia bancaria (checkout, sección 4) — placeholders explícitos.
  bankAlias: "DIAMONDVA.MP",
  bankCbu: "0000003100000000000000",
  bankHolderName: "DIAMONDVA.Co",
};
