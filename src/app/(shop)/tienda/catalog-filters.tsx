import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MATERIAL_OPTIONS } from "@/lib/materials";
import { cn } from "@/lib/utils";
import type { CatalogSearchParams } from "@/app/(shop)/tienda/search-params";

interface CategoryOption {
  name: string;
  slug: string;
}

/**
 * Filtros server-rendered (sección 4 del prompt maestro: "filtros en URL
 * para compartir/SEO"). Categoría/material son links planos — funcionan
 * sin JS. Precio/orden van en un <form method="GET"> nativo, con
 * hidden inputs que preservan el resto de los filtros activos.
 */
export function CatalogFilters({
  categories,
  params,
}: {
  categories: CategoryOption[];
  params: CatalogSearchParams;
}) {
  function toggleHref(key: "categoria" | "material", value: string) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.min) qs.set("min", params.min);
    if (params.max) qs.set("max", params.max);
    if (params.disponible) qs.set("disponible", params.disponible);
    if (params.sort) qs.set("sort", params.sort);

    const isActive = params[key] === value;
    if (key === "categoria" && params.material) qs.set("material", params.material);
    if (key === "material" && params.categoria) qs.set("categoria", params.categoria);
    if (!isActive) qs.set(key, value);

    const query = qs.toString();
    return query ? `/tienda?${query}` : "/tienda";
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Categoría
        </h3>
        <ul className="flex flex-col gap-1.5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={toggleHref("categoria", c.slug)}
                className={cn(
                  "text-sm transition-colors",
                  params.categoria === c.slug
                    ? "font-semibold text-gold"
                    : "text-silver hover:text-bone"
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Material
        </h3>
        <ul className="flex flex-col gap-1.5">
          {MATERIAL_OPTIONS.map((m) => (
            <li key={m.value}>
              <Link
                href={toggleHref("material", m.value)}
                className={cn(
                  "text-sm transition-colors",
                  params.material === m.value
                    ? "font-semibold text-gold"
                    : "text-silver hover:text-bone"
                )}
              >
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <form method="GET" action="/tienda" className="flex flex-col gap-6">
        {params.q && <input type="hidden" name="q" value={params.q} />}
        {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
        {params.material && <input type="hidden" name="material" value={params.material} />}

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Precio
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              defaultValue={params.min}
              placeholder="Mín"
              className="h-9 w-full rounded-md border border-ink-border bg-ink px-2.5 text-sm text-bone placeholder:text-silver/60 focus-visible:border-gold focus-visible:outline-none"
            />
            <span className="text-silver">—</span>
            <input
              type="number"
              name="max"
              defaultValue={params.max}
              placeholder="Máx"
              className="h-9 w-full rounded-md border border-ink-border bg-ink px-2.5 text-sm text-bone placeholder:text-silver/60 focus-visible:border-gold focus-visible:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-silver">
          <input
            type="checkbox"
            name="disponible"
            value="1"
            defaultChecked={params.disponible === "1"}
            className="size-4 rounded border-ink-border bg-ink accent-gold"
          />
          Solo con stock disponible
        </label>

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Ordenar por
          </h3>
          <select
            name="sort"
            defaultValue={params.sort ?? "newest"}
            className="h-9 w-full rounded-md border border-ink-border bg-ink px-2.5 text-sm text-bone focus-visible:border-gold focus-visible:outline-none"
          >
            <option value="newest">Novedades</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre</option>
          </select>
        </div>

        <Button type="submit" className="bg-gradient-gold text-ink hover:opacity-90">
          Aplicar filtros
        </Button>

        {(params.categoria || params.material || params.min || params.max || params.disponible) && (
          <Link
            href="/tienda"
            className="text-center text-sm text-silver underline-offset-2 hover:text-gold hover:underline"
          >
            Limpiar filtros
          </Link>
        )}
      </form>
    </div>
  );
}
