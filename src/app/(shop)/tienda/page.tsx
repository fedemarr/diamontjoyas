import type { Metadata } from "next";

import { CatalogFilters } from "@/app/(shop)/tienda/catalog-filters";
import { MobileFiltersDrawer } from "@/app/(shop)/tienda/mobile-filters-drawer";
import { CatalogPagination } from "@/app/(shop)/tienda/pagination";
import type { CatalogSearchParams } from "@/app/(shop)/tienda/search-params";
import { ProductCard } from "@/components/shop/product-card";
import { getActiveCategories } from "@/lib/queries/categories";
import { getProducts } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Catálogo completo de joyas DIAMONDVA.Co — cadenas, anillos, dijes y más.",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;

  const [categories, result] = await Promise.all([
    getActiveCategories(),
    getProducts({
      categorySlug: params.categoria,
      material: params.material,
      minPrice: params.min ? Number(params.min) : undefined,
      maxPrice: params.max ? Number(params.max) : undefined,
      inStockOnly: params.disponible === "1",
      q: params.q,
      sort: (params.sort as never) ?? "newest",
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  const categoryOptions = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-bone">
          {params.q ? `Resultados para "${params.q}"` : "Tienda"}
        </h1>
        <p className="mt-1 text-sm text-silver">{result.total} producto(s) encontrados</p>
      </div>

      <div className="mb-6 lg:hidden">
        <MobileFiltersDrawer>
          <CatalogFilters categories={categoryOptions} params={params} />
        </MobileFiltersDrawer>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <CatalogFilters categories={categoryOptions} params={params} />
        </aside>

        <div className="flex-1">
          {result.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-ink-border bg-ink-soft py-20 text-center">
              <p className="text-bone">No encontramos productos con estos filtros.</p>
              <p className="text-sm text-silver">Probá ajustando la búsqueda o los filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <CatalogPagination page={result.page} totalPages={result.totalPages} params={params} />
        </div>
      </div>
    </div>
  );
}
