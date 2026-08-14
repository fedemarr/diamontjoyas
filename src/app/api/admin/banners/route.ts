import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validations/banner";

export async function GET() {
  const { response } = await requireSession();
  if (response) return response;

  const banners = await db.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({
    banners: banners.map((b) => ({
      ...b,
      startsAt: b.startsAt?.toISOString() ?? null,
      endsAt: b.endsAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const data = bannerSchema.parse(body);

    const banner = await db.banner.create({
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
      action: "BANNER_CREATE",
      entity: "Banner",
      entityId: banner.id,
      changes: { after: data },
    });

    return NextResponse.json({ banner: { ...banner, startsAt: banner.startsAt?.toISOString() ?? null, endsAt: banner.endsAt?.toISOString() ?? null } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
