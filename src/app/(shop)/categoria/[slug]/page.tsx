import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogPagination } from "@/app/(shop)/tienda/pagination";
import { ProductCard } from "@/components/shop/product-card";
import { getActiveCategories } from "@/lib/queries/categories";
import { getProducts } from "@/lib/queries/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getActiveCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: category.name,
    description:
      category.description ?? `Joyas de ${category.name} en DIAMONDVA.Co.`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const categories = await getActiveCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const page = query.page ? Number(query.page) : 1;
  const result = await getProducts({ categorySlug: slug, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Tienda</p>
        <h1 className="font-display text-3xl font-semibold text-bone">{category.name}</h1>
        {category.description && <p className="mt-1 text-sm text-silver">{category.description}</p>}
        <p className="mt-1 text-sm text-silver">{result.total} producto(s)</p>
      </div>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-ink-border bg-ink-soft py-20 text-center">
          <p className="text-bone">Todavía no hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {result.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <CatalogPagination
        page={result.page}
        totalPages={result.totalPages}
        params={{ categoria: slug, page: query.page }}
      />
    </div>
  );
}
