import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { contactMessageListQuerySchema } from "@/lib/validations/contact";

export async function GET(request: NextRequest) {
  const { response } = await requireSession();
  if (response) return response;

  const parsed = contactMessageListQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  const where: Prisma.ContactMessageWhereInput = {
    ...(parsed.isRead ? { isRead: parsed.isRead === "true" } : {}),
    ...(parsed.q
      ? {
          OR: [
            { name: { contains: parsed.q, mode: "insensitive" } },
            { email: { contains: parsed.q, mode: "insensitive" } },
            { message: { contains: parsed.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, unread, messages] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.contactMessage.findMany({
      where,
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
    }),
  ]);

  return NextResponse.json({
    messages: messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    total,
    unread,
    page: parsed.page,
    pageSize: parsed.pageSize,
    totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
  });
}
