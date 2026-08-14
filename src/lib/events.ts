/**
 * Hook extensible (sección 7 del prompt maestro): un único punto por el
 * que pasan los eventos de negocio. Hoy solo loguea y opcionalmente
 * reenvía a n8n — el envío real de emails/WhatsApp se conecta acá mismo
 * en la Fase 8, sin tener que tocar los call-sites (checkout, webhook).
 */

export type AppEvent =
  | "order.created"
  | "order.payment_approved"
  | "order.payment_rejected"
  | "order.shipped"
  | "order.delivered"
  | "contact.message_received";

export async function emitEvent(event: AppEvent, payload: Record<string, unknown>): Promise<void> {
  console.log(`[event] ${event}`, JSON.stringify(payload));

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
