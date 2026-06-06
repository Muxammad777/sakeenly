import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { KidSurahLearn } from "@/components/kids/KidSurahLearn";
import { quranApi } from "@/lib/api/quran";
import { findReciter } from "@/lib/quran/constants";
import { getTajweedAnnotations } from "@/lib/quran/tajweed";

interface PageProps { params: Promise<{ locale: Locale; num: string }>; }

// Only surahs that fit "kid memorisation" — short and well-known. Keeps
// the URL space small and lets us 404 the rest cleanly.
const ALLOWED = new Set([1, 108, 109, 110, 111, 112, 113, 114]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, num } = await params;
  const n = Number(num);
  if (!ALLOWED.has(n)) return { title: "Сура для детей" };
  const t = await getTranslations({ locale, namespace: "kid" });
  return { title: `${t("h1")} · сура ${n}`, alternates: { canonical: `/kids/surahs/${n}` } };
}

export default async function KidSurahPage({ params }: PageProps) {
  const { locale, num } = await params;
  setRequestLocale(locale);
  const n = Number(num);
  if (!Number.isFinite(n) || !ALLOWED.has(n)) notFound();

  // Husary-muallim (id 12) — the teacher-mode recording, slower and
  // cleaner than the regular Murattal. Best fit for first-time learners.
  const reciter = findReciter("husary-muallim");
  const [chapter, verses] = await Promise.all([
    quranApi.chapter(n, locale),
    quranApi.versesByChapter({ chapter: n, translations: [], reciter, language: locale }),
  ]);

  const ayahs = verses.map((v) => ({
    ayah: v.verse_number,
    textUthmani: v.text_uthmani,
    audioUrl: v.audio?.url ?? null,
    tajweed: getTajweedAnnotations(n, v.verse_number),
  }));

  return (
    <KidsProvider>
      <KidSurahLearn
        surahNumber={n}
        surahArabic={chapter.name_arabic}
        surahName={chapter.name_simple}
        ayahs={ayahs}
      />
    </KidsProvider>
  );
}
