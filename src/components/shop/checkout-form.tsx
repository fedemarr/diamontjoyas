"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { CheckoutSummary } from "@/components/shop/checkout-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatARS } from "@/lib/format";
import type { PublicSettings } from "@/lib/queries/settings";
import { ARGENTINA_PROVINCES, calculateShippingCost, type ShippingMethod } from "@/lib/shipping";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { cartSubtotal, couponDiscount, useCartStore } from "@/stores/cart-store";

const SHIPPING_METHODS: { value: ShippingMethod; label: string; hint: string }[] = [
  { value: "ENVIO_DOMICILIO", label: "Envío a domicilio", hint: "Puerta a puerta" },
  { value: "SUCURSAL_CORREO", label: "Sucursal de correo", hint: "Retirás en la sucursal más cercana" },
  { value: "RETIRO_LOCAL", label: "Retiro en local", hint: "San Miguel, Buenos Aires — sin cargo" },
];

const PAYMENT_METHODS = [
  { value: "MERCADO_PAGO", label: "Mercado Pago" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "EFECTIVO", label: "Efectivo en local" },
] as const;

export function CheckoutForm({ settings }: { settings: PublicSettings }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerDni: "",
      shippingMethod: "ENVIO_DOMICILIO",
      paymentMethod: "MERCADO_PAGO",
      items: [],
      couponCode: "",
      customerNotes: "",
    },
  });

  const shippingMethod = watch("shippingMethod");
  const paymentMethod = watch("paymentMethod");
  const province = watch("shippingAddress.province");

  // `items` no es un campo que llene el usuario — viene del store del
  // carrito. Sin este sync, el valor por defecto ([]) nunca cambia y
  // zodResolver rechaza el submit en silencio (checkoutSchema pide
  // items.min(1)) sin que se vea ningún error en pantalla.
  useEffect(() => {
    setValue(
      "items",
      items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
    );
  }, [items, setValue]);

  // RHF no desregistra los inputs de dirección al desmontarlos (no hay
  // `shouldUnregister`) — si el usuario los tipea y después cambia a
  // "Retiro en local", quedan strings vacíos colgados en el form state y
  // el schema los sigue pidiendo (shippingAddress ya no es realmente
  // `undefined`). Se limpia a mano cada vez que se elige retiro en local.
  useEffect(() => {
    if (shippingMethod === "RETIRO_LOCAL") {
      setValue("shippingAddress", undefined);
    }
  }, [shippingMethod, setValue]);

  const subtotal = cartSubtotal(items);
  const discount = couponDiscount(coupon, subtotal);
  const shippingCost = useMemo(
    () => calculateShippingCost(shippingMethod, province ?? null, settings.shippingRates),
    [shippingMethod, province, settings.shippingRates]
  );
  const total = subtotal - discount + shippingCost;

  async function onSubmit(data: CheckoutInput) {
    if (items.length === 0) {
      setSubmitError("Tu carrito está vacío.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload = {
        ...data,
        couponCode: coupon?.code || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo confirmar el pedido.");
      }

      clearCart();

      if (data.paymentMethod === "MERCADO_PAGO") {
        window.location.href = json.redirectUrl;
      } else {
        router.push(json.redirectUrl);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo confirmar el pedido.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-ink-border bg-ink-soft p-10 text-center">
        <p className="text-bone">Tu carrito está vacío.</p>
        <Button asChild className="mt-4 bg-gradient-gold text-ink">
          <a href="/tienda">Ir a la tienda</a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () =>
        setSubmitError("Revisá los datos marcados en rojo antes de confirmar.")
      )}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      <div className="flex flex-col gap-8">
        {/* Datos */}
        <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="font-display text-lg font-semibold text-bone">1. Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Nombre y apellido</Label>
              <Input {...register("customerName")} className="border-ink-border bg-ink text-bone" />
              {errors.customerName && (
                <p className="text-xs text-danger">{errors.customerName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("customerEmail")}
                className="border-ink-border bg-ink text-bone"
              />
              {errors.customerEmail && (
                <p className="text-xs text-danger">{errors.customerEmail.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Teléfono</Label>
              <Input
                type="tel"
                {...register("customerPhone")}
                placeholder="11 1234-5678"
                className="border-ink-border bg-ink text-bone"
              />
              {errors.customerPhone && (
                <p className="text-xs text-danger">{errors.customerPhone.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>DNI (opcional)</Label>
              <Input {...register("customerDni")} className="border-ink-border bg-ink text-bone" />
            </div>
          </div>
        </section>

        {/* Envío */}
        <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="font-display text-lg font-semibold text-bone">2. Envío</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {SHIPPING_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("shippingMethod", m.value)}
                className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                  shippingMethod === m.value
                    ? "border-gold bg-gold/10"
                    : "border-ink-border hover:border-silver"
                }`}
              >
                <span className="block text-sm font-medium text-bone">{m.label}</span>
                <span className="block text-xs text-silver">{m.hint}</span>
              </button>
            ))}
          </div>

          {shippingMethod !== "RETIRO_LOCAL" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Calle</Label>
                <Input
                  {...register("shippingAddress.street")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Número</Label>
                <Input
                  {...register("shippingAddress.number")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Piso / depto (opcional)</Label>
                <Input
                  {...register("shippingAddress.floor")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Localidad</Label>
                <Input
                  {...register("shippingAddress.city")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Provincia</Label>
                <Select
                  value={province}
                  onValueChange={(v) => setValue("shippingAddress.province", v as never)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elegí tu provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARGENTINA_PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Código postal</Label>
                <Input
                  {...register("shippingAddress.postalCode")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Notas de entrega (opcional)</Label>
                <Input
                  {...register("shippingAddress.notes")}
                  className="border-ink-border bg-ink text-bone"
                />
              </div>
              {errors.shippingAddress && (
                <p className="text-xs text-danger sm:col-span-2">
                  Completá la dirección de envío.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Pago */}
        <section className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="font-display text-lg font-semibold text-bone">3. Pago</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("paymentMethod", m.value)}
                className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === m.value
                    ? "border-gold bg-gold/10 text-gold-light"
                    : "border-ink-border text-bone hover:border-silver"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {paymentMethod === "TRANSFERENCIA" && (
            <div className="rounded-md border border-ink-border bg-ink p-4 text-sm text-silver">
              {settings.bankAlias || settings.bankCbu ? (
                <>
                  {settings.transferDiscountPercent > 0 && (
                    <p className="mb-2 text-success">
                      {settings.transferDiscountPercent}% de descuento pagando por transferencia.
                    </p>
                  )}
                  {settings.bankAlias && (
                    <p>
                      Alias: <span className="text-bone">{settings.bankAlias}</span>
                    </p>
                  )}
                  {settings.bankCbu && (
                    <p>
                      CBU: <span className="text-bone">{settings.bankCbu}</span>
                    </p>
                  )}
                  {settings.bankHolderName && (
                    <p>
                      Titular: <span className="text-bone">{settings.bankHolderName}</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs">
                    Te vamos a pedir el comprobante por WhatsApp una vez confirmado el pedido.
                  </p>
                </>
              ) : (
                <p>Te vamos a enviar los datos para transferir apenas confirmes el pedido.</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Notas para el pedido (opcional)</Label>
            <Textarea {...register("customerNotes")} rows={2} />
          </div>
        </section>

        {submitError && (
          <p role="alert" className="text-sm text-danger">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="bg-gradient-gold text-ink hover:opacity-90"
        >
          {submitting ? "Confirmando..." : `Confirmar pedido — ${formatARS(total)}`}
        </Button>
      </div>

      <CheckoutSummary
        items={items}
        subtotal={subtotal}
        discount={discount}
        shippingCost={shippingCost}
        total={total}
      />
    </form>
  );
}
