// GET /api/stats — aggregate platform metrics for the home activity ticker.
//
// Returns:
//   { readers: <users with at least one bookmark>,
//     hifzMastered: <count of HifzProgress rows in stage 'mastered'>,
//     bookmarks: <total bookmarks>,
//     lastSurahRead: <last bookmarked surah number, or null> }
//
// No personal data. Caches for 60s server-side so the home page doesn't
// hammer the DB.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const [readers, hifzMastered, bookmarks, latest] = await Promise.all([
      db.bookmark.groupBy({ by: ["userId"] }).then((rs) => rs.length),
      db.hifzProgress.count({ where: { stage: "mastered" } }),
      db.bookmark.count(),
      db.bookmark.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { ayahKey: true },
      }),
    ]);

    const lastSurah = latest?.ayahKey ? Number(latest.ayahKey.split(":")[0]) : null;

    return NextResponse.json({
      readers,
      hifzMastered,
      bookmarks,
      lastSurahRead: Number.isFinite(lastSurah) ? lastSurah : null,
    });
  } catch (err) {
    console.error("[api/stats]", err);
    return NextResponse.json({ readers: 0, hifzMastered: 0, bookmarks: 0, lastSurahRead: null });
  }
}
