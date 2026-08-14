import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { getGoldPrices } from "@/lib/pricing";
import { goldPriceUpdateSchema } from "@/lib/validations/settings";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const goldPrices = await getGoldPrices();
    const [count18k, countLow] = await Promise.all([
      db.product.count({ where: { deletedAt: null, pricingMode: "BY_WEIGHT", material: "ORO_18K" } }),
      db.product.count({ where: { deletedAt: null, pricingMode: "BY_WEIGHT", material: "ORO_BAJO" } }),
    ]);

    return NextResponse.json({
      goldPricePerGram18k: goldPrices.goldPricePerGram18k.toNumber(),
      goldPricePerGramLow: goldPrices.goldPricePerGramLow.toNumber(),
      affectedCount18k: count18k,
      affectedCountLow: countLow,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = goldPriceUpdateSchema.parse(body);

    const before = await getGoldPrices();

    await db.$transaction([
      db.setting.update({
        where: { key: "goldPricePerGram18k" },
        data: { value: data.goldPricePerGram18k },
      }),
      db.setting.update({
        where: { key: "goldPricePerGramLow" },
        data: { value: data.goldPricePerGramLow },
      }),
    ]);

    await logAudit({
      userId: session.user.id,
      action: "GOLD_PRICE_CHANGE",
      entity: "Setting",
      entityId: "goldPricePerGram",
      changes: {
        before: {
          goldPricePerGram18k: before.goldPricePerGram18k.toNumber(),
          goldPricePerGramLow: before.goldPricePerGramLow.toNumber(),
        },
        after: data,
      },
    });

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return handleApiError(error);
  }
}
