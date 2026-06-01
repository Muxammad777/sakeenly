import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { quranApi } from "@/lib/api/quran";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { buildDailyPlan, type ProgressRow } from "@/lib/hifz/scheduler";
import { HifzReviewClient, type HifzReviewItem } from "@/components/hifz/HifzReviewClient";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hf" });
  return { title: t("review_h1"), robots: { index: false } };
}

export default async function HifzReviewPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { mode } = await searchParams;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/${locale}/hifz/review`)}`);

  const [progress, settings, chapters] = await Promise.all([
    db.hifzProgress.findMany({
      where: { userId: user.id },
      select: {
        ayahKey: true, surah: true, ayah: true, stage: true,
        dueAt: true, lastReviewedAt: true, firstLearnedAt: true,
      },
    }),
    db.hifzSettings.findUnique({ where: { userId: user.id } }),
    quranApi.chapters(),
  ]);

  const s = settings ?? { dailyTargetDenom: 2, startFromSurah: 78, startFromAyah: 1 };
  const plan = buildDailyPlan({
    progress: progress as ProgressRow[],
    settings: {
      dailyTargetDenom: s.dailyTargetDenom,
      startFromSurah: s.startFromSurah,
      startFromAyah: s.startFromAyah,
    },
    chapters: chapters.map((c) => ({ number: c.id, ayatCount: c.verses_count ?? 0 })),
  });

  const queue: ProgressRow[] =
    mode === "sabqi" ? plan.sabqi :
    mode === "manzil" ? plan.manzil :
    [...plan.sabqi, ...plan.manzil];

  // Fetch arabic text for each queued ayah. quranApi.verseByKey hits an
  // external API per-call — for the review queue we batch by surah where
  // possible. For now keep it sequential — review queues are tens of
  // ayat per day, not thousands.
  const items: HifzReviewItem[] = [];
  for (const row of queue.slice(0, 50)) {
    const v = await quranApi.verseByKey(`${row.surah}:${row.ayah}`, { language: locale });
    items.push({
      ayahKey: row.ayahKey,
      surah: row.surah,
      ayah: row.ayah,
      stage: row.stage,
      textUthmani: v.text_uthmani,
      audioUrl: v.audio?.url ?? null,
    });
  }

  return <HifzReviewClient items={items} />;
}
