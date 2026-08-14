import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderTimeline, PaymentStatusBadge } from "@/components/shop/order-status";
import { formatARS } from "@/lib/format";
import { getOrderByPublicCode } from "@/lib/queries/orders";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

const SHIPPING_LABELS: Record<string, string> = {
  ENVIO_DOMICILIO: "Envío a domicilio",
  SUCURSAL_CORREO: "Retiro en sucursal de correo",
  RETIRO_LOCAL: "Retiro en local (San Miguel)",
};

export default async function SeguimientoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderByPublicCode(code.toUpperCase());

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-luxury text-gold-light uppercase">
          Pedido {order.orderNumber}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-bone">
          Hola, {order.customerName.split(" ")[0]}
        </h1>
        <div className="mt-2 flex justify-center">
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="rounded-lg border border-ink-border bg-ink-soft p-6">
        <OrderTimeline orderStatus={order.orderStatus} />

        {order.trackingCode && (
          <p className="mt-6 text-center text-sm text-silver">
            Código de seguimiento del envío:{" "}
            <span className="font-semibold text-bone">{order.trackingCode}</span>
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-lg border border-ink-border bg-ink-soft p-6">
        <h2 className="font-display text-lg font-semibold text-bone">Detalle</h2>
        <p className="text-sm text-silver">{SHIPPING_LABELS[order.shippingMethod]}</p>

        <div className="flex flex-col divide-y divide-ink-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-bone">
                {item.quantity}× {item.productName}
              </span>
              <span className="text-silver">{formatARS(item.subtotal.toNumber())}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-ink-border pt-3 text-sm">
          <div className="flex justify-between text-silver">
            <span>Subtotal</span>
            <span>{formatARS(order.subtotal.toNumber())}</span>
          </div>
          {order.discount.toNumber() > 0 && (
            <div className="flex justify-between text-success">
              <span>Descuento</span>
              <span>-{formatARS(order.discount.toNumber())}</span>
            </div>
          )}
          <div className="flex justify-between text-silver">
            <span>Envío</span>
            <span>{formatARS(order.shippingCost.toNumber())}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-ink-border pt-2 text-base font-semibold text-bone">
            <span>Total</span>
            <span className="text-gold-light">{formatARS(order.total.toNumber())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
