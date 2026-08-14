"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { couponsApi } from "@/lib/admin-api";
import { couponSchema, type CouponInput } from "@/lib/validations/coupon";
import type { AdminCoupon } from "@/types/admin";

/** Convierte el input vacío (opcional) a null, manteniendo los números. */
function optionalNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: AdminCoupon | null;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof couponSchema>, unknown, z.output<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "PERCENT",
      value: 0,
      minPurchase: null,
      maxUses: null,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 86_400_000),
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      coupon
        ? {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minPurchase: coupon.minPurchase,
            maxUses: coupon.maxUses,
            validFrom: new Date(coupon.validFrom),
            validUntil: new Date(coupon.validUntil),
            isActive: coupon.isActive,
          }
        : {
            code: "",
            type: "PERCENT",
            value: 0,
            minPurchase: null,
            maxUses: null,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 86_400_000),
            isActive: true,
          }
    );
  }, [open, coupon, reset]);

  const mutation = useMutation({
    mutationFn: (data: CouponInput) =>
      coupon ? couponsApi.update(coupon.id, data) : couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      onOpenChange(false);
    },
  });

  const type = watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar cupón" : "Nuevo cupón"}</DialogTitle>
          <DialogDescription>
            {coupon
              ? "Actualizá los datos del cupón."
              : "Cargá un cupón de descuento para usar en el checkout."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                placeholder="BIENVENIDA10"
                {...register("code")}
                className="border-ink-border bg-ink text-bone uppercase"
              />
              {errors.code && <p className="text-xs text-danger">{errors.code.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as CouponInput["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Porcentaje (%)</SelectItem>
                  <SelectItem value="FIXED">Monto fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="value">{type === "PERCENT" ? "Porcentaje de descuento" : "Monto de descuento ($)"}</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                {...register("value", { valueAsNumber: true })}
                className="border-ink-border bg-ink text-bone"
              />
              {errors.value && <p className="text-xs text-danger">{errors.value.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minPurchase">Compra mínima ($, opcional)</Label>
              <Input
                id="minPurchase"
                type="number"
                step="0.01"
                min="0"
                placeholder="Sin mínimo"
                {...register("minPurchase", { setValueAs: optionalNumber })}
                className="border-ink-border bg-ink text-bone"
              />
              {errors.minPurchase && <p className="text-xs text-danger">{errors.minPurchase.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                placeholder="Ilimitado"
                {...register("maxUses", { setValueAs: optionalNumber })}
                className="border-ink-border bg-ink text-bone"
              />
              {errors.maxUses && <p className="text-xs text-danger">{errors.maxUses.message}</p>}
            </div>
            <div className="flex items-center gap-2 pt-7">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
                id="isActive"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Cupón activo</Label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validFrom">Válido desde</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                {...register("validFrom", { valueAsDate: true })}
                className="border-ink-border bg-ink text-bone"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validUntil">Válido hasta</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                {...register("validUntil", { valueAsDate: true })}
                className="border-ink-border bg-ink text-bone"
              />
            </div>
          </div>
          {errors.validFrom && <p className="text-xs text-danger">La fecha de inicio es inválida.</p>}
          {errors.validUntil && <p className="text-xs text-danger">La fecha de fin es inválida.</p>}

          {mutation.isError && (
            <p className="text-sm text-danger">
              No se pudo guardar. ¿El código no estará repetido?
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-ink-border bg-transparent text-bone"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-gradient-gold text-ink hover:opacity-90"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {coupon ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
