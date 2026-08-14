"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CouponFormDialog } from "@/app/(admin)/admin/cupones/coupon-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { couponsApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";
import type { AdminCoupon } from "@/types/admin";

function formatCouponValue(coupon: AdminCoupon): string {
  return coupon.type === "PERCENT" ? `${coupon.value}%` : formatARS(coupon.value);
}

function isActive(coupon: AdminCoupon, now: Date): boolean {
  return (
    coupon.isActive &&
    new Date(coupon.validFrom) <= now &&
    new Date(coupon.validUntil) >= now &&
    (coupon.maxUses == null || coupon.usedCount < coupon.maxUses)
  );
}

export default function CuponesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCoupon | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["coupons"],
    queryFn: couponsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setPendingDelete(null);
    },
  });

  const coupons = data?.coupons ?? [];
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Cupones</h1>
          <p className="text-sm text-silver">
            Descuentos para el checkout. Se activan solos según fechas y usos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-gold text-ink hover:opacity-90"
        >
          <Plus className="size-4" />
          Nuevo cupón
        </Button>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft">
        {isLoading ? (
          <p className="p-6 text-sm text-silver">Cargando cupones...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-danger">No se pudieron cargar los cupones.</p>
        ) : coupons.length === 0 ? (
          <p className="p-6 text-sm text-silver">Todavía no hay cupones.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Compra mínima</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => {
                const active = isActive(c, now);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-bone">{c.code}</TableCell>
                    <TableCell className="text-bone">{formatCouponValue(c)}</TableCell>
                    <TableCell className="text-silver">
                      {c.minPurchase != null ? formatARS(c.minPurchase) : "—"}
                    </TableCell>
                    <TableCell className="text-silver">
                      {c.usedCount}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-silver">
                      {new Date(c.validFrom).toLocaleDateString("es-AR")} →{" "}
                      {new Date(c.validUntil).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={active ? "border-success/40 bg-success/10 text-success" : "border-ink-border text-silver"}
                      >
                        {active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditing(c);
                            setDialogOpen(true);
                          }}
                          aria-label={`Editar ${c.code}`}
                          className="text-silver hover:bg-ink-border hover:text-gold"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPendingDelete(c)}
                          aria-label={`Eliminar ${c.code}`}
                          className="text-silver hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <CouponFormDialog open={dialogOpen} onOpenChange={setDialogOpen} coupon={editing} />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-ink-border bg-ink-soft p-6">
            <h2 className="font-display text-lg font-semibold text-bone">
              ¿Desactivar &quot;{pendingDelete.code}&quot;?
            </h2>
            <p className="mt-2 text-sm text-silver">
              No se borra de verdad: queda desactivado. Los pedidos que ya lo usaron no se tocan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                className="border-ink-border bg-transparent text-bone"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(pendingDelete.id)}
                disabled={deleteMutation.isPending}
                className="bg-danger text-white hover:bg-danger/90"
              >
                Desactivar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
