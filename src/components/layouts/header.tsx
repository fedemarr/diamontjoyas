"use client";

import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AnnouncementBar } from "@/components/layouts/announcement-bar";
import { CartSheet } from "@/components/shop/cart-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface HeaderCategory {
  name: string;
  slug: string;
}

export interface HeaderAnnouncement {
  id: string;
  text: string;
  linkUrl: string | null;
}

// Nav desktop deliberadamente sparse (premium, no mega-menú) — las
// categorías completas viven en /tienda (filtros) y en la grilla del home.
const primaryNavLinks = [
  { name: "Tienda", href: "/tienda" },
  { name: "Cadenas personalizadas", href: "/contacto" },
  { name: "Contacto", href: "/contacto" },
];

export function Header({
  categories,
  announcements,
  freeShippingThreshold,
}: {
  categories: HeaderCategory[];
  announcements: HeaderAnnouncement[];
  freeShippingThreshold: number | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // El drawer mobile sí lista todas las categorías (más espacio vertical).
  const mobileNavLinks = [
    { name: "Tienda", href: "/tienda" },
    ...categories.map((c) => ({ name: c.name, href: `/categoria/${c.slug}` })),
    { name: "Contacto", href: "/contacto" },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/tienda?q=${encodeURIComponent(trimmed)}` : "/tienda");
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <AnnouncementBar announcements={announcements} />

      <div className="border-b border-ink-border bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:gap-6">
          {/* Menú mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-bone hover:bg-ink-soft hover:text-gold md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85vw] max-w-sm border-ink-border bg-ink text-bone sm:w-96"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-gold-light">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-sm font-medium tracking-wide text-bone/90 transition-colors hover:bg-ink-soft hover:text-gold"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="DIAMONDVA.Co — inicio"
          >
            <Image
              src="/logo.png"
              alt="DIAMONDVA.Co"
              width={180}
              height={60}
              className="h-14 w-auto object-contain md:h-16"
              priority
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide whitespace-nowrap text-silver transition-colors hover:text-gold"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Buscador desktop */}
          <form
            onSubmit={handleSearch}
            className="relative hidden flex-1 max-w-xs items-center md:flex lg:max-w-sm"
          >
            <Search className="pointer-events-none absolute left-3 size-4 text-silver" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar joyas..."
              className="border-ink-border bg-ink-soft pl-9 text-bone placeholder:text-silver/70 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-bone hover:bg-ink-soft hover:text-gold md:hidden"
                  aria-label="Buscar"
                >
                  <Search className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="border-ink-border bg-ink text-bone">
                <SheetHeader>
                  <SheetTitle className="font-display text-gold-light">Buscar</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSearch} className="flex gap-2 px-4 pb-4">
                  <Input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar joyas..."
                    className="border-ink-border bg-ink-soft text-bone placeholder:text-silver/70"
                  />
                  <Button type="submit" className="bg-gradient-gold text-ink">
                    Buscar
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            <CartSheet freeShippingThreshold={freeShippingThreshold} />
          </div>
        </div>
      </div>
    </header>
  );
}
