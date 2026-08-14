import {
  sendContactMessageEmail,
  sendLowStockAlert,
  sendNewOrderOwnerEmail,
  sendOrderCustomerEmail,
} from "@/lib/email";

/**
 * Hook extensible (sección 7 del prompt maestro): un único punto por el
 * que pasan los eventos de negocio. Acá se conectan los emails (Fase 8)
 * y el reenvío opcional a n8n — los call-sites (checkout, webhook, admin)
 * no saben ni les importa: solo llaman a `emitEvent`.
 */

export type AppEvent =
  | "order.created"
  | "order.payment_approved"
  | "order.payment_rejected"
  | "order.shipped"
  | "order.delivered"
  | "contact.message_received"
  | "stock.low";

export async function emitEvent(event: AppEvent, payload: Record<string, unknown>): Promise<void> {
  console.log(`[event] ${event}`, JSON.stringify(payload));

  await Promise.allSettled([sendEmailsFor(event, payload), forwardToN8n(event, payload)]);
}

async function sendEmailsFor(event: AppEvent, payload: Record<string, unknown>): Promise<void> {
  switch (event) {
    case "order.created":
      if (typeof payload.orderId === "string") {
        await sendOrderCustomerEmail(payload.orderId, "received");
        await sendNewOrderOwnerEmail(payload.orderId);
      }
      break;
    case "order.payment_approved":
      if (typeof payload.orderId === "string") {
        await sendOrderCustomerEmail(payload.orderId, "approved");
      }
      break;
    case "order.payment_rejected":
      if (typeof payload.orderId === "string") {
        await sendOrderCustomerEmail(payload.orderId, "rejected");
      }
      break;
    case "order.shipped":
      if (typeof payload.orderId === "string") {
        await sendOrderCustomerEmail(payload.orderId, "shipped");
      }
      break;
    case "order.delivered":
      if (typeof payload.orderId === "string") {
        await sendOrderCustomerEmail(payload.orderId, "delivered");
      }
      break;
    case "contact.message_received":
      if (typeof payload.messageId === "string") {
        await sendContactMessageEmail(payload.messageId);
      }
      break;
    case "stock.low":
      if (
        typeof payload.productName === "string" &&
        typeof payload.sku === "string" &&
        typeof payload.stock === "number" &&
        typeof payload.lowStockAlert === "number"
      ) {
        await sendLowStockAlert({
          productName: payload.productName,
          sku: payload.sku,
          stock: payload.stock,
          lowStockAlert: payload.lowStockAlert,
        });
      }
      break;
  }
}

async function forwardToN8n(event: AppEvent, payload: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
    });
  } catch (error) {
    // Un fallo acá nunca debe tirar abajo el flujo principal (checkout, webhook).
    console.error(`[event] no se pudo reenviar "${event}" a N8N_WEBHOOK_URL:`, error);
  }
}
