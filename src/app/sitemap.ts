import type { MetadataRoute } from "next";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const today = new Date();

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    { url: `${siteUrl}/`, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/tienda`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contacto`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${siteUrl}/categoria/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/producto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
