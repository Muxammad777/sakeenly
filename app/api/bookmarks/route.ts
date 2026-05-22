import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

const ayahKeySchema = z
  .string()
  .regex(/^\d{1,3}:\d{1,4}$/, "ayahKey must look like '2:255'");

const postSchema = z.object({
  ayahKey: ayahKeySchema,
  note: z.string().max(2000).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ayahKey: true,
      note: true,
      tags: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", issues: parsed.error.issues }, { status: 400 });
  }

  const bookmark = await db.bookmark.upsert({
    where: { userId_ayahKey: { userId: user.id, ayahKey: parsed.data.ayahKey } },
    create: {
      userId: user.id,
      ayahKey: parsed.data.ayahKey,
      note: parsed.data.note ?? null,
      tags: parsed.data.tags ?? [],
    },
    update: {
      note: parsed.data.note ?? null,
      ...(parsed.data.tags ? { tags: parsed.data.tags } : {}),
    },
    select: { id: true, ayahKey: true, note: true, tags: true, createdAt: true },
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const ayahKeyParam = url.searchParams.get("ayahKey");
  const parsed = ayahKeySchema.safeParse(ayahKeyParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_ayah_key" }, { status: 400 });
  }

  await db.bookmark.delete({
    where: { userId_ayahKey: { userId: user.id, ayahKey: parsed.data } },
  }).catch(() => null); // idempotent — missing row is fine

  return NextResponse.json({ ok: true });
}
