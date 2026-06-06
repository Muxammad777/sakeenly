// GET  /api/kids/profile  → list of kid profiles for the current user (+ counters)
// POST /api/kids/profile  → create/update a kid profile (name, ageBand, avatarSlug)
//
// We auto-create a default profile on first GET when the user has none,
// so the rest of the kids UI never has to deal with the empty state.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface ProfileOut {
  id: string;
  name: string;
  ageBand: string;
  avatarSlug: string;
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: string | null;
  learnedLetters: number;
  learnedSurahs: number;
  readStories: number;
  badges: string[];
}

async function listForUser(userId: string): Promise<ProfileOut[]> {
  const profiles = await db.kidProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      progress: { where: { status: "learned" }, select: { type: true } },
      badges:   { select: { slug: true } },
    },
  });
  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    ageBand: p.ageBand,
    avatarSlug: p.avatarSlug,
    streakCurrent: p.streakCurrent,
    streakLongest: p.streakLongest,
    lastActiveDate: p.lastActiveDate?.toISOString() ?? null,
    learnedLetters: p.progress.filter((r) => r.type === "letter").length,
    learnedSurahs:  p.progress.filter((r) => r.type === "surah").length,
    readStories:    p.progress.filter((r) => r.type === "story").length,
    badges: p.badges.map((b) => b.slug),
  }));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ profiles: [] });

  let profiles = await listForUser(user.id);
  if (!profiles.length) {
    await db.kidProfile.create({
      data: { userId: user.id, name: "", ageBand: "4-6", avatarSlug: "star" },
    });
    profiles = await listForUser(user.id);
  }
  return NextResponse.json({ profiles });
}

const upsertSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().max(30).optional(),
  ageBand: z.enum(["4-6", "6-8", "8-10"]).optional(),
  avatarSlug: z.enum(["star", "moon", "sun", "leaf", "wave"]).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
  }
  const { id, name, ageBand, avatarSlug } = parsed.data;

  if (id) {
    const owns = await db.kidProfile.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owns) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.kidProfile.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(ageBand !== undefined ? { ageBand } : {}),
        ...(avatarSlug !== undefined ? { avatarSlug } : {}),
      },
    });
  } else {
    await db.kidProfile.create({
      data: {
        userId: user.id,
        name: name ?? "",
        ageBand: ageBand ?? "4-6",
        avatarSlug: avatarSlug ?? "star",
      },
    });
  }

  const profiles = await listForUser(user.id);
  return NextResponse.json({ profiles });
}
