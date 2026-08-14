import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { announcementSchema } from "@/lib/validations/banner";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const announcements = await db.announcement.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ announcements });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = announcementSchema.parse(body);

    const announcement = await db.announcement.create({
      data: {
        text: data.text,
        linkUrl: data.linkUrl || null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ANNOUNCEMENT_CREATE",
      entity: "Announcement",
      entityId: announcement.id,
      changes: { after: data },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
