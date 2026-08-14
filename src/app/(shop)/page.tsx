import type { Metadata } from "next";

import { CategoryGrid } from "@/components/shop/category-grid";
import { GoldSection } from "@/components/shop/gold-section";
import { HomeHero } from "@/components/shop/home-hero";
import { InstagramFeed } from "@/components/shop/instagram-feed";
import { ProductRail } from "@/components/shop/product-rail";
import { TrustBadges } from "@/components/shop/trust-badges";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBanners } from "@/lib/queries/marketing";
import { getFeaturedProducts, getGold18kProducts } from "@/lib/queries/products";
import { getPublicSettings } from "@/lib/queries/settings";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Inicio",
};

export const revalidate = 60;

export default async function HomePage() {
  const [banners, settings, categories, featured, gold18k] = await Promise.all([
    getActiveBanners(),
    getPublicSettings(),
    getActiveCategories(),
    getFeaturedProducts(10),
    getGold18kProducts(10),
  ]);

  return (
    <>
      <HomeHero banners={banners} heroTitle={settings.heroTitle} heroSubtitle={settings.heroSubtitle} />

      <TrustBadges
        installmentsEnabled={settings.installmentsEnabled}
        installmentsCount={settings.installmentsCount}
      />

      <CategoryGrid categories={categories} />

      <ProductRail
        title="Últimos ingresos"
        subtitle="Lo más nuevo de DIAMONDVA.Co"
        products={featured}
        viewAllHref="/tienda"
      />

      <GoldSection products={gold18k} />

      <InstagramFeed
        handle={siteConfig.instagram.handle}
        profileUrl={settings.instagram ?? siteConfig.instagram.url}
      />
    </>
  );
}
