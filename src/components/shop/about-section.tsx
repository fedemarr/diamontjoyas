"use client";

import { Shield, Sparkles, Heart } from "lucide-react";

interface AboutSectionProps {
  aboutText: string | null;
}

export function AboutSection({ aboutText }: AboutSectionProps) {
  const defaultText =
    "En DIAMONDVA.Co nos especializamos en crear joyas que combinan elegancia y accesibilidad. Cada pieza está diseñada para que brilles sin importar la ocasión.";

  return (
    <section className="relative overflow-hidden bg-ink py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.04),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <span className="mb-4 inline-block text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Sobre nosotros
        </span>

        <h2 className="font-display text-3xl font-semibold leading-tight text-bone md:text-4xl">
          Joyas que cuentan tu historia
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-silver md:text-lg">
          {aboutText ?? defaultText}
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <Sparkles className="size-5 text-gold" />
            </div>
            <h3 className="font-display text-lg font-semibold text-bone">Calidad</h3>
            <p className="text-sm text-silver">
              Trabajamos con materiales de primera para que cada pieza luzca y dure.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <Heart className="size-5 text-gold" />
            </div>
            <h3 className="font-display text-lg font-semibold text-bone">Pasión</h3>
            <p className="text-sm text-silver">
              Amamos lo que hacemos y eso se nota en cada detalle de nuestras joyas.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <Shield className="size-5 text-gold" />
            </div>
            <h3 className="font-display text-lg font-semibold text-bone">Garantía</h3>
            <p className="text-sm text-silver">
              Cada compra cuenta con nuestra garantía de satisfacción.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}