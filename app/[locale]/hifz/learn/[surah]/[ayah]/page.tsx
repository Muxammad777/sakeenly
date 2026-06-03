import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { quranApi } from "@/lib/api/quran";
import { findReciter } from "@/lib/quran/constants";
import { HifzLearnClient, type HifzLearnAyah } from "@/components/hifz/HifzLearnClient";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale; surah: string; ayah: string }>;
  searchParams: Promise<{ to?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hf" });
  return { title: t("learn_h1"), robots: { index: false } };
}

function parseTo(to: string | undefined): { surah: number; ayah: number } | null {
  if (!to) return null;
  const m = /^(\d+):(\d+)$/.exec(to);
  if (!m) return null;
  return { surah: Number(m[1]), ayah: Number(m[2]) };
}

export default async function HifzLearnPage({ params, searchParams }: PageProps) {
  const { locale, surah, ayah } = await params;
  const { to } = await searchParams;
  setRequestLocale(locale);

  // Guest-friendly: learn mode is fully usable without login. The
  // "Save to hifz" button surfaces the sign-in CTA on 401 instead.
  const startS = Number(surah), startA = Number(ayah);
  if (!Number.isInteger(startS) || !Number.isInteger(startA) || startS < 1 || startS > 114 || startA < 1) notFound();
  const end = parseTo(to);
  // Without an explicit ?to=... we now default to the whole surah from
  // startA onward — picking a surah from the dashboard or jumping in
  // from the reader's "В хифз" button should open the full chapter,
  // not a single ayah.
  const chapter = await quranApi.chapter(startS);
  const endA = end && end.surah === startS
    ? Math.min(end.ayah, chapter.verses_count)
    : chapter.verses_count;
  if (startA > chapter.verses_count) notFound();

  // Husary (id 6) — clean Madani Murattal, default reciter for hifz
  // across Indo-Pak madrasas. Without passing reciter the Quran.com API
  // returns no audio at all, so this isn't optional.
  const reciter = findReciter("husary");
  // ONE batched call covers the whole surah — way faster than the per-
  // ayah loop we used to do (286 requests for Al-Baqarah → ~30s).
  const allVerses = await quranApi.versesByChapter({
    chapter: startS,
    translations: [],
    reciter,
    language: locale,
  });
  const ayat: HifzLearnAyah[] = allVerses
    .filter((v) => v.verse_number >= startA && v.verse_number <= endA)
    .map((v) => ({
      ayahKey: v.verse_key,
      surah: startS,
      ayah: v.verse_number,
      textUthmani: v.text_uthmani,
      audioUrl: v.audio?.url ?? null,
    }));

  return (
    <HifzLearnClient
      ayat={ayat}
      surahName={chapter.name_simple}
      surahNameArabic={chapter.name_arabic}
    />
  );
}
