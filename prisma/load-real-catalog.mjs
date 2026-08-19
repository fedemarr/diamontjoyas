// Script de una sola vez: carga el catálogo real de DIAMONDVA.Co (24
// piezas, del PDF que mandó el cliente) y desactiva los ~21 productos de
// prueba del seed inicial. Corrido una vez, no forma parte del build.
import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();

const products = [
  // ── Pulseras ──────────────────────────────────────────────────────────
  {
    sku: "DVA-PUL-J01",
    slug: "pulsera-juliana",
    name: "Pulsera Juliana",
    description: "Enchapado en oro 18k, con cierre marinero.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 65000,
    image: "/products/pulsera-juliana.jpg",
  },
  {
    sku: "DVA-PUL-DG1",
    slug: "pulsera-doble-groumet-enchapada",
    name: "Pulseras Doble Groumet",
    description: "Enchapado en oro 18k, con cierre marinero.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 70000,
    image: "/products/pulsera-doble-groumet-enchapada.jpg",
  },
  {
    sku: "DVA-PUL-PA1",
    slug: "pulsera-paris",
    name: "Pulsera Paris",
    description: "Enchapado en oro 18k, con cierre marinero.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 65000,
    image: "/products/pulsera-paris.jpg",
  },
  {
    sku: "DVA-PUL-TB1",
    slug: "pulsera-tourbillon-enchapada",
    name: "Pulsera Tourbillon",
    description: "Enchapado en oro 18k, con cierre tubo.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 65000,
    image: "/products/pulsera-tourbillon-enchapada.jpg",
  },
  {
    sku: "DVA-PUL-VVS1",
    slug: "pulsera-vvs-40k",
    name: "Pulsera VVS",
    description: "Enchapado en oro 18k.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 40000,
    image: "/products/pulsera-vvs-1.jpg",
  },
  {
    sku: "DVA-PUL-VVS2",
    slug: "pulsera-vvs-50k",
    name: "Pulsera VVS",
    description: "Enchapado en oro 18k.",
    categorySlug: "pulseras",
    material: "ENCHAPADO",
    price: 50000,
    image: "/products/pulsera-vvs-2.jpg",
  },
  {
    sku: "DVA-PUL-DG2",
    slug: "pulsera-doble-groumet-plata",
    name: "Pulsera Doble Groumet",
    description: "Plata 925.",
    categorySlug: "pulseras",
    material: "PLATA_925",
    price: 130000,
    image: "/products/pulsera-doble-groumet-plata.jpg",
  },
  {
    sku: "DVA-PUL-TB2",
    slug: "pulsera-tourbillon-plata",
    name: "Pulsera Tourbillon",
    description: "Plata 925.",
    categorySlug: "pulseras",
    material: "PLATA_925",
    price: 130000,
    image: "/products/pulsera-tourbillon-plata.jpg",
  },

  // ── Cadenas ──────────────────────────────────────────────────────────
  {
    sku: "DVA-CAD-FD1",
    slug: "cadena-figaro-dije",
    name: "Cadena Fígaro + Dije",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 60000,
    image: "/products/cadena-figaro-dije.jpg",
  },
  {
    sku: "DVA-CAD-CU1",
    slug: "cadena-cubana",
    name: "Cadena Cubana",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 60000,
    image: "/products/cadena-cubana.jpg",
  },
  {
    sku: "DVA-CAD-RO1",
    slug: "rosario",
    name: "Rosario",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 55000,
    image: "/products/rosario.jpg",
  },
  {
    sku: "DVA-CAD-DG1",
    slug: "cadena-doble-groumet",
    name: "Cadena Doble Groumet",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 140000,
    image: "/products/cadena-doble-groumet.jpg",
  },
  {
    sku: "DVA-CAD-JU1",
    slug: "cadena-juliana-enchapada",
    name: "Cadena Juliana",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 140000,
    image: "/products/cadena-juliana-enchapada.jpg",
  },
  {
    sku: "DVA-CAD-PA1",
    slug: "cadena-paris",
    name: "Cadena Paris",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 135000,
    image: "/products/cadena-paris.jpg",
  },
  {
    sku: "DVA-CAD-TR1",
    slug: "cadena-trebol",
    name: "Cadena Trébol",
    description: "Enchapado en oro 18k.",
    categorySlug: "cadenas",
    material: "ENCHAPADO",
    price: 55000,
    image: "/products/cadena-trebol.jpg",
  },
  {
    sku: "DVA-CAD-TB1",
    slug: "cadena-tourbillon-plata",
    name: "Cadena Tourbillon",
    description: "Plata 925.",
    categorySlug: "cadenas",
    material: "PLATA_925",
    price: 230000,
    image: "/products/cadena-tourbillon-plata.jpg",
  },
  {
    sku: "DVA-CAD-JU2",
    slug: "cadena-juliana-plata",
    name: "Cadena Juliana",
    description: "Plata 925.",
    categorySlug: "cadenas",
    material: "PLATA_925",
    price: 200000,
    image: "/products/cadena-juliana-plata.jpg",
  },
  {
    sku: "DVA-CAD-SO1",
    slug: "cadena-soga",
    name: "Cadena Soga",
    description: "Plata 925.",
    categorySlug: "cadenas",
    material: "PLATA_925",
    price: 150000,
    image: "/products/cadena-soga.jpg",
  },

  // ── Anillos ──────────────────────────────────────────────────────────
  {
    sku: "DVA-ANI-LI1",
    slug: "anillo-liso",
    name: "Anillo Liso",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 40000,
    image: "/products/anillo-liso.jpg",
  },
  {
    sku: "DVA-ANI-SB1",
    slug: "anillo-san-benito",
    name: "Anillo San Benito",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 40000,
    image: "/products/anillo-san-benito.jpg",
  },
  {
    sku: "DVA-ANI-VVS1",
    slug: "anillo-vvs",
    name: "Anillo VVS",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 35000,
    image: "/products/anillo-vvs.jpg",
  },
  {
    sku: "DVA-ANI-TP1",
    slug: "anillo-todo-pasa",
    name: "Anillo Todo Pasa",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 65000,
    image: "/products/anillo-todo-pasa.jpg",
  },
  {
    sku: "DVA-ANI-RX1",
    slug: "anillo-rolex",
    name: "Anillo Rolex",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 55000,
    image: "/products/anillo-rolex.jpg",
  },
  {
    sku: "DVA-ANI-UC1",
    slug: "anillo-ultima-cena",
    name: "Anillo Última Cena",
    description: "Enchapado en oro 18k.",
    categorySlug: "anillos",
    material: "ENCHAPADO",
    price: 35000,
    image: "/products/anillo-ultima-cena.jpg",
  },
];

async function main() {
  // 1) Desactivar los productos de prueba del seed inicial (todo lo que
  // no sea uno de los 24 SKUs del catálogo real de arriba).
  const realSkus = products.map((p) => p.sku);
  const deactivated = await db.product.updateMany({
    where: { sku: { notIn: realSkus }, isActive: true },
    data: { isActive: false },
  });
  console.log(`✔ ${deactivated.count} productos de prueba desactivados.`);

  const categories = await db.category.findMany({ where: { deletedAt: null } });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let updated = 0;

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Categoría ${p.categorySlug} no encontrada`);

    const data = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      categoryId,
      material: p.material,
      pricingMode: "FIXED",
      price: new Prisma.Decimal(p.price),
      weightGrams: null,
      laborCost: null,
      cost: new Prisma.Decimal(Math.round(p.price * 0.55)),
      stock: 5,
      lowStockAlert: 2,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    };

    const existing = await db.product.findUnique({ where: { sku: p.sku } });
    let productId;
    if (existing) {
      await db.product.update({ where: { sku: p.sku }, data });
      productId = existing.id;
      updated++;
    } else {
      const row = await db.product.create({ data: { ...data, sku: p.sku } });
      productId = row.id;
      created++;
    }

    await db.productImage.deleteMany({ where: { productId } });
    await db.productImage.create({
      data: { productId, url: p.image, alt: p.name, order: 0, isPrimary: true },
    });
  }

  console.log(`✔ Productos: ${created} creados, ${updated} actualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
