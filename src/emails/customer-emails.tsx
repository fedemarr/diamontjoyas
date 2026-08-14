import { Section, Text } from "react-email";

import {
  EmailButton,
  EmailCode,
  EmailHeading,
  EmailHr,
  EmailShell,
  EmailText,
  formatARS,
} from "@/emails/email-shell";

export interface OrderEmailData {
  customerName: string;
  orderNumber: string;
  publicCode: string;
  total: number;
  paymentMethod: "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO";
  items: { productName: string; quantity: number; unitPrice: number }[];
  trackingCode: string | null;
  siteUrl: string;
}

const PAYMENT_METHOD_LABEL: Record<OrderEmailData["paymentMethod"], string> = {
  MERCADO_PAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia bancaria",
  EFECTIVO: "Efectivo en local",
};

function trackingUrl(publicCode: string, siteUrl: string) {
  return `${siteUrl}/seguimiento/${publicCode}`;
}

export function OrderReceivedEmail({ data }: { data: OrderEmailData }) {
  const needsProof = data.paymentMethod === "TRANSFERENCIA";
  return (
    <EmailShell preview={`Pedido ${data.orderNumber} recibido — DIAMONDVA.Co`} title="Pedido recibido">
      <EmailHeading>¡Gracias por tu compra, {data.customerName}!</EmailHeading>
      <EmailText>
        Recibimos tu pedido <strong>{data.orderNumber}</strong>. Este es tu código de seguimiento:
      </EmailText>
      <EmailCode>{data.publicCode}</EmailCode>
      <EmailText muted>Total: {formatARS(data.total)} · Pago: {PAYMENT_METHOD_LABEL[data.paymentMethod]}</EmailText>
      <EmailHr />
      {data.items.map((item) => (
        <Section key={`${item.productName}-${item.quantity}`} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <Text style={{ margin: 0, fontSize: 13, color: "#f3efe6" }}>
            {item.productName} × {item.quantity}
          </Text>
          <Text style={{ margin: 0, fontSize: 13, color: "#a3a1ab" }}>{formatARS(item.unitPrice * item.quantity)}</Text>
        </Section>
      ))}
      <EmailHr />
      <EmailButton href={trackingUrl(data.publicCode, data.siteUrl)}>Seguí tu pedido</EmailButton>
      {needsProof && (
        <EmailText muted>
          Como elegiste transferencia, el pedido queda pendiente hasta que confirmemos tu pago. Si ya
          transferiste, enviá el comprobante por WhatsApp para agilizar la confirmación.
        </EmailText>
      )}
    </EmailShell>
  );
}

export function PaymentApprovedEmail({ data }: { data: OrderEmailData }) {
  return (
    <EmailShell preview={`Pago aprobado — ${data.orderNumber}`} title="Pago aprobado">
      <EmailHeading>¡Pago confirmado!</EmailHeading>
      <EmailText>
        Aprobamos el pago de tu pedido <strong>{data.orderNumber}</strong>. Ya lo estamos preparando
        para enviarte con mucho cuidado.
      </EmailText>
      <EmailText muted>Total: {formatARS(data.total)} · Pago: {PAYMENT_METHOD_LABEL[data.paymentMethod]}</EmailText>
      <EmailButton href={trackingUrl(data.publicCode, data.siteUrl)}>Ver estado del pedido</EmailButton>
      <EmailText muted>
        En cuanto se despache, vas a recibir otro mail con el código de seguimiento.
      </EmailText>
    </EmailShell>
  );
}

export function PaymentRejectedEmail({ data }: { data: OrderEmailData }) {
  return (
    <EmailShell preview={`Pago rechazado — ${data.orderNumber}`} title="Pago rechazado">
      <EmailHeading>No pudimos procesar tu pago</EmailHeading>
      <EmailText>
        Tu pedido <strong>{data.orderNumber}</strong> quedó guardado, pero el pago no se pudo completar.
        No te preocupes — podés volver a intentarlo desde la tienda con otra tarjeta o medio de pago.
      </EmailText>
      <EmailText muted>Total pendiente: {formatARS(data.total)}</EmailText>
      <EmailButton href={trackingUrl(data.publicCode, data.siteUrl)}>Ver mi pedido</EmailButton>
      <EmailText muted>
        ¿Preferís transferencia o efectivo? Escribinos por WhatsApp y lo coordinamos.
      </EmailText>
    </EmailShell>
  );
}

export function OrderShippedEmail({ data }: { data: OrderEmailData }) {
  return (
    <EmailShell preview={`Tu pedido fue enviado — ${data.orderNumber}`} title="Pedido enviado">
      <EmailHeading>¡Tu pedido está viajando!</EmailHeading>
      <EmailText>
        Despachamos tu pedido <strong>{data.orderNumber}</strong>.
        {data.trackingCode ? (
          <>
            {" "}Tu código de seguimiento es <strong>{data.trackingCode}</strong>.
          </>
        ) : (
          " Pronto vas a tener el código de seguimiento."
        )}
      </EmailText>
      <EmailButton href={trackingUrl(data.publicCode, data.siteUrl)}>Seguir mi pedido</EmailButton>
      <EmailText muted>
        Cuando lo recibas, marcá tu pedido como entregado desde el link de seguimiento.
      </EmailText>
    </EmailShell>
  );
}

export function OrderDeliveredEmail({ data }: { data: OrderEmailData }) {
  return (
    <EmailShell preview={`¡Pedido entregado! ${data.orderNumber}`} title="Pedido entregado">
      <EmailHeading>¡Llegó tu pedido!</EmailHeading>
      <EmailText>
        Esperamos que disfrutes tus piezas de <strong>{data.orderNumber}</strong>. ¡Gracias por
        confiar en DIAMONDVA.Co!
      </EmailText>
      <EmailText muted>
        Cuidá tu joya: evitá contacto con perfumes y productos químicos, y guardala en su cajita.
      </EmailText>
    </EmailShell>
  );
}
