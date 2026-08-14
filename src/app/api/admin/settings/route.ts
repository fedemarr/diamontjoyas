import { NextResponse, type NextRequest } from "next/server";

import { getSettingsState, updateSettingsState } from "@/lib/admin-settings";
import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { settingsUpdateSchema } from "@/lib/validations/settings";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const settings = await getSettingsState();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = settingsUpdateSchema.parse(body);

    const before = await getSettingsState();
    const settings = await updateSettingsState(data);

    await logAudit({
      userId: session.user.id,
      action: "SETTINGS_UPDATE",
      entity: "Setting",
      entityId: "settings",
      changes: { before, after: settings },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
