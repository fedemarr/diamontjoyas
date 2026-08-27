"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ImageUploader } from "@/components/admin/image-uploader";
import { VariantEditor } from "@/components/admin/variant-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categoriesApi, goldPriceApi, productsApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";
import { getProductPrice, PricingError } from "@/lib/pricing-core";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { AdminProduct } from "@/types/admin";

const MATERIAL_LABELS: Record<string, string> = {
  ORO_18K: "Oro 18k",
  ORO_BAJO: "Oro bajo",
  ENCHAPADO: "Enchapado",
  PLATA_925: "Plata 925",
};

function emptyDefaults(): ProductInput {
  return {
    name: "",
    slug: "",
    description: "",
    sku: "",
    categoryId: "",
    material: "ENCHAPADO",
    pricingMode: "FIXED",
    price: null,
    weightGrams: null,
    laborCost: null,
    compareAtPrice: null,
    installments3xTotal: null,
    cost: null,
    stock: 0,
    lowStockAlert: 3,
    trackStock: true,
    isActive: true,
    isFeatured: false,
    order: 0,
    metaTitle: "",
    metaDescription: "",
    images: [],
    variants: [],
  };
}

function fromProduct(product: AdminProduct): ProductInput {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    sku: product.sku,
    categoryId: product.categoryId,
    material: product.material,
    pricingMode: product.pricingMode,
    price: product.price,
    weightGrams: product.weightGrams,
    laborCost: product.laborCost,
    compareAtPrice: product.compareAtPrice,
    installments3xTotal: product.installments3xTotal,
    cost: product.cost,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert,
    trackStock: product.trackStock,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    order: product.order,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    images: product.images,
    variants: product.variants.map((v) => ({ ...v, priceDelta: v.priceDelta ?? 0 })),
  };
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!product;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
  const { data: goldPrice } = useQuery({
    queryKey: ["gold-price"],
    queryFn: goldPriceApi.current,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? fromProduct(product) : emptyDefaults(),
  });

  useEffect(() => {
    if (product) reset(fromProduct(product));
  }, [product, reset]);

  const values = watch();

  function onNameChange(value: string) {
    setValue("name", value);
    if (!isEditing) setValue("slug", slugify(value));
  }

  const previewPrice = useMemo(() => {
    if (!goldPrice) return null;
    try {
      const result = getProductPrice(
        {
          pricingMode: values.pricingMode,
          material: values.material,
          price: values.price,
          weightGrams: values.weightGrams,
          laborCost: values.laborCost,
        },
        {
          goldPricePerGram18k: new Decimal(goldPrice.goldPricePerGram18k),
          goldPricePerGramLow: new Decimal(goldPrice.goldPricePerGramLow),
        }
      );
      return result.toNumber();
    } catch (err) {
      return err instanceof PricingError ? err.message : null;
    }
  }, [values.pricingMode, values.material, values.price, values.weightGrams, values.laborCost, goldPrice]);

  const mutation = useMutation({
    mutationFn: (data: ProductInput) =>
      isEditing ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/admin/productos");
    },
  });

  const categories = categoriesData?.categories ?? [];

  return (
    <form
      onSubmit={handleSubmit(
        (data) => {
          setSubmitError(null);
          mutation.mutate(data);
        },
        () => {
          // Fallback genérico si algo no pasa la validación y no tiene su
          // propio mensaje visible (ej: alt de imagen) — sin esto el submit
          // no hace nada y parece que "no guarda".
          setSubmitError("Revisá los campos marcados en rojo antes de guardar.");
        }
      )}
      className="flex flex-col gap-8 pb-16"
    >
      {submitError && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      {/* Datos básicos */}
      <section className="grid gap-4 rounded-lg border border-ink-border bg-ink-soft p-5 sm:grid-cols-2">
        <h2 className="col-span-full font-display text-lg font-semibold text-bone">
          Datos básicos
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input
            value={values.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="border-ink-border bg-ink text-bone"
          />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>
            Slug <span className="font-normal text-silver">— URL en la tienda</span>
          </Label>
          <Input {...register("slug")} className="border-ink-border bg-ink text-bone" />
          {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>
            SKU <span className="font-normal text-silver">— código interno del producto</span>
          </Label>
          <Input {...register("sku")} className="border-ink-border bg-ink text-bone" />
          {errors.sku && <p className="text-xs text-danger">{errors.sku.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Select value={values.categoryId} onValueChange={(v) => setValue("categoryId", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-xs text-danger">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="col-span-full flex flex-col gap-1.5">
          <Label>Descripción</Label>
          <Textarea {...register("description")} rows={4} />
        </div>
      </section>

      {/* Precio */}
      <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
        <h2 className="font-display text-lg font-semibold text-bone">Precio y material</h2>

        <div className="flex flex-col gap-1.5">
          <Label>Material</Label>
          <Select value={values.material} onValueChange={(v) => setValue("material", v as ProductInput["material"])}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={values.pricingMode === "FIXED" ? "default" : "outline"}
            onClick={() => setValue("pricingMode", "FIXED")}
            className={values.pricingMode === "FIXED" ? "bg-gradient-gold text-ink" : "border-ink-border bg-transparent text-bone"}
          >
            Precio fijo
          </Button>
          <Button
            type="button"
            variant={values.pricingMode === "BY_WEIGHT" ? "default" : "outline"}
            onClick={() => setValue("pricingMode", "BY_WEIGHT")}
            className={values.pricingMode === "BY_WEIGHT" ? "bg-gradient-gold text-ink" : "border-ink-border bg-transparent text-bone"}
          >
            Por peso (oro)
          </Button>
        </div>

        {values.pricingMode === "FIXED" ? (
          <div className="flex flex-col gap-1.5 sm:w-64">
            <Label>Precio</Label>
            <Input
              type="number"
              step="1"
              value={values.price ?? ""}
              onChange={(e) => setValue("price", e.target.value === "" ? null : Number(e.target.value))}
              className="border-ink-border bg-ink text-bone"
            />
            {errors.price && <p className="text-xs text-danger">{errors.price.message}</p>}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Peso (gramos)</Label>
              <Input
                type="number"
                step="0.01"
                value={values.weightGrams ?? ""}
                onChange={(e) =>
                  setValue("weightGrams", e.target.value === "" ? null : Number(e.target.value))
                }
                className="border-ink-border bg-ink text-bone"
              />
              {errors.weightGrams && (
                <p className="text-xs text-danger">{errors.weightGrams.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>
                Costo de hechura <span className="font-normal text-silver">— adicional fijo</span>
              </Label>
              <Input
                type="number"
                step="1"
                value={values.laborCost ?? ""}
                onChange={(e) =>
                  setValue("laborCost", e.target.value === "" ? null : Number(e.target.value))
                }
                className="border-ink-border bg-ink text-bone"
              />
            </div>
            {errors.material && (
              <p className="col-span-full text-xs text-danger">{errors.material.message}</p>
            )}
          </div>
        )}

        <div className="rounded-md border border-gold/30 bg-gold/5 px-4 py-3">
          <p className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
            Precio final (vista previa)
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-bone">
            {typeof previewPrice === "number" ? formatARS(previewPrice) : previewPrice ?? "—"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>
              Precio tachado <span className="font-normal text-silver">— solo liquidación</span>
            </Label>
            <Input
              type="number"
              value={values.compareAtPrice ?? ""}
              onChange={(e) =>
                setValue("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))
              }
              className="border-ink-border bg-ink text-bone"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              Total en 3 cuotas sin interés{" "}
              <span className="font-normal text-silver">
                — opcional, se muestra dividido por 3 en la ficha
              </span>
            </Label>
            <Input
              type="number"
              value={values.installments3xTotal ?? ""}
              onChange={(e) =>
                setValue(
                  "installments3xTotal",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="border-ink-border bg-ink text-bone"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              Costo interno{" "}
              <span className="font-normal text-silver">— para margen, nunca se muestra al público</span>
            </Label>
            <Input
              type="number"
              value={values.cost ?? ""}
              onChange={(e) => setValue("cost", e.target.value === "" ? null : Number(e.target.value))}
              className="border-ink-border bg-ink text-bone"
            />
          </div>
        </div>
      </section>

      {/* Stock */}
      <section className="grid gap-4 rounded-lg border border-ink-border bg-ink-soft p-5 sm:grid-cols-3">
        <h2 className="col-span-full font-display text-lg font-semibold text-bone">Stock</h2>
        <div className="flex flex-col gap-1.5">
          <Label>Stock disponible</Label>
          <Input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="border-ink-border bg-ink text-bone"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Alerta de stock bajo</Label>
          <Input
            type="number"
            {...register("lowStockAlert", { valueAsNumber: true })}
            className="border-ink-border bg-ink text-bone"
          />
        </div>
        <div className="flex items-center justify-between rounded-md border border-ink-border px-3">
          <span className="text-sm text-bone">Controlar stock</span>
          <Switch
            checked={values.trackStock}
            onCheckedChange={(v) => setValue("trackStock", v)}
          />
        </div>
      </section>

      {/* Variantes */}
      <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
        <h2 className="font-display text-lg font-semibold text-bone">
          Variantes <span className="text-sm font-normal text-silver">(largo, talle, etc.)</span>
        </h2>
        <VariantEditor
          variants={values.variants}
          onChange={(variants) =>
            setValue(
              "variants",
              variants.map((v) => ({ ...v, priceDelta: v.priceDelta ?? 0 }))
            )
          }
          baseSku={values.sku}
        />
      </section>

      {/* Imágenes */}
      <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
        <h2 className="font-display text-lg font-semibold text-bone">Imágenes</h2>
        <ImageUploader
          images={values.images}
          onChange={(images) => setValue("images", images)}
          defaultAlt={values.name}
        />
        {errors.images && (
          <p className="text-xs text-danger">Revisá que todas las imágenes tengan texto alternativo.</p>
        )}
      </section>

      {/* SEO y visibilidad */}
      <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
        <h2 className="font-display text-lg font-semibold text-bone">SEO y visibilidad</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Título SEO</Label>
            <Input {...register("metaTitle")} className="border-ink-border bg-ink text-bone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Descripción SEO</Label>
            <Input {...register("metaDescription")} className="border-ink-border bg-ink text-bone" />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={values.isActive} onCheckedChange={(v) => setValue("isActive", v)} />
            <span className="text-sm text-bone">Activo (visible en la tienda)</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={values.isFeatured}
              onCheckedChange={(v) => setValue("isFeatured", v)}
            />
            <span className="text-sm text-bone">Destacado (últimos ingresos)</span>
          </div>
        </div>
      </section>

      {mutation.isError && (
        <p role="alert" className="text-sm text-danger">
          {(mutation.error as Error).message}
        </p>
      )}

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-ink-border bg-ink py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/productos")}
          className="border-ink-border bg-transparent text-bone"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="bg-gradient-gold text-ink hover:opacity-90"
        >
          {isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
