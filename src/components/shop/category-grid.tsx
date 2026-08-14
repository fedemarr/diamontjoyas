import Image from "next/image";
import Link from "next/link";

interface CategoryGridItem {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="mb-6 font-display text-2xl font-semibold text-bone sm:text-3xl">
        Encontrá lo tuyo
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-border bg-ink-soft transition-colors hover:border-gold"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-bone">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
