import type { Metadata } from "next";

import { AboutSection } from "@/components/shop/about-section";
import { CategoryGrid } from "@/components/shop/category-grid";
import { CustomChainSection } from "@/components/shop/custom-chain-section";
import { HomeHero } from "@/components/shop/home-hero";
import { InstagramFeed } from "@/components/shop/instagram-feed";
import { ProductRail } from "@/components/shop/product-rail";
import { TrustBadges } from "@/components/shop/trust-badges";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBanners } from "@/lib/queries/marketing";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getPublicSettings } from "@/lib/queries/settings";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Inicio",
};

export const revalidate = 60;

export default async function HomePage() {
  const [banners, settings, categories, featured] = await Promise.all([
    getActiveBanners(),
    getPublicSettings(),
    getActiveCategories(),
    getFeaturedProducts(10),
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

      <AboutSection aboutText={settings.aboutText} />

      <CustomChainSection />

      <InstagramFeed
        handle={siteConfig.instagram.handle}
        profileUrl={settings.instagram ?? siteConfig.instagram.url}
      />
    </>
  );
}
