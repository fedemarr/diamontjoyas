"use client";

import type { Banner } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Hero con carrusel de banners editables (sección 4.3 del prompt
 * maestro). Los banners son piezas de diseño completas — ya traen su
 * propio título, bajada y botón dibujados adentro de la imagen — por eso
 * ESTE componente no le encima texto propio: solo la muestra entera,
 * clickeable, con los controles reales del carrusel bien separados para
 * no chocar con nada que ya esté en el gráfico.
 *
 * Sin banners activos, cae a un hero de texto con heroTitle/heroSubtitle
 * de Settings (esa rama sí necesita su propio texto, porque no hay imagen).
 *
 * Desktop y mobile pueden usar imágenes distintas (`imageUrl` /
 * `mobileImageUrl`) — medidas recomendadas en MANUAL-CLIENTE.md. Si el
 * admin no cargó una imagen de mobile propia, se recorta la de desktop
 * como respaldo (nunca queda una imagen rota).
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
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length, paused]);

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
            {heroSubtitle ?? "Enchapadas, oro bajo, oro 18k y plata 925. Envíos a todo el país."}
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
  const goTo = (i: number) => setIndex((i + banners.length) % banners.length);

  return (
    <section
      className="group relative w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {(() => {
        const hasOwnMobileImage =
          !!current.mobileImageUrl && current.mobileImageUrl !== current.imageUrl;

        return (
          <Link href={current.linkUrl ?? "/tienda"} className="relative block w-full">
            {/* Desktop/tablet — ratio panorámico (1536×341 ≈ 4.5:1, ver
                MANUAL-CLIENTE.md para las medidas exactas de banner). */}
            <div className="relative hidden aspect-[1536/341] max-h-[65vh] w-full sm:block">
              <Image
                key={`${current.id}-desktop`}
                src={current.imageUrl}
                alt={current.title}
                fill
                priority
                sizes="100vw"
                className="animate-in fade-in object-cover object-center duration-500"
              />
            </div>

            {/* Mobile — si hay una imagen propia para mobile (mobileImageUrl
                distinto del de desktop), se usa completa en formato
                retrato 4:5. Si no, se recorta la de desktop como respaldo
                (ancla a la izquierda, donde suele estar el texto). */}
            <div
              className={
                hasOwnMobileImage
                  ? "relative aspect-[4/5] w-full sm:hidden"
                  : "relative min-h-[220px] w-full sm:hidden"
              }
            >
              <Image
                key={`${current.id}-mobile`}
                src={hasOwnMobileImage ? current.mobileImageUrl! : current.imageUrl}
                alt={current.title}
                fill
                priority
                sizes="100vw"
                className={
                  hasOwnMobileImage
                    ? "animate-in fade-in object-cover object-center duration-500"
                    : "animate-in fade-in object-cover object-left duration-500"
                }
              />
            </div>
          </Link>
        );
      })()}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Banner anterior"
            className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-bone backdrop-blur transition-colors hover:bg-ink/80 hover:text-gold"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente banner"
            className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-bone backdrop-blur transition-colors hover:bg-ink/80 hover:text-gold"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Franja propia debajo de la imagen — a propósito, para no
              competir con los adornos que el diseño ya tiene encima. */}
          <div className="flex items-center justify-center gap-1.5 border-t border-ink-border bg-ink py-3">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver banner ${i + 1}: ${b.title}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold" : "w-1.5 bg-ink-border hover:bg-silver"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
