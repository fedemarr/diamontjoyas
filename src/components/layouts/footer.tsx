import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { legalLinks, siteConfig } from "@/lib/site-config";
import type { PublicSettings } from "@/lib/queries/settings";

const paymentMethods = ["Mercado Pago", "Transferencia bancaria", "Efectivo en local"];

/** lucide-react ya no incluye íconos de marcas (Instagram, etc.) — SVG propio. */
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer({
  categories,
  settings,
}: {
  categories: { name: string; slug: string }[];
  settings: PublicSettings;
}) {
  const year = new Date().getFullYear();
  const instagramUrl = settings.instagram ?? siteConfig.instagram.url;

  return (
    <footer className="border-t border-ink-border bg-ink text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Marca */}
        <div className="lg:col-span-2">
          <Image
            src="/logo.png"
            alt="DIAMONDVA.Co"
            width={180}
            height={60}
            className="h-14 w-auto object-contain"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver">
            {settings.aboutText ?? siteConfig.description}
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-silver">
            <MapPin className="size-4 shrink-0 text-gold" />
            <span>{settings.address ?? siteConfig.location}</span>
          </div>
          {instagramUrl && (
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-silver transition-colors hover:text-gold"
            >
              <InstagramIcon className="size-4 text-gold" />
              {siteConfig.instagram.handle}
            </Link>
          )}
        </div>

        {/* Tienda */}
        <div>
          <h3 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Tienda
          </h3>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categoria/${c.slug}`}
                  className="text-sm text-silver transition-colors hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ayuda */}
        <div>
          <h3 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Ayuda
          </h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                href="/contacto"
                className="text-sm text-silver transition-colors hover:text-gold"
              >
                Contacto
              </Link>
            </li>
            {legalLinks.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/legales/${l.slug}`}
                  className="text-sm text-silver transition-colors hover:text-gold"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Novedades
          </h3>
          <p className="mt-4 text-sm text-silver">
            Enterate de nuevos ingresos y promos.
          </p>
          {/* TODO(Fase 7/8): conectar a un endpoint real de suscripción */}
          <form className="mt-4 flex gap-2">
            <Input
              type="email"
              placeholder="Tu email"
              className="border-ink-border bg-ink-soft text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
            />
            <Button className="shrink-0 bg-gradient-gold text-ink hover:opacity-90">
              Sumarme
            </Button>
          </form>
        </div>
      </div>

      <Separator className="bg-ink-border" />

      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-xs text-silver">
          © {year} {settings.storeName} — Todos los derechos reservados.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {paymentMethods.map((method) => (
            <li key={method} className="text-xs tracking-wide text-silver">
              {method}
            </li>
          ))}
        </ul>
      </div>

      <Separator className="bg-ink-border" />

      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4">
        <a
          href="https://www.instagram.com/fmcode.agency/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-silver/70 transition-colors hover:text-gold"
        >
          Powered by fmcode.agency
        </a>
      </div>
    </footer>
  );
}
