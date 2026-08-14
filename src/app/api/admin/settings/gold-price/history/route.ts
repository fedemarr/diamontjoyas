import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { db } from "@/lib/db";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const history = await db.auditLog.findMany({
      where: { action: "GOLD_PRICE_CHANGE" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ history });
  } catch (error) {
    return handleApiError(error);
  }
}
