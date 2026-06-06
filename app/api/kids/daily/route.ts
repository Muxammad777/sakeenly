// GET /api/kids/daily?profileId=…
// Returns today's 5-item challenge list — same list all day for a given
// profile (deterministic on UTC date + profileId).

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { pickDailyChallenge } from "@/lib/kids/daily";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const url = new URL(req.url);
  const profileId = url.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "missing_profileId" }, { status: 400 });

  const owns = await db.kidProfile.findFirst({ where: { id: profileId, userId: user.id }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = await db.kidProgress.findMany({
    where: { profileId },
    select: { type: true, key: true, status: true },
  });

  const items = pickDailyChallenge(
    {
      learnedLetterSlugs: new Set(rows.filter((r) => r.type === "letter" && r.status === "learned").map((r) => r.key)),
      inProgressLetterSlugs: new Set(rows.filter((r) => r.type === "letter" && r.status === "in_progress").map((r) => r.key)),
      learnedSurahKeys: new Set(rows.filter((r) => r.type === "surah" && r.status === "learned").map((r) => r.key)),
    },
    profileId,
  );

  return NextResponse.json({ items });
}
