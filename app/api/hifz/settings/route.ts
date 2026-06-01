// GET  /api/hifz/settings  → current settings (creates defaults if missing)
// PATCH /api/hifz/settings  → update one or more fields

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const settings = await db.hifzSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });
  return NextResponse.json({ settings });
}

const patchSchema = z.object({
  dailyTargetDenom: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8)]).optional(),
  hifzReciter: z.string().min(1).max(40).optional(),
  loopCount: z.number().int().min(0).max(50).optional(),
  speedX100: z.number().int().min(50).max(150).optional(),
  startFromSurah: z.number().int().min(1).max(114).optional(),
  startFromAyah: z.number().int().min(1).max(286).optional(),
  showTajweed: z.boolean().optional(),
  showTranslation: z.boolean().optional(),
  showTransliteration: z.boolean().optional(),
  defaultHideStage: z.number().int().min(0).max(3).optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const settings = await db.hifzSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });
  return NextResponse.json({ settings });
}
