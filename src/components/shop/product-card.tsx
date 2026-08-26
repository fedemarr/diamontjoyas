import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatARS } from "@/lib/format";
import { MATERIAL_LABELS } from "@/lib/materials";
import type { PublicProductWithPrice } from "@/lib/queries/products";

export function ProductCard({ product }: { product: PublicProductWithPrice }) {
  const image = product.images[0];
  const lowStock = product.trackStock && product.stock > 0 && product.stock <= product.lowStockAlert;
  const outOfStock = product.trackStock && product.stock <= 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-border bg-ink-soft transition-all duration-250 hover:-translate-y-1 hover:border-gold"
    >
      <div className="relative aspect-square overflow-hidden bg-ink">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-silver">
            Sin foto
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.compareAtPrice && (
            <Badge className="bg-danger text-white">Oferta</Badge>
          )}
          {outOfStock && (
            <Badge variant="outline" className="border-ink-border bg-ink/90 text-silver">
              Sin stock
            </Badge>
          )}
          {!outOfStock && lowStock && (
            <Badge variant="outline" className="border-gold/50 bg-ink/90 text-gold-light">
              Últimas unidades
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[0.7rem] font-semibold tracking-luxury text-silver uppercase">
          {MATERIAL_LABELS[product.material] ?? product.material}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium text-bone">{product.name}</h3>
        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-gold-light">
              {formatARS(product.currentPrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-silver line-through">
                {formatARS(product.compareAtPrice.toNumber())}
              </span>
            )}
          </div>
          {product.installments3xTotal && (
            <span className="text-xs text-silver">
              3 cuotas sin interés de{" "}
              <span className="font-medium text-bone">
                {formatARS(product.installments3xTotal.toNumber() / 3)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
