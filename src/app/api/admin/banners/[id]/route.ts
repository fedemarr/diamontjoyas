import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validations/banner";

function serialize(banner: { startsAt: Date | null; endsAt: Date | null; [key: string]: unknown }) {
  return {
    ...banner,
    startsAt: banner.startsAt?.toISOString() ?? null,
    endsAt: banner.endsAt?.toISOString() ?? null,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = bannerSchema.parse(body);

    const before = await db.banner.findUniqueOrThrow({ where: { id } });

    const banner = await db.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        linkUrl: data.linkUrl || null,
        order: data.order,
        isActive: data.isActive,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "BANNER_UPDATE",
      entity: "Banner",
      entityId: banner.id,
      changes: { before, after: data },
    });

    return NextResponse.json({ banner: serialize(banner) });
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
    const before = await db.banner.findUniqueOrThrow({ where: { id } });

    await db.banner.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "BANNER_DELETE",
      entity: "Banner",
      entityId: id,
      changes: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
