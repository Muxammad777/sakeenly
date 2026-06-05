// GET /api/conversations — list the user's recent conversations (id + title + updatedAt)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const items = await db.conversation.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, language: true, updatedAt: true, createdAt: true },
  });
  return NextResponse.json({ conversations: items });
}
