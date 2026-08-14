import { Gem } from "lucide-react";

import { ProductRail } from "@/components/shop/product-rail";
import type { PublicProductWithPrice } from "@/lib/queries/products";

/** Línea premium con tratamiento visual diferenciado (sección 4.7). */
export function GoldSection({ products }: { products: PublicProductWithPrice[] }) {
  if (products.length === 0) return null;

  return (
    <div className="border-y border-gold/20 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.06),transparent_60%)]">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="flex items-center gap-2 text-gold">
          <Gem className="size-4" strokeWidth={1.5} />
          <span className="text-xs font-semibold tracking-luxury uppercase">Línea premium</span>
        </div>
      </div>
      <ProductRail
        title="Oro 18k"
        subtitle="La línea premium de DIAMONDVA.Co, pieza a pieza."
        products={products}
        viewAllHref="/tienda?material=ORO_18K"
        className="py-8"
      />
    </div>
  );
}
