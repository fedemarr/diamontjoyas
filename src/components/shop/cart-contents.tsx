"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartLineItem } from "@/components/shop/cart-line-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatARS } from "@/lib/format";
import { cartItemCount, cartSubtotal, couponDiscount, useCartStore } from "@/stores/cart-store";

export function CartContents({
  freeShippingThreshold,
  onNavigate,
}: {
  freeShippingThreshold: number | null;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const subtotal = cartSubtotal(items);
  const discount = couponDiscount(coupon, subtotal);
  const missingForFreeShipping =
    freeShippingThreshold != null ? Math.max(0, freeShippingThreshold - subtotal) : 0;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/cart/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) {
        throw new Error(json.error ?? "Cupón inválido");
      }
      setCoupon({ code: json.code, type: json.type, value: json.value });
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Cupón inválido");
    } finally {
      setApplying(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ShoppingBag className="size-10 text-silver" strokeWidth={1.2} />
        <p className="text-bone">Tu carrito está vacío.</p>
        <Button asChild className="bg-gradient-gold text-ink" onClick={onNavigate}>
          <Link href="/tienda">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {freeShippingThreshold != null && (
        <div className="rounded-md border border-ink-border bg-ink-soft p-3">
          {missingForFreeShipping > 0 ? (
            <p className="text-xs text-silver">
              Te faltan <span className="text-gold-light">{formatARS(missingForFreeShipping)}</span>{" "}
              para envío gratis.
            </p>
          ) : (
            <p className="text-xs text-success">✔ Tenés envío gratis en este pedido.</p>
          )}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink">
            <div
              className="h-full bg-gradient-gold transition-all"
              style={{
                width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {items.map((item) => (
          <CartLineItem key={`${item.productId}-${item.variantId ?? "base"}`} item={item} />
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="Código de cupón"
          className="border-ink-border bg-ink text-bone placeholder:text-silver/60"
        />
        <Button
          type="button"
          variant="outline"
          onClick={applyCoupon}
          disabled={applying}
          className="shrink-0 border-ink-border bg-transparent text-bone"
        >
          Aplicar
        </Button>
      </div>
      {couponError && <p className="text-xs text-danger">{couponError}</p>}
      {coupon && (
        <p className="text-xs text-success">
          Cupón <span className="font-semibold">{coupon.code}</span> aplicado
        </p>
      )}

      <div className="flex flex-col gap-1 border-t border-ink-border pt-3 text-sm">
        <div className="flex justify-between text-silver">
          <span>Subtotal ({cartItemCount(items)} items)</span>
          <span>{formatARS(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Descuento</span>
            <span>-{formatARS(discount)}</span>
          </div>
        )}
        <p className="text-xs text-silver">El envío se calcula en el siguiente paso.</p>
      </div>

      <Button
        size="lg"
        className="bg-gradient-gold text-ink hover:opacity-90"
        onClick={() => {
          onNavigate?.();
          router.push("/checkout");
        }}
      >
        Ir al checkout
      </Button>
    </div>
  );
}
