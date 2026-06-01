import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { quranApi } from "@/lib/api/quran";
import { findReciter } from "@/lib/quran/constants";
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

  // Guests get an empty queue — review needs prior progress and that
  // lives behind auth. The empty-state UI already shows a friendly
  // "done for today" panel, which doubles as a guest message.
  const user = await getCurrentUser();
  const [progress, settings, chapters] = await Promise.all([
    user
      ? db.hifzProgress.findMany({
          where: { userId: user.id },
          select: {
            ayahKey: true, surah: true, ayah: true, stage: true,
            dueAt: true, lastReviewedAt: true, firstLearnedAt: true,
          },
        })
      : Promise.resolve([] as ProgressRow[]),
    user
      ? db.hifzSettings.findUnique({ where: { userId: user.id } })
      : Promise.resolve(null),
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
  const reciter = findReciter("husary");
  const items: HifzReviewItem[] = [];
  for (const row of queue.slice(0, 50)) {
    const v = await quranApi.verseByKey(`${row.surah}:${row.ayah}`, { language: locale, reciter });
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
