import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/shop/contact-form";
import { getPublicSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por cualquier consulta sobre nuestras joyas, envíos o personalizaciones. DIAMONDVA.Co — San Miguel, Buenos Aires.",
};

export default async function ContactoPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Consultanos
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-bone sm:text-4xl">
          Estamos para ayudarte
        </h1>
        <p className="mt-3 max-w-xl text-sm text-silver">
          ¿Dudas sobre una pieza, medidas, envíos o una compra especial? Dejanos tu mensaje y te
          respondemos a la brevedad.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">Información</h2>
            <p className="mt-2 text-sm text-silver">
              Preferís hablar directo? Escribinos por WhatsApp o visitanos en San Miguel.
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-silver">
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-success"
                >
                  <MessageCircle className="size-4 text-gold" />
                  {settings.whatsapp}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-ink-border bg-ink-soft p-6">
          <ContactForm
            whatsapp={settings.whatsapp}
            email={settings.email}
            address={settings.address}
            businessHours={settings.businessHours}
            instagram={settings.instagram}
          />
        </div>
      </div>
    </div>
  );
}
