import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-errors";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { customerRegisterSchema } from "@/lib/validations/customer-auth";

const BCRYPT_COST = 12;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`registro-cliente:${ip}`, 6, 10 * 60 * 1000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá unos minutos y volvé a intentar." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const data = customerRegisterSchema.parse(body);

    const existing = await db.customer.findUnique({ where: { email: data.email } });
    if (existing && !existing.deletedAt) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    if (existing?.deletedAt) {
      // Reactiva una cuenta previamente borrada en vez de duplicar el email único.
      await db.customer.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: data.name,
          phone: data.phone || null,
          deletedAt: null,
        },
      });
    } else {
      await db.customer.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          phone: data.phone || null,
        },
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
