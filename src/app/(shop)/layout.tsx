import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import { PromoPopup } from "@/components/shop/promo-popup";
import { auth } from "@/lib/auth";
import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveAnnouncements } from "@/lib/queries/marketing";
import { getPublicSettings } from "@/lib/queries/settings";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [categories, announcements, settings, session] = await Promise.all([
    getActiveCategories(),
    getActiveAnnouncements(),
    getPublicSettings(),
    auth(),
  ]);

  const customerName = session?.user?.kind === "customer" ? (session.user.name ?? "") : null;

  return (
    <>
      <Header
        categories={categories}
        announcements={announcements}
        freeShippingThreshold={settings.freeShippingThreshold}
        customerName={customerName}
      />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} settings={settings} />
      <PromoPopup
        enabled={settings.popupEnabled}
        title={settings.popupTitle}
        message={settings.popupMessage}
        imageUrl={settings.popupImageUrl}
        linkUrl={settings.popupLinkUrl}
        buttonText={settings.popupButtonText}
      />
    </>
  );
}
