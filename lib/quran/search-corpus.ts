// Full-text search over the Qur'an — Arabic Uthmani + per-locale translation.
//
// Loads the entire corpus once per Node worker (6236 verses × a handful of
// strings = ~6MB heap). On each query we run a normalized substring scan;
// for 6236 records this is ~5–10ms which is fine before we invest in
// pgvector / Voyage embeddings.
//
// Data sources (all local, no external API on request path):
//   - lib/knowledge/quran/uthmani.json — Hafs `an Asim Uthmani text
//   - lib/quran/tanzil/<translator>.json — translation maps
//
// Per-locale translator pick keeps the snippet language matching the UI
// locale. English has no local Tanzil translation yet, so EN searches
// match Arabic only — a future PR can add Sahih International or Khattab.

import type { Locale } from "@/i18n/routing";

type VerseEntry = { chapter: number; verse: number; text: string };

interface Corpus {
  arabic: Map<string, string>;           // "11:1" → uthmani text
  translations: Map<string, Map<string, string>>; // translatorKey → verseKey → text
}

let _corpus: Corpus | null = null;

function loadCorpus(): Corpus {
  if (_corpus) return _corpus;

  // Lazy require so the bundle doesn't drag JSON into client code.
  const uthmaniRaw = require("@/lib/knowledge/quran/uthmani.json") as { quran: VerseEntry[] };
  const arabic = new Map<string, string>();
  for (const v of uthmaniRaw.quran) {
    arabic.set(`${v.chapter}:${v.verse}`, v.text);
  }

  const translations = new Map<string, Map<string, string>>();
  const trMaps: Array<[string, () => Record<string, string>]> = [
    ["krachkovsky",  () => require("@/lib/quran/tanzil/krachkovsky.json")],
    ["osmanov",      () => require("@/lib/quran/tanzil/osmanov.json")],
    ["porokhova",    () => require("@/lib/quran/tanzil/porokhova.json")],
    ["ayati",        () => require("@/lib/quran/tanzil/ayati.json")],
    ["sodik",        () => require("@/lib/quran/tanzil/sodik.json")],
    ["altay",        () => require("@/lib/quran/tanzil/altay.json")],
    ["mokhtasar-ky", () => require("@/lib/quran/tanzil/mokhtasar-ky.json")],
    ["fooladvand",   () => require("@/lib/quran/tanzil/fooladvand.json")],
  ];
  for (const [key, load] of trMaps) {
    const m = new Map<string, string>();
    const data = load();
    for (const k in data) m.set(k, data[k]);
    translations.set(key, m);
  }

  _corpus = { arabic, translations };
  return _corpus;
}

// Default translator per UI locale — the snippet language users will read.
const TRANSLATOR_BY_LOCALE: Record<Locale, string | null> = {
  ru: "krachkovsky",
  fa: "fooladvand",
  tg: "ayati",
  uz: "sodik",
  kk: "altay",
  ky: "mokhtasar-ky",
  en: null, // no local English Tanzil yet — Arabic-only matching
};

// Strip Arabic harakat (tashkeel) and tatweel so "بسم" finds "بِسْمِ".
const HARAKAT = /[ً-ٰٟـ]/g;
function normalizeArabic(s: string): string {
  return s.normalize("NFKD").replace(HARAKAT, "").trim();
}

// Lowercase + NFD-strip combining marks for Latin/Cyrillic translations,
// so "сабр" matches "Сабр" and "musa" matches "Mūsā".
function normalizeText(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function looksArabic(s: string): boolean {
  return /[؀-ۿ]/.test(s);
}

export interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  /** Which haystack matched: arabic, translation, or both. */
  matched: "arabic" | "translation" | "both";
}

export function searchQuran(
  query: string,
  locale: Locale,
  limit = 40,
): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const corpus = loadCorpus();
  const trKey = TRANSLATOR_BY_LOCALE[locale];
  const trMap = trKey ? corpus.translations.get(trKey) : null;

  const arQuery = looksArabic(q) ? normalizeArabic(q) : null;
  const txQuery = normalizeText(q);

  const results: SearchResult[] = [];

  for (const [verseKey, arabicText] of corpus.arabic) {
    let arHit = false;
    let txHit = false;

    if (arQuery && arQuery.length >= 2) {
      const normAr = normalizeArabic(arabicText);
      if (normAr.includes(arQuery)) arHit = true;
    }

    let translationText: string | null = null;
    if (trMap) {
      translationText = trMap.get(verseKey) ?? null;
      if (translationText && txQuery.length >= 2) {
        const normTx = normalizeText(translationText);
        if (normTx.includes(txQuery)) txHit = true;
      }
    }

    if (!arHit && !txHit) continue;
    const [s, a] = verseKey.split(":").map(Number);
    results.push({
      verseKey,
      surah: s,
      ayah: a,
      arabic: arabicText,
      translation: translationText,
      matched: arHit && txHit ? "both" : arHit ? "arabic" : "translation",
    });

    if (results.length >= limit) break;
  }

  return results;
}
