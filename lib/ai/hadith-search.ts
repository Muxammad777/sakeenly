// Lexical hadith search over the bundled Sahih Bukhari + Sahih Muslim
// corpus (~15k narrations). Used as a tool exposed to the Claude
// assistant on /ask.
//
// We deliberately keep this lightweight — token-AND scan with a small
// score boost for chapter-title matches. A proper inverted index or
// embeddings can come later; for 15k records the linear scan is ~50ms.

import bukhariRaw from "@/lib/knowledge/hadith/bukhari.json";
import muslimRaw from "@/lib/knowledge/hadith/muslim.json";

interface HadithEntry {
  number: number;
  chapter_en: string;
  chapter_ar: string;
  arabic: string;
  english: string;
  narrator: string;
}
interface HadithFile {
  collection: string;
  english_title: string;
  arabic_title: string;
  count: number;
  hadiths: HadithEntry[];
}

const bukhari = bukhariRaw as HadithFile;
const muslim = muslimRaw as HadithFile;

export interface HadithHit {
  collection: "bukhari" | "muslim";
  number: number;
  chapter_en: string;
  narrator: string;
  english: string;   // full text, model will paraphrase
  arabic: string;
  score: number;
}

function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // combining marks
    .toLowerCase()
    .trim();
}

function splitTokens(q: string): string[] {
  return normalize(q)
    .split(/[\s.,;:!?()«»"'\-—–]+/)
    .filter((t) => t.length >= 3);
}

function scoreEntry(tokens: string[], entry: HadithEntry): number {
  if (tokens.length === 0) return 0;
  const haystack = normalize(`${entry.english} ${entry.chapter_en} ${entry.narrator}`);
  let hits = 0;
  let chapterHits = 0;
  const chapter = normalize(entry.chapter_en);
  for (const t of tokens) {
    if (haystack.includes(t)) hits++;
    if (chapter.includes(t)) chapterHits++;
  }
  // require ALL tokens to land somewhere
  if (hits < tokens.length) return 0;
  return hits + chapterHits * 0.5;
}

export function searchHadith(
  query: string,
  opts: { topK?: number; collections?: Array<"bukhari" | "muslim"> } = {},
): HadithHit[] {
  const topK = opts.topK ?? 5;
  const cols = opts.collections ?? ["bukhari", "muslim"];
  const tokens = splitTokens(query);
  if (tokens.length === 0) return [];

  const hits: HadithHit[] = [];
  if (cols.includes("bukhari")) {
    for (const h of bukhari.hadiths) {
      const score = scoreEntry(tokens, h);
      if (score > 0) {
        hits.push({
          collection: "bukhari",
          number: h.number,
          chapter_en: h.chapter_en,
          narrator: h.narrator,
          english: h.english,
          arabic: h.arabic,
          score,
        });
      }
    }
  }
  if (cols.includes("muslim")) {
    for (const h of muslim.hadiths) {
      const score = scoreEntry(tokens, h);
      if (score > 0) {
        hits.push({
          collection: "muslim",
          number: h.number,
          chapter_en: h.chapter_en,
          narrator: h.narrator,
          english: h.english,
          arabic: h.arabic,
          score,
        });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, topK);
}

export function getHadith(
  collection: "bukhari" | "muslim",
  number: number,
): HadithHit | null {
  const src = collection === "bukhari" ? bukhari : muslim;
  const h = src.hadiths.find((x) => x.number === number);
  if (!h) return null;
  return {
    collection,
    number: h.number,
    chapter_en: h.chapter_en,
    narrator: h.narrator,
    english: h.english,
    arabic: h.arabic,
    score: 1,
  };
}
