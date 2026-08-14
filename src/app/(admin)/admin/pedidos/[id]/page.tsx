"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MessageCircle, Printer, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ordersApi } from "@/lib/admin-api";
import { buildWhatsappUrl } from "@/lib/queries/settings";
import { formatARS } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  orderStatusBadgeClass,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentStatusBadgeClass,
  SHIPPING_METHOD_LABELS,
} from "@/lib/order-labels";
import type { OrderStatus, PaymentStatus } from "@/types/admin";

export default function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [trackingCode, setTrackingCode] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id),
  });

  const order = data?.order;

  useEffect(() => {
    if (order) {
      setTrackingCode(order.trackingCode ?? "");
      setInternalNotes(order.internalNotes ?? "");
    }
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useMutation({
    mutationFn: (patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }) =>
      ordersApi.update(id, patch),
    onSuccess: (res) => {
      queryClient.setQueryData(["order", id], res);
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: () => ordersApi.update(id, { trackingCode: trackingCode || null, internalNotes: internalNotes || null }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => setSaveError(err instanceof Error ? err.message : "No se pudo guardar."),
  });

  if (isLoading) {
    return <p className="text-sm text-silver">Cargando pedido...</p>;
  }
  if (isError || !order) {
    return <p className="text-sm text-danger">No se pudo cargar el pedido.</p>;
  }

  const address = order.shippingAddress;
  const whatsappUrl =
    order.customerPhone &&
    buildWhatsappUrl(
      order.customerPhone,
      `Hola ${order.customerName}! Te escribimos por tu pedido ${order.orderNumber} (código ${order.publicCode}).`
    );

  const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const lineCost = order.items.reduce(
    (acc, i) => acc + (i.unitCost ?? 0) * i.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Remito imprimible — solo visible al imprimir */}
      <div id="print-remito" className="hidden print:block">
        <div className="flex items-center justify-between border-b border-ink-border pb-4">
          <div>
            <p className="font-display text-2xl font-semibold text-bone">
              DIAMOND<span className="text-gradient-gold">VA.Co</span>
            </p>
            <p className="text-xs text-silver">San Miguel, Buenos Aires · @diamondva.co</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-bone">{order.orderNumber}</p>
            <p className="text-xs text-silver">{new Date(order.createdAt).toLocaleString("es-AR")}</p>
            <p className="text-xs text-silver">Código de seguimiento: {order.publicCode}</p>
          </div>
        </div>
        <h2 className="mt-4 text-sm font-semibold tracking-luxury text-gold-light uppercase">Remito</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-bone">{order.customerName}</p>
            <p className="text-silver">{order.customerEmail}</p>
            <p className="text-silver">{order.customerPhone}</p>
            <p className="text-silver">{order.customerDni ? `DNI: ${order.customerDni}` : ""}</p>
          </div>
          <div>
            <p className="font-medium text-bone">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {order.shippingMethod !== "RETIRO_LOCAL" && address && (
              <p className="text-silver">
                {address.street} {address.number}
                {address.floor ? `, ${address.floor}` : ""} — {address.city}, {address.province} (
                {address.postalCode})
              </p>
            )}
          </div>
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-silver">{item.productSku}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatARS(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{formatARS(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex flex-col items-end gap-1 text-sm">
          <p className="text-silver">Subtotal: {formatARS(order.subtotal)}</p>
          {order.discount > 0 && <p className="text-silver">Descuento: -{formatARS(order.discount)}</p>}
          <p className="text-silver">Envío: {formatARS(order.shippingCost)}</p>
          <p className="text-lg font-semibold text-bone">Total: {formatARS(order.total)}</p>
        </div>
      </div>

      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1 text-sm text-silver transition-colors hover:text-gold"
          >
            <ArrowLeft className="size-4" />
            Volver a pedidos
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-bone">{order.orderNumber}</h1>
          <p className="text-sm text-silver">Creado el {new Date(order.createdAt).toLocaleString("es-AR")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {whatsappUrl && (
            <Button
              asChild
              variant="outline"
              className="border-ink-border bg-transparent text-bone hover:border-success hover:text-success"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                Contactar por WhatsApp
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-ink-border bg-transparent text-bone"
          >
            <Printer className="size-4" />
            Imprimir remito
          </Button>
        </div>
      </div>

      {/* Estados */}
      <div className="grid gap-4 sm:grid-cols-2 print:hidden">
        <div className="flex flex-col gap-2 rounded-lg border border-ink-border bg-ink-soft p-5">
          <Label>Estado del pedido</Label>
          <Select
            value={order.orderStatus}
            onValueChange={(v) => updateMutation.mutate({ orderStatus: v as OrderStatus })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updateMutation.isPending && <p className="text-xs text-silver">Guardando...</p>}
          {updateMutation.isError && (
            <p className="text-xs text-danger">No se pudo actualizar. Probá de nuevo.</p>
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-ink-border bg-ink-soft p-5">
          <Label>Estado del pago</Label>
          <Select
            value={order.paymentStatus}
            onValueChange={(v) => updateMutation.mutate({ paymentStatus: v as PaymentStatus })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {order.paymentMethod !== "MERCADO_PAGO" && order.paymentStatus === "PENDING" && (
            <p className="text-xs text-silver">
              Al marcar &quot;Aprobado&quot; se descuenta el stock y el pedido pasa a Confirmado
              automáticamente.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        {/* Cliente */}
        <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Cliente</h2>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <p className="font-medium text-bone">{order.customerName}</p>
            <a className="text-silver hover:text-gold" href={`mailto:${order.customerEmail}`}>
              {order.customerEmail}
            </a>
            <p className="text-silver">{order.customerPhone}</p>
            {order.customerDni && <p className="text-xs text-silver">DNI: {order.customerDni}</p>}
            {order.customerNotes && (
              <p className="mt-2 rounded-md border border-ink-border bg-ink p-2 text-xs text-silver">
                <span className="text-gold-light">Notas del cliente:</span> {order.customerNotes}
              </p>
            )}
          </div>
        </div>

        {/* Envío */}
        <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Envío</h2>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <p className="text-bone">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {order.shippingMethod !== "RETIRO_LOCAL" && address ? (
              <p className="text-silver">
                {address.street} {address.number}
                {address.floor ? `, ${address.floor}` : ""}
                <br />
                {address.city}, {address.province} ({address.postalCode})
              </p>
            ) : (
              <p className="text-silver">Retiro en local (San Miguel).</p>
            )}
            <p className="text-xs text-silver">Costo: {formatARS(order.shippingCost)}</p>
            {order.trackingCode && (
              <p className="text-xs text-gold-light">Seguimiento: {order.trackingCode}</p>
            )}
          </div>
        </div>

        {/* Pago */}
        <div className="rounded-lg border border-ink-border bg-ink-soft p-5">
          <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">Pago</h2>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <p className="text-bone">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={paymentStatusBadgeClass(order.paymentStatus)}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
              <Badge variant="outline" className={orderStatusBadgeClass(order.orderStatus)}>
                {ORDER_STATUS_LABELS[order.orderStatus]}
              </Badge>
            </div>
            {order.paymentMethod === "MERCADO_PAGO" && (
              <p className="text-xs text-silver">
                {order.mpPaymentId ? `Pago MP: ${order.mpPaymentId}` : "Sin pago de MP todavía"}
              </p>
            )}
            {order.couponCode && (
              <p className="text-xs text-gold-light">Cupón: {order.couponCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-ink-border bg-ink-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right print:hidden">Costo</TableHead>
              <TableHead className="text-right print:hidden">Margen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-bone">{item.productName}</TableCell>
                <TableCell className="text-silver">{item.productSku}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatARS(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{formatARS(item.subtotal)}</TableCell>
                <TableCell className="text-right text-silver print:hidden">
                  {formatARS((item.unitCost ?? 0) * item.quantity)}
                </TableCell>
                <TableCell className="text-right text-silver print:hidden">
                  {formatARS(item.subtotal - (item.unitCost ?? 0) * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-end gap-1 border-t border-ink-border px-4 py-3 text-sm">
          <p className="text-silver">
            Subtotal ({totalItems} ítems): <span className="text-bone">{formatARS(order.subtotal)}</span>
          </p>
          {order.discount > 0 && (
            <p className="text-silver">
              Descuento: <span className="text-success">-{formatARS(order.discount)}</span>
            </p>
          )}
          <p className="text-silver">
            Envío: <span className="text-bone">{formatARS(order.shippingCost)}</span>
          </p>
          <p className="text-lg font-semibold text-bone">Total: {formatARS(order.total)}</p>
          <p className="text-xs text-silver print:hidden">
            Costo total estimado: {formatARS(lineCost)} · Margen bruto: {formatARS(order.total - order.shippingCost + order.discount - lineCost)}
          </p>
        </div>
      </div>

      {/* Notas internas y tracking */}
      <div className="flex flex-col gap-4 rounded-lg border border-ink-border bg-ink-soft p-5 print:hidden">
        <h2 className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Seguimiento y notas internas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tracking">Código de seguimiento del correo</Label>
            <Input
              id="tracking"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ej: 3A123456789AR"
              className="border-ink-border bg-ink text-bone"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notas internas (solo el equipo las ve)</Label>
            <Textarea
              id="notes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              placeholder="Notas para vos, no se muestran al cliente"
              className="border-ink-border bg-ink text-bone"
            />
          </div>
        </div>
        {saveError && <p className="text-sm text-danger">{saveError}</p>}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => saveNotesMutation.mutate()}
            disabled={saveNotesMutation.isPending}
            className="bg-gradient-gold text-ink hover:opacity-90"
          >
            {saveNotesMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Guardar
          </Button>
          {saved && <span className="text-sm text-success">Guardado</span>}
        </div>
      </div>
    </div>
  );
}
