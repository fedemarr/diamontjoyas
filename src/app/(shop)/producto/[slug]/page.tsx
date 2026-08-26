import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductInfoAccordion } from "@/components/shop/product-info-accordion";
import { ProductRail } from "@/components/shop/product-rail";
import { PurchasePanel } from "@/components/shop/purchase-panel";
import { formatARS } from "@/lib/format";
import { MATERIAL_LABELS } from "@/lib/materials";
import { getProductBySlug, getRelatedProducts, incrementProductViews } from "@/lib/queries/products";
import { buildWhatsappUrl, getPublicSettings } from "@/lib/queries/settings";
import { safeJsonLd } from "@/lib/sanitize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.metaTitle || product.name;
  const description =
    product.metaDescription || product.description || `${product.name} — DIAMONDVA.Co`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  incrementProductViews(product.id);

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getPublicSettings(),
  ]);

  const whatsappMessage = settings.whatsappOrderTemplate
    .replace("{{productName}}", product.name)
    .replace(
      "{{productUrl}}",
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/producto/${product.slug}`
    );
  const whatsappUrl = buildWhatsappUrl(settings.whatsapp, whatsappMessage);

  const transferPrice =
    settings.transferDiscountPercent > 0
      ? product.currentPrice * (1 - settings.transferDiscountPercent / 100)
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.currentPrice,
      availability:
        product.trackStock && product.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* JSON-LD estático, no viene de input de usuario */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-silver">
        <span>{product.category.name}</span> <span className="mx-1">/</span>{" "}
        <span className="text-bone">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          productName={product.name}
        />

        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
              {MATERIAL_LABELS[product.material] ?? product.material}
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold text-bone sm:text-4xl">
              {product.name}
            </h1>
            {product.pricingMode === "BY_WEIGHT" && product.weightGrams != null && (
              <p className="mt-2 text-sm text-silver">
                Peso: {product.weightGrams.toString()}g
              </p>
            )}
          </div>

          {product.installments3xTotal != null && (
            <p className="text-sm text-silver">
              3 cuotas sin interés de{" "}
              <span className="font-medium text-bone">
                {formatARS(product.installments3xTotal.toNumber() / 3)}
              </span>
            </p>
          )}

          <PurchasePanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            sku={product.sku}
            image={product.images[0]?.url ?? null}
            basePrice={product.currentPrice}
            variants={product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceDelta: v.priceDelta.toNumber(),
              stock: v.stock,
              isActive: v.isActive,
            }))}
            stock={product.stock}
            trackStock={product.trackStock}
            lowStockAlert={product.lowStockAlert}
            whatsappUrl={whatsappUrl}
          />

          {product.installments3xTotal != null ? (
            <p className="-mt-4 text-sm font-medium text-success">efectivo / transferencia</p>
          ) : (
            transferPrice != null && (
              <p className="text-sm text-success">
                {formatARS(transferPrice)} pagando por transferencia (
                {settings.transferDiscountPercent}% off)
              </p>
            )
          )}
          {product.installments3xTotal == null && settings.installmentsEnabled && (
            <p className="text-sm text-silver">
              Hasta {settings.installmentsCount} cuotas con Mercado Pago
            </p>
          )}

          <ProductInfoAccordion
            description={product.description}
            shippingRates={settings.shippingRates}
          />
        </div>
      </div>

      <ProductRail title="También te puede interesar" products={related} className="px-0" />
    </div>
  );
}
