"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { HeaderAnnouncement } from "@/components/layouts/header";

/**
 * Barra de anuncios rotativa superior (sección 4.1 del prompt maestro).
 * Contenido real del modelo `Announcement`, editable desde el admin.
 */
export function AnnouncementBar({ announcements }: { announcements: HeaderAnnouncement[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(id);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[index];
  const content = (
    <p
      key={current.id}
      className="animate-in fade-in slide-in-from-top-1 text-xs font-medium tracking-luxury text-silver uppercase duration-500"
    >
      {current.text}
    </p>
  );

  return (
    <div className="bg-ink-soft border-b border-ink-border text-bone">
      <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center px-4 py-2 text-center">
        {current.linkUrl ? (
          <Link href={current.linkUrl} className="hover:text-gold">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
