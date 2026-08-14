"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ordersApi } from "@/lib/admin-api";
import { formatARS } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  orderStatusBadgeClass,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentStatusBadgeClass,
} from "@/lib/order-labels";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/admin";

export default function PedidosPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", { q: debouncedSearch, orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo, page }],
    queryFn: () =>
      ordersApi.list({
        q: debouncedSearch || undefined,
        orderStatus: orderStatus === "all" ? undefined : orderStatus,
        paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
        paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
      }),
  });

  const orders = data?.orders ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bone">Pedidos</h1>
          <p className="text-sm text-silver">{data?.total ?? 0} pedidos</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, código, cliente o email..."
          className="max-w-xs border-ink-border bg-ink-soft text-bone placeholder:text-silver/70"
        />
        <Select value={orderStatus} onValueChange={setOrderStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Pago" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pagos</SelectItem>
            {(Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Método" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los métodos</SelectItem>
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Desde"
          className="w-40 border-ink-border bg-ink-soft text-bone"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Hasta"
          className="w-40 border-ink-border bg-ink-soft text-bone"
        />
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft">
        {isLoading ? (
          <p className="p-6 text-sm text-silver">Cargando pedidos...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-danger">No se pudieron cargar los pedidos.</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-silver">No hay pedidos con estos filtros.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium text-bone">{o.orderNumber}</p>
                    <p className="text-xs text-silver">Código: {o.publicCode}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-bone">{o.customerName}</p>
                    <p className="text-xs text-silver">{o.customerEmail}</p>
                  </TableCell>
                  <TableCell className="text-silver">
                    {new Date(o.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-silver">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</TableCell>
                  <TableCell className="text-bone">{formatARS(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={paymentStatusBadgeClass(o.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={orderStatusBadgeClass(o.orderStatus)}>
                      {ORDER_STATUS_LABELS[o.orderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        aria-label={`Ver pedido ${o.orderNumber}`}
                        className="text-silver hover:bg-ink-border hover:text-gold"
                      >
                        <Link href={`/admin/pedidos/${o.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-silver">
            Página {data.page} de {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-ink-border bg-transparent text-bone"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-ink-border bg-transparent text-bone"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
