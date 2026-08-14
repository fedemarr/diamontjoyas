import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveAnnouncements } from "@/lib/queries/marketing";
import { getPublicSettings } from "@/lib/queries/settings";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [categories, announcements, settings] = await Promise.all([
    getActiveCategories(),
    getActiveAnnouncements(),
    getPublicSettings(),
  ]);

  return (
    <>
      <Header
        categories={categories}
        announcements={announcements}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
