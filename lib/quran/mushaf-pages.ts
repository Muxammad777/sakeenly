// Per-verse Madani Mushaf page numbers (1..604).
// Built once at module load from lib/knowledge/quran/info.json so the
// reader can split a surah into the SAME pages a printed Mushaf uses,
// instead of a fixed N-ayahs-per-page guess.

import info from "@/lib/knowledge/quran/info.json";

interface InfoVerse { verse: number; page: number }
interface InfoChapter { chapter: number; verses: InfoVerse[] }
interface InfoFile { chapters: InfoChapter[] }

const PAGE_BY_KEY = new Map<string, number>();
for (const ch of (info as InfoFile).chapters) {
  for (const v of ch.verses) {
    PAGE_BY_KEY.set(`${ch.chapter}:${v.verse}`, v.page);
  }
}

export function getMushafPage(surah: number, ayah: number): number {
  return PAGE_BY_KEY.get(`${surah}:${ayah}`) ?? 1;
}

/** Sorted unique page numbers that the given surah spans. */
export function pagesOfSurah(surah: number, ayahCount: number): number[] {
  const set = new Set<number>();
  for (let v = 1; v <= ayahCount; v++) {
    const p = PAGE_BY_KEY.get(`${surah}:${v}`);
    if (p !== undefined) set.add(p);
  }
  return Array.from(set).sort((a, b) => a - b);
}
