import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CatalogSearchParams } from "@/app/(shop)/tienda/search-params";

export function CatalogPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: CatalogSearchParams;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(p: number) {
    const qs = new URLSearchParams();
    if (params.categoria) qs.set("categoria", params.categoria);
    if (params.material) qs.set("material", params.material);
    if (params.min) qs.set("min", params.min);
    if (params.max) qs.set("max", params.max);
    if (params.disponible) qs.set("disponible", params.disponible);
    if (params.q) qs.set("q", params.q);
    if (params.sort) qs.set("sort", params.sort);
    if (p > 1) qs.set("page", String(p));
    const query = qs.toString();
    return query ? `/tienda?${query}` : "/tienda";
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Button
        asChild={page > 1}
        disabled={page <= 1}
        variant="outline"
        className="border-ink-border bg-transparent text-bone"
      >
        {page > 1 ? <Link href={hrefForPage(page - 1)}>Anterior</Link> : <span>Anterior</span>}
      </Button>
      <span className="text-sm text-silver">
        Página {page} de {totalPages}
      </span>
      <Button
        asChild={page < totalPages}
        disabled={page >= totalPages}
        variant="outline"
        className="border-ink-border bg-transparent text-bone"
      >
        {page < totalPages ? (
          <Link href={hrefForPage(page + 1)}>Siguiente</Link>
        ) : (
          <span>Siguiente</span>
        )}
      </Button>
    </div>
  );
}
