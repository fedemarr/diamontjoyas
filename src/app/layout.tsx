import type { Metadata } from "next";

import { cormorant, inter } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Joyería de alta gama`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

/**
 * Layout raíz: solo shell HTML, fuentes y metadata compartida.
 * El header/footer público vive en `(shop)/layout.tsx` — el admin
 * (Fase 3+) va a tener su propio layout con sidebar, sin estos.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-bone">{children}</body>
    </html>
  );
}
