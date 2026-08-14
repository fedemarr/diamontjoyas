import { Section, Text } from "react-email";

import {
  EmailButton,
  EmailHeading,
  EmailHr,
  EmailShell,
  EmailText,
  formatARS,
} from "@/emails/email-shell";

export function NewOrderOwnerEmail({
  orderNumber,
  customerName,
  customerPhone,
  total,
  items,
  adminUrl,
}: {
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
  items: { productName: string; quantity: number }[];
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`Nuevo pedido ${orderNumber}`} title="Nuevo pedido">
      <EmailHeading>Nuevo pedido {orderNumber}</EmailHeading>
      <EmailText>
        {customerName}
        {customerPhone ? ` · ${customerPhone}` : ""} · {formatARS(total)}
      </EmailText>
      <EmailHr />
      {items.map((item) => (
        <Section key={item.productName} style={{ padding: "6px 0" }}>
          <Text style={{ margin: 0, fontSize: 13, color: "#f3efe6" }}>
            {item.productName} × {item.quantity}
          </Text>
        </Section>
      ))}
      <EmailHr />
      <EmailButton href={adminUrl}>Ver en el panel</EmailButton>
    </EmailShell>
  );
}

export function ContactMessageOwnerEmail({
  name,
  email,
  phone,
  message,
  adminUrl,
}: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`Mensaje de contacto de ${name}`} title="Mensaje de contacto">
      <EmailHeading>{name}</EmailHeading>
      <EmailText muted>
        {email}
        {phone ? ` · ${phone}` : ""}
      </EmailText>
      <EmailHr />
      <Text style={{ color: "#f3efe6", fontSize: 14, lineHeight: 1.7, margin: "10px 0", whiteSpace: "pre-wrap" }}>
        {message}
      </Text>
      <EmailHr />
      <EmailButton href={adminUrl}>Responder en el panel</EmailButton>
    </EmailShell>
  );
}

export function LowStockAlertEmail({
  productName,
  sku,
  stock,
  lowStockAlert,
  adminUrl,
}: {
  productName: string;
  sku: string;
  stock: number;
  lowStockAlert: number;
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`Stock bajo: ${productName}`} title="Alerta de stock">
      <EmailHeading>Stock bajo: {productName}</EmailHeading>
      <EmailText muted>
        {sku} · quedan <strong style={{ color: "#e8c874" }}>{stock}</strong> unidades (alerta en{" "}
        {lowStockAlert})
      </EmailText>
      <EmailButton href={adminUrl}>Reponer stock</EmailButton>
    </EmailShell>
  );
}
