import { cache } from "react";

import { db } from "@/lib/db";

export const getActiveCategories = cache(async () => {
  return db.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { order: "asc" },
  });
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return db.category.findFirst({
    where: { slug, isActive: true, deletedAt: null },
  });
});
