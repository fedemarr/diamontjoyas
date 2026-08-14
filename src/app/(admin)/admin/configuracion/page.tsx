"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { settingsApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { settingsUpdateSchema, type SettingsUpdateInput } from "@/lib/validations/settings";

const TABS = [
  { id: "tienda", label: "Tienda" },
  { id: "textos", label: "Textos del home" },
  { id: "contacto", label: "Contacto" },
  { id: "envios", label: "Envíos" },
  { id: "pagos", label: "Pagos" },
  { id: "redes", label: "Redes" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function optionalNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>("tienda");
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsUpdateInput>({
    resolver: zodResolver(settingsUpdateSchema),
    defaultValues: {
      storeName: "",
      logoUrl: "",
      maintenanceMode: false,
      heroTitle: "",
      heroSubtitle: "",
      aboutText: "",
      whatsappOrderTemplate: "",
      whatsapp: "",
      email: "",
      address: "",
      businessHours: "",
      instagram: "",
      facebook: "",
      shippingRates: { amba: 0, interior: 0, retiroLocal: 0 },
      freeShippingThreshold: null,
      transferDiscountPercent: 0,
      installmentsEnabled: false,
      installmentsCount: 6,
      bankAlias: "",
      bankCbu: "",
      bankHolderName: "",
    },
  });

  useEffect(() => {
    if (!data?.settings) return;
    const s = data.settings;
    reset({
      storeName: s.storeName,
      logoUrl: s.logoUrl ?? "",
      maintenanceMode: s.maintenanceMode,
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      aboutText: s.aboutText,
      whatsappOrderTemplate: s.whatsappOrderTemplate,
      whatsapp: s.whatsapp ?? "",
      email: s.email ?? "",
      address: s.address ?? "",
      businessHours: s.businessHours ?? "",
      instagram: s.instagram ?? "",
      facebook: s.facebook ?? "",
      shippingRates: s.shippingRates,
      freeShippingThreshold: s.freeShippingThreshold,
      transferDiscountPercent: s.transferDiscountPercent,
      installmentsEnabled: s.installmentsEnabled,
      installmentsCount: s.installmentsCount,
      bankAlias: s.bankAlias ?? "",
      bankCbu: s.bankCbu ?? "",
      bankHolderName: s.bankHolderName ?? "",
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: SettingsUpdateInput) => settingsApi.update(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-silver">Cargando configuración...</p>;
  }

  const errorMsg = (field: keyof SettingsUpdateInput) =>
    errors[field] ? (
      <p className="text-xs text-danger">
        {typeof errors[field]?.message === "string" ? errors[field].message : ""}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Configuración</h1>
          <p className="text-sm text-silver">
            Todos los textos y datos del sitio, editables sin tocar código.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success">Cambios guardados</span>}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-gradient-gold text-ink hover:opacity-90"
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar todo
          </Button>
        </div>
      </div>

      <div className="flex w-fit flex-wrap gap-1 rounded-lg border border-ink-border bg-ink-soft p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-ink-border text-gold-light" : "text-silver hover:text-bone"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl rounded-lg border border-ink-border bg-ink-soft p-6">
        {tab === "tienda" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Tienda</h2>
            <Field label="Nombre de la tienda" hint="Se muestra en el footer y en los emails.">
              <Input {...register("storeName")} className="border-ink-border bg-ink text-bone" />
              {errorMsg("storeName")}
            </Field>
            <Field label="URL del logo" hint="Si no se carga, se usa el logo de texto del sitio.">
              <Input {...register("logoUrl")} placeholder="https://..." className="border-ink-border bg-ink text-bone" />
              {errorMsg("logoUrl")}
            </Field>
            <div className="flex items-center justify-between rounded-md border border-ink-border bg-ink p-4">
              <div>
                <Label htmlFor="maintenance" className="text-bone">Modo mantenimiento</Label>
                <p className="text-xs text-silver">Los clientes ven un aviso en vez de la tienda.</p>
              </div>
              <Switch
                id="maintenance"
                checked={watch("maintenanceMode")}
                onCheckedChange={(v) => setValue("maintenanceMode", v)}
              />
            </div>
          </div>
        )}

        {tab === "textos" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
              Textos del home
            </h2>
            <Field label="Título del hero">
              <Input {...register("heroTitle")} className="border-ink-border bg-ink text-bone" />
            </Field>
            <Field label="Subtítulo del hero">
              <Input {...register("heroSubtitle")} className="border-ink-border bg-ink text-bone" />
            </Field>
            <Field label="Texto de presentación (about)">
              <Textarea {...register("aboutText")} rows={4} className="border-ink-border bg-ink text-bone" />
            </Field>
            <Field label="Plantilla de mensaje de WhatsApp">
              <Textarea
                {...register("whatsappOrderTemplate")}
                rows={2}
                className="border-ink-border bg-ink text-bone"
              />
              <p className="text-xs text-silver">
                Podés usar {"{{productName}}"} y {"{{productUrl}}"} como variables.
              </p>
            </Field>
          </div>
        )}

        {tab === "contacto" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
              Datos de contacto
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp" hint="Con código de país, ej: +54 9 11...">
                <Input {...register("whatsapp")} className="border-ink-border bg-ink text-bone" />
              </Field>
              <Field label="Email">
                <Input type="email" {...register("email")} className="border-ink-border bg-ink text-bone" />
                {errorMsg("email")}
              </Field>
            </div>
            <Field label="Dirección">
              <Input {...register("address")} className="border-ink-border bg-ink text-bone" />
            </Field>
            <Field label="Horarios de atención">
              <Input {...register("businessHours")} className="border-ink-border bg-ink text-bone" />
            </Field>
          </div>
        )}

        {tab === "envios" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
              Costos de envío
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Envío a domicilio — AMBA ($)">
                <Input
                  type="number"
                  min="0"
                  {...register("shippingRates.amba", { setValueAs: Number })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
              <Field label="Envío al interior del país ($)">
                <Input
                  type="number"
                  min="0"
                  {...register("shippingRates.interior", { setValueAs: Number })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Retiro en local ($)" hint="Normalmente 0 — se retira gratis en San Miguel.">
                <Input
                  type="number"
                  min="0"
                  {...register("shippingRates.retiroLocal", { setValueAs: Number })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
              <Field label="Envío gratis desde ($, opcional)">
                <Input
                  type="number"
                  min="0"
                  placeholder="Sin tope"
                  {...register("freeShippingThreshold", { setValueAs: optionalNumber })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
            </div>
            {errors.shippingRates && (
              <p className="text-xs text-danger">Los costos de envío no pueden ser negativos.</p>
            )}
          </div>
        )}

        {tab === "pagos" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
              Medios de pago
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Descuento por transferencia (%)">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...register("transferDiscountPercent", { setValueAs: Number })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
              <Field label="Cantidad de cuotas (Mercado Pago)">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  {...register("installmentsCount", { setValueAs: Number })}
                  className="border-ink-border bg-ink text-bone"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md border border-ink-border bg-ink p-4">
              <div>
                <Label htmlFor="installments" className="text-bone">Mostrar cuotas en el checkout</Label>
                <p className="text-xs text-silver">Muestra el precio en N cuotas con Mercado Pago.</p>
              </div>
              <Switch
                id="installments"
                checked={watch("installmentsEnabled")}
                onCheckedChange={(v) => setValue("installmentsEnabled", v)}
              />
            </div>
            <div className="rounded-md border border-ink-border bg-ink p-4">
              <h3 className="text-sm font-medium text-bone">Datos de transferencia bancaria</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Alias">
                  <Input {...register("bankAlias")} className="border-ink-border bg-ink text-bone" />
                </Field>
                <Field label="CBU">
                  <Input {...register("bankCbu")} className="border-ink-border bg-ink text-bone" />
                </Field>
              </div>
              <Field label="Titular de la cuenta">
                <Input {...register("bankHolderName")} className="border-ink-border bg-ink text-bone" />
              </Field>
            </div>
          </div>
        )}

        {tab === "redes" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Redes</h2>
            <Field label="Instagram" hint="URL completa, ej: https://instagram.com/diamondva.co">
              <Input {...register("instagram")} className="border-ink-border bg-ink text-bone" />
            </Field>
            <Field label="Facebook">
              <Input {...register("facebook")} className="border-ink-border bg-ink text-bone" />
            </Field>
          </div>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-danger">No se pudieron guardar los cambios. Revisá los campos.</p>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-bone">{label}</Label>
      {children}
      {hint && <p className="text-xs text-silver">{hint}</p>}
    </div>
  );
}
