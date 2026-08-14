import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { getProductPrice, type GoldPrices } from "../src/lib/pricing";
import {
  announcementsData,
  bannersData,
  categoriesData,
  couponData,
  productsData,
  settingsData,
} from "./seed-data";

const db = new PrismaClient();

const BCRYPT_COST = 12;

function placeholderFor(text: string, size = "800x800") {
  // .png explícito — ver el mismo comentario en seed-data.ts.
  return `https://placehold.co/${size}/0B0B0C/C9A227.png?text=${encodeURIComponent(text)}`;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Faltan ADMIN_EMAIL / ADMIN_PASSWORD en .env — completalos antes de correr el seed."
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Admin DIAMONDVA",
      role: "ADMIN",
    },
  });

  console.log(`✔ Usuario ADMIN listo (${email}) — cambiar la contraseña en el primer login.`);
}

async function seedSettings() {
  for (const [key, value] of Object.entries(settingsData)) {
    await db.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });
  }
  console.log(`✔ ${Object.keys(settingsData).length} Settings cargados.`);
}

async function seedCategories() {
  const bySlug = new Map<string, string>();

  for (const cat of categoriesData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        imageUrl: cat.imageUrl,
      },
      create: cat,
    });
    bySlug.set(cat.slug, created.id);
  }

  console.log(`✔ ${categoriesData.length} categorías cargadas.`);
  return bySlug;
}

async function seedProducts(categoryIdBySlug: Map<string, string>, goldPrices: GoldPrices) {
  for (const p of productsData) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) {
      throw new Error(`Categoría "${p.categorySlug}" no encontrada para el producto ${p.sku}`);
    }

    // Precio de venta estimado con los Settings de este seed, solo para
    // derivar un costo interno de ejemplo (margen ~45%) — el precio real
    // en el sistema siempre se recalcula en runtime con getProductPrice().
    const estimatedPrice = getProductPrice(
      {
        pricingMode: p.pricingMode,
        material: p.material,
        price: p.price,
        weightGrams: p.weightGrams,
        laborCost: p.laborCost,
      },
      goldPrices
    );
    const cost = estimatedPrice.times(0.55).toDecimalPlaces(2);

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId,
        material: p.material,
        pricingMode: p.pricingMode,
        price: p.price ?? null,
        weightGrams: p.weightGrams ?? null,
        laborCost: p.laborCost ?? null,
        compareAtPrice: p.compareAtPrice ?? null,
        cost,
        stock: p.stock,
        isFeatured: p.isFeatured ?? false,
      },
      create: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        description: p.description,
        categoryId,
        material: p.material,
        pricingMode: p.pricingMode,
        price: p.price ?? null,
        weightGrams: p.weightGrams ?? null,
        laborCost: p.laborCost ?? null,
        compareAtPrice: p.compareAtPrice ?? null,
        cost,
        stock: p.stock,
        lowStockAlert: 3,
        isFeatured: p.isFeatured ?? false,
      },
    });

    const existingImages = await db.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await db.productImage.createMany({
        data: [
          {
            productId: product.id,
            url: placeholderFor(`${p.name} — Vista 1`),
            alt: `${p.name} — foto principal`,
            order: 0,
            isPrimary: true,
          },
          {
            productId: product.id,
            url: placeholderFor(`${p.name} — Vista 2`),
            alt: `${p.name} — vista de detalle`,
            order: 1,
            isPrimary: false,
          },
        ],
      });
    }
  }

  console.log(`✔ ${productsData.length} productos cargados (con imágenes placeholder).`);
}

async function seedAnnouncements() {
  for (const a of announcementsData) {
    const existing = await db.announcement.findFirst({ where: { text: a.text } });
    if (!existing) {
      await db.announcement.create({ data: a });
    }
  }
  console.log(`✔ ${announcementsData.length} anuncios cargados.`);
}

async function seedBanners() {
  for (const b of bannersData) {
    const existing = await db.banner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await db.banner.create({ data: b });
    }
  }
  console.log(`✔ ${bannersData.length} banners cargados.`);
}

async function seedCoupon() {
  await db.coupon.upsert({
    where: { code: couponData.code },
    update: {},
    create: {
      code: couponData.code,
      type: couponData.type,
      value: couponData.value,
      minPurchase: couponData.minPurchase,
      maxUses: couponData.maxUses,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✔ Cupón de ejemplo "${couponData.code}" listo.`);
}

async function main() {
  console.log("Corriendo seed de DIAMONDVA.Co…\n");

  await seedAdmin();
  await seedSettings();

  const goldPrices: GoldPrices = {
    goldPricePerGram18k: new Prisma.Decimal(settingsData.goldPricePerGram18k as number),
    goldPricePerGramLow: new Prisma.Decimal(settingsData.goldPricePerGramLow as number),
  };

  const categoryIdBySlug = await seedCategories();
  await seedProducts(categoryIdBySlug, goldPrices);
  await seedAnnouncements();
  await seedBanners();
  await seedCoupon();

  console.log("\n✔ Seed completo.");
}

main()
  .catch((error) => {
    console.error("✖ Seed falló:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
