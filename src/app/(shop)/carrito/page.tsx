import type { Metadata } from "next";

import { CartContents } from "@/components/shop/cart-contents";
import { getPublicSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "Carrito" };

export default async function CarritoPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-bone">Tu carrito</h1>
      <CartContents freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
