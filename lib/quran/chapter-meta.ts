// Lightweight surah metadata for client-side use (search filters, etc.).
// Pulls verses_count from the static chapters.json corpus that we already
// ship for the search index. ~30 KB JSON, tree-shaken to just the 114 ids
// + verse counts when bundled into client code.

import chaptersJson from "@/lib/knowledge/quran/chapters.json";

interface ChapterRaw {
  id: number;
  verses_count: number;
  name_arabic: string;
}

const CHAPTERS = (chaptersJson as { chapters: ChapterRaw[] }).chapters;

const META = new Map<number, { versesCount: number; nameArabic: string }>();
for (const c of CHAPTERS) {
  META.set(c.id, { versesCount: c.verses_count, nameArabic: c.name_arabic });
}

export function getVersesCount(surahId: number): number {
  return META.get(surahId)?.versesCount ?? 0;
}

export function getNameArabic(surahId: number): string {
  return META.get(surahId)?.nameArabic ?? "";
}

/** "Short surah" heuristic — under 30 ayat. Covers juz 30 plus a few
 *  early Makki suras. Cheap, predictable, and matches how readers
 *  usually think about "лёгкая для чтения" suras. */
export function isShortSurah(surahId: number): boolean {
  const v = META.get(surahId)?.versesCount ?? 999;
  return v <= 30;
}
