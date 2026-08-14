import { NextResponse, type NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { emitEvent } from "@/lib/events";
import { db } from "@/lib/db";
import { contactMessageSchema } from "@/lib/validations/contact";

/**
 * Formulario de contacto público (sección 4 y 8 del prompt maestro):
 * honeypot oculto + rate limit por IP contra spam.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Demasiados mensajes. Esperá unos minutos y volvé a intentar." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = contactMessageSchema.parse(body);

    // Honeypot: si un bot llenó el campo oculto, se descarta silenciosamente
    // (se responde ok para no avisarle al bot que fue detectado).
    if (data.website) {
      return NextResponse.json({ ok: true });
    }

    const message = await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      },
    });

    await emitEvent("contact.message_received", {
      messageId: message.id,
      name: message.name,
      email: message.email,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
