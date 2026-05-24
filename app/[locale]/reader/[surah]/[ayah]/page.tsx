import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { quranApi } from "@/lib/api/quran";
import {
  TRANSLATIONS,
  findReciter,
  DEFAULT_RECITER_SLUG,
  type TranslationKey,
} from "@/lib/quran/constants";
import krachkovskyMap from "@/lib/quran/tanzil/krachkovsky.json";
import osmanovMap from "@/lib/quran/tanzil/osmanov.json";
import porokhovaMap from "@/lib/quran/tanzil/porokhova.json";
import ayatiMap from "@/lib/quran/tanzil/ayati.json";
import sodikMap from "@/lib/quran/tanzil/sodik.json";
import altayMap from "@/lib/quran/tanzil/altay.json";
import mokhtasarKyMap from "@/lib/quran/tanzil/mokhtasar-ky.json";
import { MushafReader, type MushafAyah, type ChapterListItem } from "@/components/reader/MushafReader";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale; surah: string; ayah: string }>;
  searchParams: Promise<{ reciter?: string }>;
}

function parseParams(p: { surah: string; ayah: string }): { surah: number; ayah: number } | null {
  const surah = Number(p.surah);
  const ayah = Number(p.ayah);
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  if (!Number.isInteger(ayah) || ayah < 1) return null;
  return { surah, ayah };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surah, ayah } = await params;
  const parsed = parseParams({ surah, ayah });
  if (!parsed) return { title: "Reader" };
  try {
    const chapter = await quranApi.chapter(parsed.surah, "en");
    return {
      title: `${chapter.name_simple} · аят ${parsed.ayah}`,
      description: `Сура ${chapter.name_simple} (${chapter.name_arabic}) — чтение, перевод, аудио.`,
    };
  } catch {
    return { title: `Сура ${parsed.surah} · аят ${parsed.ayah}` };
  }
}

export default async function ReaderPage({ params, searchParams }: PageProps) {
  const { locale, surah, ayah } = await params;
  const { reciter: reciterSlugParam } = await searchParams;
  setRequestLocale(locale);
  const parsed = parseParams({ surah, ayah });
  if (!parsed) notFound();

  const requestedReciter = findReciter(reciterSlugParam ?? DEFAULT_RECITER_SLUG);
  // mp3quran.net reciters only expose chapter-level audio (used by the
  // global player on /listen and by the chapter-audio API). The reader
  // needs per-ayah audio URLs that come from the Quran.com verses API,
  // and that API only accepts Quran.com reciter ids. Fall back to the
  // default Quran.com reciter for the verse-level audio, but keep the
  // user's choice as currentReciterSlug so the UI still reflects it and
  // the bottom player switches to the right chapter URL on play.
  const reciter = requestedReciter.mp3quranServer
    ? findReciter(DEFAULT_RECITER_SLUG)
    : requestedReciter;

  const apiTranslations = TRANSLATIONS.filter((t) => t.source === "quran.com");
  const [chapter, chapters, verses, user] = await Promise.all([
    quranApi.chapter(parsed.surah, "en"),
    quranApi.chapters("en"),
    quranApi.versesByChapter({
      chapter: parsed.surah,
      translations: [...apiTranslations],
      reciter,
      language: "en",
      perPage: 300,
    }),
    getCurrentUser(),
  ]);

  const tanzilByKey: Record<Exclude<TranslationKey, "kuliev" | "sahih-intl">, Record<string, string>> = {
    krachkovsky:    krachkovskyMap  as Record<string, string>,
    osmanov:        osmanovMap      as Record<string, string>,
    porokhova:      porokhovaMap    as Record<string, string>,
    ayati:          ayatiMap        as Record<string, string>,
    sodik:          sodikMap        as Record<string, string>,
    altay:          altayMap        as Record<string, string>,
    "mokhtasar-ky": mokhtasarKyMap  as Record<string, string>,
  };

  if (parsed.ayah > chapter.verses_count) notFound();

  let bookmarkMap = new Map<string, string | null>();
  if (user) {
    const records = await db.bookmark.findMany({
      where: { userId: user.id, ayahKey: { startsWith: `${parsed.surah}:` } },
      select: { ayahKey: true, note: true },
    });
    bookmarkMap = new Map(records.map((r) => [r.ayahKey, r.note]));
  }

  const ayat: MushafAyah[] = verses.map((v) => {
    const translationsByKey: Partial<Record<TranslationKey, string>> = {};
    for (const tr of v.translations ?? []) {
      const meta = TRANSLATIONS.find((tm) => tm.id === tr.resource_id && tm.source === "quran.com");
      if (meta) translationsByKey[meta.key] = tr.text;
    }
    for (const [key, map] of Object.entries(tanzilByKey) as [TranslationKey, Record<string, string>][]) {
      const text = map[v.verse_key];
      if (text) translationsByKey[key] = text;
    }
    return {
      ayahKey: v.verse_key,
      verseNumber: v.verse_number,
      textUthmani: v.text_uthmani,
      audioUrl: v.audio?.url ? toAbsoluteAudioUrl(v.audio.url) : undefined,
      translationsByKey,
      isBookmarked: bookmarkMap.has(v.verse_key),
      bookmarkNote: bookmarkMap.get(v.verse_key) ?? null,
    };
  });

  const chapterList: ChapterListItem[] = chapters.map((c) => ({
    id: c.id,
    nameSimple: c.name_simple,
    nameArabic: c.name_arabic,
    versesCount: c.verses_count,
  }));

  return (
    <MushafReader
      surah={{
        number: chapter.id,
        nameSimple: chapter.name_simple,
        nameArabic: chapter.name_arabic,
        nameTranslit: chapter.translated_name?.name ?? chapter.name_simple,
        revelationPlace: chapter.revelation_place,
        revelationOrder: chapter.revelation_order,
        versesCount: chapter.verses_count,
      }}
      ayat={ayat}
      chapters={chapterList}
      initialAyah={parsed.ayah}
      isAuthenticated={Boolean(user)}
      currentReciterSlug={requestedReciter.slug}
    />
  );
}

const AUDIO_CDN = "https://verses.quran.com/";
function toAbsoluteAudioUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return AUDIO_CDN + url.replace(/^\/+/, "");
}
