"use client";

import type { Banner } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Hero con carrusel de banners editables (sección 4.3 del prompt
 * maestro). Sin banners activos, cae a un hero de texto usando
 * heroTitle/heroSubtitle de Settings.
 */
export function HomeHero({
  banners,
  heroTitle,
  heroSubtitle,
}: {
  banners: Banner[];
  heroTitle: string | null;
  heroSubtitle: string | null;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="relative flex min-h-[calc(100vh-9rem)] items-center justify-center overflow-hidden px-4 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08),transparent_60%)]"
        />
        <div
          className="animate-in fade-in duration-700 relative flex max-w-2xl flex-col items-center gap-6"
          aria-label={heroTitle ?? "Bienvenida"}
        >
          <span className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Joyería de alta gama · San Miguel, Buenos Aires
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-bone sm:text-5xl md:text-6xl">
            {heroTitle ?? "Piezas que se notan, brillo que perdura"}
          </h1>
          <p className="max-w-md text-base text-silver">
            {heroSubtitle ?? "Enchapadas, oro bajo y oro 18k. Envíos a todo el país."}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-gold text-ink hover:opacity-90">
              <Link href="/tienda">Ver la tienda</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-border bg-transparent text-bone hover:border-gold hover:text-gold"
            >
              <Link href="/contacto">Consultanos</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const current = banners[index];

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      <div key={current.id} className="animate-in fade-in duration-500 absolute inset-0">
        <Image
          src={current.imageUrl}
          alt={current.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 px-4 pb-16 text-center">
          <h1 className="font-display text-3xl font-semibold text-bone sm:text-5xl">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="max-w-md text-sm text-silver sm:text-base">{current.subtitle}</p>
          )}
          <Button asChild size="lg" className="bg-gradient-gold text-ink hover:opacity-90">
            <Link href={current.linkUrl ?? "/tienda"}>Ver más</Link>
          </Button>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-1.5 bg-bone/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
