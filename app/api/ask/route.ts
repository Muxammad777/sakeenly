import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ask, type AskAnswer } from "@/lib/ai/rag";
import { getQuota, FREE_DAILY_LIMIT } from "@/lib/ai/rate-limit";
import { TRANSLATIONS, type TranslationKey } from "@/lib/quran/constants";

// AI work can take 10–20s on Claude Opus. Default Vercel timeout is 10s; bump.
export const maxDuration = 30;

const bodySchema = z.object({
  question: z.string().min(2).max(2000),
  translation: z
    .enum(TRANSLATIONS.map((t) => t.key) as [TranslationKey, ...TranslationKey[]])
    .optional(),
  language: z.enum(["ru", "en", "auto"]).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Free-tier gate. Refusals don't count, so we check the quota up front and
  // re-check semantically after the answer (a refusal is "free").
  const quotaBefore = await getQuota(user.id);
  if (quotaBefore.remaining <= 0) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        message: `Бесплатный лимит — ${FREE_DAILY_LIMIT} вопросов в сутки. Оформите Premium для безлимита.`,
        quota: quotaBefore,
      },
      { status: 429 },
    );
  }

  let answer: AskAnswer;
  try {
    answer = await ask({
      question: parsed.data.question,
      translation: parsed.data.translation,
      language: parsed.data.language,
    });
  } catch (err) {
    console.error("[/api/ask] pipeline failure", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // Persist the exchange. A failed save shouldn't block the response — log
  // and continue.
  try {
    await db.askHistory.create({
      data: {
        userId: user.id,
        question: parsed.data.question,
        answer: answer.text,
        citations: answer.citations as unknown as object,
        wasRefused: answer.outcome === "refused_fatwa",
        language: answer.language,
      },
    });
  } catch (err) {
    console.error("[/api/ask] failed to persist AskHistory", err);
  }

  const quotaAfter = await getQuota(user.id);

  return NextResponse.json({
    outcome: answer.outcome,
    text: answer.text,
    language: answer.language,
    citations: answer.citations,
    sources: answer.sourcesUsed.map((s) => ({
      verseKey: s.verseKey,
      surah: s.surah,
      ayah: s.ayah,
      translationKey: s.translationKey,
    })),
    quota: quotaAfter,
  });
}
