"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { CartContents } from "@/components/shop/cart-contents";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cartItemCount, useCartStore } from "@/stores/cart-store";

export function CartSheet({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  // Zustand persist rehidrata después del mount inicial — evita el
  // parpadeo/mismatch de hidratación mostrando 0 hasta que esté listo.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartItemCount(items) : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-bone hover:bg-ink-soft hover:text-gold"
          aria-label="Ver carrito"
        >
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-ink">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-auto border-ink-border bg-ink text-bone">
        <SheetHeader>
          <SheetTitle className="font-display text-gold-light">Tu carrito</SheetTitle>
        </SheetHeader>
        <div className="flex-1 px-4 pb-6">
          <CartContents freeShippingThreshold={freeShippingThreshold} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
