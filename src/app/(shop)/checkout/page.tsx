import type { Metadata } from "next";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { getPublicSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold text-bone">Checkout</h1>
      <CheckoutForm settings={settings} />
    </div>
  );
}
