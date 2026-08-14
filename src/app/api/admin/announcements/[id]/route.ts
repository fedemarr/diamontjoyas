import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { announcementSchema } from "@/lib/validations/banner";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = announcementSchema.parse(body);

    const before = await db.announcement.findUniqueOrThrow({ where: { id } });

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        text: data.text,
        linkUrl: data.linkUrl || null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ANNOUNCEMENT_UPDATE",
      entity: "Announcement",
      entityId: announcement.id,
      changes: { before, after: data },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const before = await db.announcement.findUniqueOrThrow({ where: { id } });

    await db.announcement.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "ANNOUNCEMENT_DELETE",
      entity: "Announcement",
      entityId: id,
      changes: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
