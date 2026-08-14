"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    <motion.p
      key={current.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35 }}
      className="text-xs font-medium tracking-luxury text-silver uppercase"
    >
      {current.text}
    </motion.p>
  );

  return (
    <div className="bg-ink-soft border-b border-ink-border text-bone">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center overflow-hidden px-4 text-center">
        <AnimatePresence mode="wait">
          {current.linkUrl ? (
            <Link href={current.linkUrl} className="hover:text-gold">
              {content}
            </Link>
          ) : (
            content
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
