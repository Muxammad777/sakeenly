// POST /api/hifz/mark
//
// Mark one or more ayat as freshly memorized. Used by the learn-mode
// "Готово" button. For each ayah:
//   - if no progress row exists → create one with stage=sabaq, SRS init
//   - if it does exist          → leave it alone (idempotent)
//
// Also bumps the hifz streak.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { applyFirstLearn } from "@/lib/hifz/srs";

export const runtime = "nodejs";

const schema = z.object({
  ayahKeys: z
    .array(z.string().regex(/^\d{1,3}:\d{1,4}$/))
    .min(1)
    .max(50), // a single sabaq is at most ~10 ayat; 50 is generous
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date();
  const first = applyFirstLearn(now);

  const created: string[] = [];
  const skipped: string[] = [];

  for (const ayahKey of parsed.data.ayahKeys) {
    const [s, a] = ayahKey.split(":").map(Number);
    const existing = await db.hifzProgress.findUnique({
      where: { userId_ayahKey: { userId: user.id, ayahKey } },
      select: { id: true, stage: true },
    });
    if (existing && existing.stage !== "new") {
      skipped.push(ayahKey);
      continue;
    }
    if (existing) {
      await db.hifzProgress.update({
        where: { id: existing.id },
        data: {
          stage: first.stage,
          srsInterval: first.srsInterval,
          srsEase: first.srsEase,
          srsLapses: first.srsLapses,
          srsReps: first.srsReps,
          consecutiveOk: first.consecutiveOk,
          firstLearnedAt: now,
          lastReviewedAt: now,
          dueAt: first.dueAt,
        },
      });
    } else {
      await db.hifzProgress.create({
        data: {
          userId: user.id,
          ayahKey,
          surah: s,
          ayah: a,
          stage: first.stage,
          srsInterval: first.srsInterval,
          srsEase: first.srsEase,
          srsLapses: first.srsLapses,
          srsReps: first.srsReps,
          consecutiveOk: first.consecutiveOk,
          firstLearnedAt: now,
          lastReviewedAt: now,
          dueAt: first.dueAt,
        },
      });
    }
    created.push(ayahKey);
  }

  // Streak bump — if today already counted, no-op. If yesterday was
  // the last hifz day, increment. Otherwise reset to 1.
  const settings = await db.hifzSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, hifzStreakCurrent: 1, hifzStreakLongest: 1, lastHifzDate: now },
    update: {},
  });
  const today0 = new Date(now); today0.setHours(0, 0, 0, 0);
  const last = settings.lastHifzDate ? new Date(settings.lastHifzDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  let nextCurrent = settings.hifzStreakCurrent;
  if (!last || last.getTime() < today0.getTime()) {
    const yesterday0 = new Date(today0); yesterday0.setDate(yesterday0.getDate() - 1);
    nextCurrent = last && last.getTime() === yesterday0.getTime() ? settings.hifzStreakCurrent + 1 : 1;
    await db.hifzSettings.update({
      where: { userId: user.id },
      data: {
        hifzStreakCurrent: nextCurrent,
        hifzStreakLongest: Math.max(settings.hifzStreakLongest, nextCurrent),
        lastHifzDate: now,
      },
    });
  }

  return NextResponse.json({ ok: true, created: created.length, skipped: skipped.length });
}
