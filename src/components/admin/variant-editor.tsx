"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AdminProductVariant } from "@/types/admin";

export function VariantEditor({
  variants,
  onChange,
  baseSku,
}: {
  variants: AdminProductVariant[];
  onChange: (variants: AdminProductVariant[]) => void;
  baseSku: string;
}) {
  function add() {
    onChange([
      ...variants,
      {
        name: "",
        sku: baseSku ? `${baseSku}-${variants.length + 1}` : "",
        priceDelta: 0,
        weightGrams: null,
        stock: 0,
        isActive: true,
      },
    ]);
  }

  function update(index: number, patch: Partial<AdminProductVariant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.length === 0 && (
        <p className="text-sm text-silver">
          Sin variantes — el producto se vende tal cual (sin selector de largo/talle).
        </p>
      )}

      {variants.map((variant, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-3 rounded-lg border border-ink-border bg-ink p-3 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.6fr_auto]"
        >
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-silver">Nombre (ej: 45cm)</Label>
            <Input
              value={variant.name}
              onChange={(e) => update(index, { name: e.target.value })}
              className="h-8 border-ink-border bg-ink-soft text-bone"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-silver">SKU</Label>
            <Input
              value={variant.sku}
              onChange={(e) => update(index, { sku: e.target.value })}
              className="h-8 border-ink-border bg-ink-soft text-bone"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-silver">Ajuste de precio</Label>
            <Input
              type="number"
              value={variant.priceDelta ?? 0}
              onChange={(e) => update(index, { priceDelta: Number(e.target.value) })}
              className="h-8 border-ink-border bg-ink-soft text-bone"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-silver">Stock</Label>
            <Input
              type="number"
              value={variant.stock}
              onChange={(e) => update(index, { stock: Number(e.target.value) })}
              className="h-8 border-ink-border bg-ink-soft text-bone"
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label className="text-xs text-silver">Activa</Label>
            <Switch
              checked={variant.isActive}
              onCheckedChange={(v) => update(index, { isActive: v })}
            />
          </div>
          <div className="flex items-end justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(index)}
              aria-label="Quitar variante"
              className="text-silver hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-fit border-ink-border bg-transparent text-bone hover:border-gold hover:text-gold"
      >
        <Plus className="size-4" />
        Agregar variante
      </Button>
    </div>
  );
}
