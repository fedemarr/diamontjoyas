import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import type { PublicProductWithPrice } from "@/lib/queries/products";
import { cn } from "@/lib/utils";

/**
 * Carrusel horizontal simple (scroll-snap nativo, sin librería de JS) —
 * "Últimos ingresos" / "Oro 18k" (sección 4 del prompt maestro).
 */
export function ProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
  className,
}: {
  title: string;
  subtitle?: string;
  products: PublicProductWithPrice[];
  viewAllHref?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn("mx-auto max-w-7xl px-4 py-14", className)}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-bone sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-silver">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 text-sm font-medium text-gold-light hover:text-gold sm:block"
          >
            Ver todo →
          </Link>
        )}
      </div>

      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-44 shrink-0 snap-start sm:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="mt-4 block text-center text-sm font-medium text-gold-light hover:text-gold sm:hidden"
        >
          Ver todo →
        </Link>
      )}
    </section>
  );
}
