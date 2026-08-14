import { cache } from "react";

import { db } from "@/lib/db";

export const getActiveAnnouncements = cache(async () => {
  return db.announcement.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
});

export const getActiveBanners = cache(async () => {
  const now = new Date();
  const banners = await db.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return banners.filter(
    (b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now)
  );
});
