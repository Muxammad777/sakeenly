// GET /api/home/state
//
// Returns the data needed for the home page's streak + "continue reading"
// band:
//   - streak: { current, longest, lastActiveDate, daysThisWeek } from Streak
//   - lastRead: { surah, ayah, ayahKey, label } from the most recent Bookmark
//
// For guests we return 401; the client renders a placeholder version that
// shows the cards but with empty state and a "sign in" CTA.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getVersesCount } from "@/lib/quran/chapter-meta";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const [streak, latestBookmark] = await Promise.all([
    db.streak.findUnique({ where: { userId: user.id } }),
    db.bookmark.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { ayahKey: true },
    }),
  ]);

  // Compute which weekdays this week the user has been active. We don't
  // have a full daily-activity log — Streak only carries the latest active
  // day — so we light up the current day if their lastActiveDate falls in
  // the current week and dim everything else. Better than a hardcoded grid.
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = Mon
  const daysThisWeek = Array.from({ length: 7 }, (_, i) => {
    if (!streak?.lastActiveDate) return false;
    if (i !== dow) return false;
    const last = new Date(streak.lastActiveDate);
    return last.toDateString() === today.toDateString();
  });

  let lastRead: { surah: number; ayah: number; ayahKey: string; totalAyahs: number } | null = null;
  if (latestBookmark) {
    const [s, a] = latestBookmark.ayahKey.split(":").map(Number);
    lastRead = {
      surah: s,
      ayah: a,
      ayahKey: latestBookmark.ayahKey,
      totalAyahs: getVersesCount(s),
    };
  }

  return NextResponse.json({
    streak: {
      current: streak?.current ?? 0,
      longest: streak?.longest ?? 0,
      lastActiveDate: streak?.lastActiveDate?.toISOString() ?? null,
      daysThisWeek,
    },
    lastRead,
  });
}
