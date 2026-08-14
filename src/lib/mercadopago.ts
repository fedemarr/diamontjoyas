import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

/**
 * Integración Mercado Pago Checkout Pro (sección 6 del prompt maestro).
 * `MP_ENVIRONMENT` es solo documentación de qué credencial estás usando
 * (test vs producción) — el comportamiento sandbox/real lo determina el
 * propio `MP_ACCESS_TOKEN` (empieza con `TEST-` en sandbox).
 */

export class MercadoPagoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MercadoPagoConfigError";
  }
}

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new MercadoPagoConfigError(
      "Mercado Pago no está configurado todavía — completá MP_ACCESS_TOKEN en .env."
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

export interface PreferenceItemInput {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export async function createPaymentPreference(params: {
  orderId: string;
  orderNumber: string;
  items: PreferenceItemInput[];
  shippingCost: number;
  customerName: string;
  customerEmail: string;
  publicCode: string;
}) {
  const client = getClient();
  const preferenceClient = new Preference(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const items = params.items.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "ARS",
  }));

  if (params.shippingCost > 0) {
    items.push({
      id: "envio",
      title: "Envío",
      quantity: 1,
      unit_price: params.shippingCost,
      currency_id: "ARS",
    });
  }

  const preference = await preferenceClient.create({
    body: {
      items,
      payer: { name: params.customerName, email: params.customerEmail },
      external_reference: params.orderId,
      statement_descriptor: "DIAMONDVA",
      back_urls: {
        success: `${siteUrl}/checkout/exito?code=${params.publicCode}`,
        pending: `${siteUrl}/checkout/pendiente?code=${params.publicCode}`,
        failure: `${siteUrl}/checkout/error?code=${params.publicCode}`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    },
  });

  return preference;
}

export async function fetchPayment(paymentId: string) {
  const client = getClient();
  const paymentClient = new Payment(client);
  return paymentClient.get({ id: paymentId });
}

export type MpPaymentStatus =
  | "approved"
  | "pending"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type OrderPaymentStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_PROCESS"
  | "REJECTED"
  | "REFUNDED"
  | "CANCELLED";

/** Mapeo del status de MP al enum PaymentStatus del schema (sección 6). */
export function mapMpStatusToPaymentStatus(status: string): OrderPaymentStatus {
  switch (status as MpPaymentStatus) {
    case "approved":
      return "APPROVED";
    case "pending":
      return "PENDING";
    case "authorized":
    case "in_process":
    case "in_mediation":
      return "IN_PROCESS";
    case "rejected":
      return "REJECTED";
    case "cancelled":
      return "CANCELLED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}
