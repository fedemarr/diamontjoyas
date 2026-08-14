import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { getFinanceSummary } from "@/lib/finanzas";

const DEFAULT_RANGE_DAYS = 30;

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const params = request.nextUrl.searchParams;
  const to = params.get("to") ? new Date(params.get("to")!) : new Date();
  const from = params.get("from")
    ? new Date(params.get("from")!)
    : new Date(to.getTime() - DEFAULT_RANGE_DAYS * 86_400_000);

  const summary = await getFinanceSummary(from, to);
  return NextResponse.json(summary);
}
