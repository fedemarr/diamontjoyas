"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatARS } from "@/lib/format";
import { useCartStore, type CartItem } from "@/stores/cart-store";

export function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 border-b border-ink-border py-4 last:border-0">
      <Link
        href={`/producto/${item.slug}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-md bg-ink-soft"
      >
        {item.image && (
          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/producto/${item.slug}`}
          className="text-sm font-medium text-bone hover:text-gold"
        >
          {item.name}
        </Link>
        {item.variantName && <span className="text-xs text-silver">{item.variantName}</span>}
        <span className="text-sm font-semibold text-gold-light">{formatARS(item.unitPrice)}</span>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center rounded-md border border-ink-border">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="flex size-7 items-center justify-center text-silver hover:text-gold"
              aria-label="Restar cantidad"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-6 text-center text-xs text-bone">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              disabled={item.maxStock != null && item.quantity >= item.maxStock}
              className="flex size-7 items-center justify-center text-silver hover:text-gold disabled:opacity-30"
              aria-label="Sumar cantidad"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variantId)}
            className="text-silver hover:text-danger"
            aria-label={`Quitar ${item.name} del carrito`}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
