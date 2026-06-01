// POST /api/hifz/grade
//
// Record a review outcome for an ayah. Body: { ayahKey, grade }.
// The grade drives the SRS scheduler; we persist the new state and
// return the resulting stage + next due date so the UI can advance.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { applyGrade } from "@/lib/hifz/srs";

export const runtime = "nodejs";

const schema = z.object({
  ayahKey: z.string().regex(/^\d{1,3}:\d{1,4}$/),
  grade: z.enum(["forgot", "hard", "good", "easy"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const row = await db.hifzProgress.findUnique({
    where: { userId_ayahKey: { userId: user.id, ayahKey: parsed.data.ayahKey } },
  });
  if (!row) return NextResponse.json({ error: "not_started" }, { status: 404 });

  const next = applyGrade(
    {
      stage: row.stage,
      srsInterval: row.srsInterval,
      srsEase: row.srsEase,
      srsLapses: row.srsLapses,
      srsReps: row.srsReps,
      consecutiveOk: row.consecutiveOk,
    },
    parsed.data.grade,
  );

  await db.hifzProgress.update({
    where: { id: row.id },
    data: {
      stage: next.stage,
      srsInterval: next.srsInterval,
      srsEase: next.srsEase,
      srsLapses: next.srsLapses,
      srsReps: next.srsReps,
      consecutiveOk: next.consecutiveOk,
      dueAt: next.dueAt,
      lastReviewedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    stage: next.stage,
    dueAt: next.dueAt,
    isLeech: next.isLeech,
  });
}
