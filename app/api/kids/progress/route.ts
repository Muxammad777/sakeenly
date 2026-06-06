// GET  /api/kids/progress?profileId=…
//   → { letters: [{key, status, traceScore}], surahs: [...], stories: [...] }
//
// POST /api/kids/progress
//   { profileId, type, key, status, traceScore?, reciteScore? }
//   → upserts the row, bumps streak when newly mastered, awards any new badges.
//
// Status transitions:
//   none      → in_progress (just tapped, started but not finished)
//   *         → learned     (finished — bump streak, evaluate badges)

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { bumpKidStreak } from "@/lib/kids/streak";
import { evaluateAndAwardBadges } from "@/lib/kids/badges";

export const runtime = "nodejs";

async function ensureOwnedProfile(userId: string, profileId: string) {
  return db.kidProfile.findFirst({ where: { id: profileId, userId }, select: { id: true, streakCurrent: true, streakLongest: true, lastActiveDate: true } });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ letters: [], surahs: [], stories: [] });

  const url = new URL(req.url);
  const profileId = url.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "missing_profileId" }, { status: 400 });

  const owns = await ensureOwnedProfile(user.id, profileId);
  if (!owns) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = await db.kidProgress.findMany({
    where: { profileId },
    select: { type: true, key: true, status: true, traceScore: true, reciteScore: true, attempts: true, masteredAt: true },
  });
  const split = { letters: [] as typeof rows, surahs: [] as typeof rows, stories: [] as typeof rows };
  for (const r of rows) {
    if (r.type === "letter") split.letters.push(r);
    else if (r.type === "surah") split.surahs.push(r);
    else split.stories.push(r);
  }
  return NextResponse.json(split);
}

const postSchema = z.object({
  profileId: z.string().min(1),
  type: z.enum(["letter", "surah", "story"]),
  key: z.string().min(1).max(40),
  status: z.enum(["in_progress", "learned"]).default("in_progress"),
  traceScore: z.number().int().min(0).max(100).optional(),
  reciteScore: z.number().int().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
  }
  const { profileId, type, key, status, traceScore, reciteScore } = parsed.data;

  const profile = await ensureOwnedProfile(user.id, profileId);
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const now = new Date();
  const existing = await db.kidProgress.findUnique({
    where: { profileId_type_key: { profileId, type, key } },
  });

  const becameLearned = status === "learned" && existing?.status !== "learned";

  await db.kidProgress.upsert({
    where: { profileId_type_key: { profileId, type, key } },
    create: {
      profileId, type, key, status,
      traceScore: traceScore ?? 0,
      reciteScore: reciteScore ?? 0,
      attempts: 1,
      masteredAt: status === "learned" ? now : null,
    },
    update: {
      status,
      attempts: { increment: 1 },
      ...(traceScore !== undefined ? { traceScore } : {}),
      ...(reciteScore !== undefined ? { reciteScore } : {}),
      ...(becameLearned ? { masteredAt: now } : {}),
    },
  });

  let streak = { current: profile.streakCurrent, longest: profile.streakLongest, updated: false };
  let freshBadges: string[] = [];

  if (becameLearned) {
    streak = await bumpKidStreak(db, profile, now);
    freshBadges = await evaluateAndAwardBadges(db, profileId);
  }

  return NextResponse.json({ ok: true, streak, freshBadges });
}
