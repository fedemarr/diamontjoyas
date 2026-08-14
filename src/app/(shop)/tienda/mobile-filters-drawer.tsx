"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileFiltersDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-ink-border bg-transparent text-bone lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto border-ink-border bg-ink text-bone">
        <SheetHeader>
          <SheetTitle className="font-display text-gold-light">Filtros</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8" onClick={(e) => (e.target as HTMLElement).tagName === "A" && setOpen(false)}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
