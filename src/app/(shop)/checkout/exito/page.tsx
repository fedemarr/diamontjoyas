import { CheckCircle2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildWhatsappUrl, getPublicSettings } from "@/lib/queries/settings";
import { getOrderByPublicCode } from "@/lib/queries/orders";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function CheckoutExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const order = code ? await getOrderByPublicCode(code.toUpperCase()) : null;
  const settings = await getPublicSettings();

  const whatsappUrl = order
    ? buildWhatsappUrl(
        settings.whatsapp,
        `Hola! Te paso el comprobante del pedido *${order.orderNumber}*.`
      )
    : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <CheckCircle2 className="size-14 text-success" strokeWidth={1.2} />
      <h1 className="font-display text-3xl font-semibold text-bone">¡Gracias por tu compra!</h1>
      {order ? (
        <p className="text-silver">
          Tu pedido <span className="text-bone">{order.orderNumber}</span> quedó registrado. Te
          mandamos un email a tu casilla con todos los detalles.
        </p>
      ) : (
        <p className="text-silver">Tu pedido quedó registrado.</p>
      )}

      {order?.paymentMethod === "TRANSFERENCIA" && (
        <p className="text-sm text-gold-light">
          No te olvides de transferir y enviarnos el comprobante para confirmar tu pedido.
        </p>
      )}
      {order?.paymentMethod === "EFECTIVO" && (
        <p className="text-sm text-gold-light">
          Te esperamos en el local de San Miguel para coordinar el pago y la entrega.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {whatsappUrl && (
          <Button asChild className="bg-success text-white hover:bg-success/90">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Enviar comprobante por WhatsApp
            </a>
          </Button>
        )}
        {order && (
          <Button asChild variant="outline" className="border-ink-border bg-transparent text-bone">
            <Link href={`/seguimiento/${order.publicCode}`}>Seguir mi pedido</Link>
          </Button>
        )}
      </div>

      <Link href="/tienda" className="mt-6 text-sm text-silver hover:text-gold">
        Seguir comprando →
      </Link>
    </div>
  );
}
