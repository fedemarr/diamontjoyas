import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOrderByPublicCode } from "@/lib/queries/orders";

export const metadata: Metadata = { title: "Pago pendiente" };

export default async function CheckoutPendientePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const order = code ? await getOrderByPublicCode(code.toUpperCase()) : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <Clock className="size-14 text-gold" strokeWidth={1.2} />
      <h1 className="font-display text-3xl font-semibold text-bone">Tu pago está pendiente</h1>
      <p className="text-silver">
        {order ? (
          <>
            Estamos esperando la confirmación de Mercado Pago para el pedido{" "}
            <span className="text-bone">{order.orderNumber}</span>. Puede tardar hasta 48hs según el
            medio de pago (ej. pago en efectivo en Rapipago/Pago Fácil).
          </>
        ) : (
          "Estamos esperando la confirmación de tu pago."
        )}
      </p>

      <div className="mt-4 flex gap-3">
        {order && (
          <Button asChild className="bg-gradient-gold text-ink">
            <Link href={`/seguimiento/${order.publicCode}`}>Ver estado del pedido</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
