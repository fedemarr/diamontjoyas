import { MessageCircle, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildWhatsappUrl, getPublicSettings } from "@/lib/queries/settings";
import { getOrderByPublicCode } from "@/lib/queries/orders";

export const metadata: Metadata = { title: "Hubo un problema con el pago" };

export default async function CheckoutErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const order = code ? await getOrderByPublicCode(code.toUpperCase()) : null;
  const settings = await getPublicSettings();
  const whatsappUrl = buildWhatsappUrl(
    settings.whatsapp,
    order
      ? `Hola! Tuve un problema pagando el pedido ${order.orderNumber}, ¿me ayudan?`
      : "Hola! Tuve un problema pagando mi pedido, ¿me ayudan?"
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <XCircle className="size-14 text-danger" strokeWidth={1.2} />
      <h1 className="font-display text-3xl font-semibold text-bone">El pago no se pudo procesar</h1>
      <p className="text-silver">
        {order ? (
          <>
            El pedido <span className="text-bone">{order.orderNumber}</span> quedó registrado, pero el
            pago no se completó. Podés intentar de nuevo o escribirnos.
          </>
        ) : (
          "El pago no se completó. Podés intentar de nuevo o escribirnos."
        )}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="bg-gradient-gold text-ink">
          <Link href="/checkout">Volver a intentar</Link>
        </Button>
        {whatsappUrl && (
          <Button asChild variant="outline" className="border-ink-border bg-transparent text-bone">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Escribinos por WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
