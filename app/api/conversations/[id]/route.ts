// GET    /api/conversations/<id> — load full conversation (messages oldest first)
// DELETE /api/conversations/<id> — soft archive (sets archived=true)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;
  const c = await db.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!c || c.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    conversation: {
      id: c.id,
      title: c.title,
      language: c.language,
      createdAt: c.createdAt,
      messages: c.messages,
    },
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;
  const c = await db.conversation.findUnique({ where: { id }, select: { userId: true } });
  if (!c || c.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.conversation.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
