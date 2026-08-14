import Image from "next/image";

import { formatARS } from "@/lib/format";
import type { CartItem } from "@/stores/cart-store";

export function CheckoutSummary({
  items,
  subtotal,
  discount,
  shippingCost,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number | null;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5 lg:sticky lg:top-24">
      <h2 className="font-display text-lg font-semibold text-bone">Tu pedido</h2>

      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-ink">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              )}
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-ink">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col text-xs">
              <span className="text-bone">{item.name}</span>
              {item.variantName && <span className="text-silver">{item.variantName}</span>}
              <span className="text-silver">{formatARS(item.unitPrice * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-ink-border pt-3 text-sm">
        <div className="flex justify-between text-silver">
          <span>Subtotal</span>
          <span>{formatARS(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Descuento</span>
            <span>-{formatARS(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-silver">
          <span>Envío</span>
          <span>{shippingCost == null ? "A calcular" : shippingCost === 0 ? "Gratis" : formatARS(shippingCost)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-ink-border pt-2 text-base font-semibold text-bone">
          <span>Total</span>
          <span className="text-gold-light">{formatARS(total)}</span>
        </div>
      </div>
    </div>
  );
}
