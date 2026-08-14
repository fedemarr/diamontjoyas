"use client";

import { Check, Minus, MessageCircle, Plus, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

interface VariantOption {
  id?: string;
  name: string;
  priceDelta: number;
  stock: number;
  isActive: boolean;
}

export function PurchasePanel({
  productId,
  slug,
  name,
  sku,
  image,
  basePrice,
  variants,
  stock,
  trackStock,
  lowStockAlert,
  whatsappUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  image: string | null;
  basePrice: number;
  variants: VariantOption[];
  stock: number;
  trackStock: boolean;
  lowStockAlert: number;
  whatsappUrl: string | null;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const activeVariants = variants.filter((v) => v.isActive);
  const [variantIndex, setVariantIndex] = useState<number | null>(activeVariants.length > 0 ? 0 : null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = variantIndex != null ? activeVariants[variantIndex] : null;
  const effectiveStock = selectedVariant ? selectedVariant.stock : stock;
  const outOfStock = trackStock && effectiveStock <= 0;
  const lowStock = trackStock && effectiveStock > 0 && effectiveStock <= lowStockAlert;

  const finalPrice = useMemo(
    () => basePrice + (selectedVariant?.priceDelta ?? 0),
    [basePrice, selectedVariant]
  );

  function handleAddToCart() {
    addItem({
      productId,
      variantId: selectedVariant?.id ?? null,
      name,
      slug,
      sku,
      image,
      unitPrice: finalPrice,
      quantity,
      maxStock: trackStock ? effectiveStock : null,
      variantName: selectedVariant?.name ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-display text-3xl font-semibold text-gold-light sm:text-4xl">
          {formatARS(finalPrice)}
        </p>
      </div>

      {trackStock && (
        <div>
          {outOfStock ? (
            <Badge variant="outline" className="border-danger/40 text-danger">
              Sin stock
            </Badge>
          ) : lowStock ? (
            <Badge variant="outline" className="border-gold/50 text-gold-light">
              Últimas {effectiveStock} unidades
            </Badge>
          ) : null}
        </div>
      )}

      {activeVariants.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-luxury text-silver uppercase">
            Elegí una opción
          </span>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v, i) => (
              <button
                key={v.id ?? i}
                type="button"
                onClick={() => setVariantIndex(i)}
                disabled={trackStock && v.stock <= 0}
                className={`rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  variantIndex === i
                    ? "border-gold bg-gold/10 text-gold-light"
                    : "border-ink-border text-silver hover:border-silver"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold tracking-luxury text-silver uppercase">Cantidad</span>
        <div className="flex items-center rounded-md border border-ink-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center text-silver hover:text-gold"
            aria-label="Restar cantidad"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm text-bone">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(effectiveStock || 99, q + 1))}
            className="flex size-9 items-center justify-center text-silver hover:text-gold"
            aria-label="Sumar cantidad"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="flex-1 bg-gradient-gold text-ink hover:opacity-90 disabled:opacity-40"
        >
          {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
          {outOfStock ? "Sin stock" : added ? "Agregado" : "Agregar al carrito"}
        </Button>

        {whatsappUrl && (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 border-ink-border bg-transparent text-bone hover:border-success hover:text-success"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Consultar por WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
