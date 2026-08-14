import { render } from "react-email";
import { Resend } from "resend";

import {
  OrderDeliveredEmail,
  OrderReceivedEmail,
  OrderShippedEmail,
  PaymentApprovedEmail,
  PaymentRejectedEmail,
  type OrderEmailData,
} from "@/emails/customer-emails";
import {
  ContactMessageOwnerEmail,
  LowStockAlertEmail,
  NewOrderOwnerEmail,
} from "@/emails/admin-emails";
import { db } from "@/lib/db";

/**
 * Emails (sección 7 y 8 del prompt maestro): Resend + React Email con el
 * branding dark. Todo es best-effort — si no hay `RESEND_API_KEY` o el
 * envío falla, se loguea y el flujo principal (checkout, webhook, admin)
 * sigue igual.
 */

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY no seteada — se omitió el envío a "${to}" (${subject})`);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "DIAMONDVA.Co <pedidos@diamondva.co>",
      to,
      subject,
      html,
    });
  } catch (error) {
    // Un fallo acá nunca debe tirar abajo el flujo principal.
    console.error(`[email] falló el envío a "${to}" (${subject}):`, error);
  }
}

export type CustomerEmailKind = "received" | "approved" | "rejected" | "shipped" | "delivered";

async function loadOrderEmailData(orderId: string): Promise<OrderEmailData | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;

  return {
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    publicCode: order.publicCode,
    total: order.total.toNumber(),
    paymentMethod: order.paymentMethod,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toNumber(),
    })),
    trackingCode: order.trackingCode,
    siteUrl: siteUrl(),
  };
}

export async function sendOrderCustomerEmail(orderId: string, kind: CustomerEmailKind): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const data = await loadOrderEmailData(orderId);
  if (!data) {
    console.error(`[email] no se encontró el pedido ${orderId} para el email ${kind}`);
    return;
  }

  const html = await render(buildTemplate(kind, data));
  await sendEmail({
    to: await orderEmailAddress(orderId),
    subject: subjectFor(kind, data),
    html,
  });
}

function buildTemplate(kind: CustomerEmailKind, data: OrderEmailData) {
  switch (kind) {
    case "received":
      return OrderReceivedEmail({ data });
    case "approved":
      return PaymentApprovedEmail({ data });
    case "rejected":
      return PaymentRejectedEmail({ data });
    case "shipped":
      return OrderShippedEmail({ data });
    case "delivered":
      return OrderDeliveredEmail({ data });
  }
}

function subjectFor(kind: CustomerEmailKind, data: OrderEmailData): string {
  switch (kind) {
    case "received":
      return `Tu pedido ${data.orderNumber} fue recibido — DIAMONDVA.Co`;
    case "approved":
      return `Pago aprobado — ${data.orderNumber} — DIAMONDVA.Co`;
    case "rejected":
      return `Pago rechazado — ${data.orderNumber} — DIAMONDVA.Co`;
    case "shipped":
      return `Tu pedido fue enviado — ${data.orderNumber} — DIAMONDVA.Co`;
    case "delivered":
      return `Tu pedido fue entregado — ${data.orderNumber} — DIAMONDVA.Co`;
  }
}

async function orderEmailAddress(orderId: string): Promise<string> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { customerEmail: true },
  });
  return order?.customerEmail ?? "";
}

export async function sendNewOrderOwnerEmail(orderId: string): Promise<void> {
  const owner = process.env.OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !owner) return;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const html = await render(
    NewOrderOwnerEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total.toNumber(),
      items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
      adminUrl: `${siteUrl()}/admin/pedidos`,
    })
  );
  await sendEmail({ to: owner, subject: `Nuevo pedido ${order.orderNumber}`, html });
}

export async function sendContactMessageEmail(messageId: string): Promise<void> {
  const owner = process.env.OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !owner) return;

  const message = await db.contactMessage.findUnique({ where: { id: messageId } });
  if (!message) return;

  const html = await render(
    ContactMessageOwnerEmail({
      name: message.name,
      email: message.email,
      phone: message.phone,
      message: message.message,
      adminUrl: `${siteUrl()}/admin/mensajes`,
    })
  );
  await sendEmail({ to: owner, subject: `Mensaje de ${message.name} — contacto`, html });
}

export async function sendLowStockAlert({
  productName,
  sku,
  stock,
  lowStockAlert,
}: {
  productName: string;
  sku: string;
  stock: number;
  lowStockAlert: number;
}): Promise<void> {
  const owner = process.env.OWNER_EMAIL;
  if (!process.env.RESEND_API_KEY || !owner) return;

  const html = await render(
    LowStockAlertEmail({
      productName,
      sku,
      stock,
      lowStockAlert,
      adminUrl: `${siteUrl()}/admin/productos`,
    })
  );
  await sendEmail({ to: owner, subject: `Stock bajo: ${productName}`, html });
}
