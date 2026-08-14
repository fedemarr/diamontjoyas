import Image from "next/image";
import Link from "next/link";

/**
 * Grilla estática de Instagram (sección 4.8 del prompt maestro) — no hay
 * integración con la API real de Instagram en el stack, así que son
 * tiles fijos que linkean al perfil. El día que haya fotos reales del
 * cliente, se reemplazan estos placeholders por capturas de posts.
 */
const TILE_URL = "https://placehold.co/400x400/141416/8C6D1F.png?text=%40diamondva.co";
const TILES = Array.from({ length: 6 }, () => TILE_URL);

export function InstagramFeed({
  handle,
  profileUrl,
}: {
  handle: string;
  profileUrl: string | null;
}) {
  if (!profileUrl) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-bone sm:text-3xl">Seguinos</h2>
        <Link
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gold-light hover:text-gold"
        >
          {handle} en Instagram
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
        {TILES.map((src, i) => (
          <Link
            key={i}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg border border-ink-border bg-ink-soft"
          >
            <Image
              src={src}
              alt={`Publicación de ${handle} en Instagram`}
              fill
              sizes="200px"
              className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
