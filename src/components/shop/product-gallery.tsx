"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt: string;
}

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-ink-border bg-ink-soft">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-silver">
            {productName} — sin foto todavía
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1} de ${productName}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border transition-colors",
                i === active ? "border-gold" : "border-ink-border hover:border-silver"
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
