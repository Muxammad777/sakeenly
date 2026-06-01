// GET /api/hifz/today
//
// Returns the user's daily plan (sabaq / sabqi / manzil) plus aggregate
// progress totals. The plan is recomputed on every request — there's no
// "today's cached plan" row in the DB. State lives entirely in
// HifzProgress (one row per ayah), so a fresh build is cheap.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { buildDailyPlan, type ProgressRow } from "@/lib/hifz/scheduler";
import { quranApi } from "@/lib/api/quran";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const [progressRaw, settings, chapters] = await Promise.all([
    db.hifzProgress.findMany({
      where: { userId: user.id },
      select: {
        ayahKey: true,
        surah: true,
        ayah: true,
        stage: true,
        dueAt: true,
        lastReviewedAt: true,
        firstLearnedAt: true,
      },
    }),
    db.hifzSettings.findUnique({ where: { userId: user.id } }),
    quranApi.chapters(),
  ]);

  const settingsOrDefault = settings ?? {
    dailyTargetDenom: 2,
    startFromSurah: 78,
    startFromAyah: 1,
    hifzReciter: "husary",
    loopCount: 7,
    speedX100: 85,
    showTajweed: true,
    showTranslation: true,
    showTransliteration: false,
    defaultHideStage: 0,
    hifzStreakCurrent: 0,
    hifzStreakLongest: 0,
    lastHifzDate: null,
  };

  const plan = buildDailyPlan({
    progress: progressRaw as ProgressRow[],
    settings: settingsOrDefault,
    chapters: chapters.map((c) => ({ number: c.id, ayatCount: c.verses_count ?? 0 })),
  });

  return NextResponse.json({
    plan,
    settings: settingsOrDefault,
  });
}
