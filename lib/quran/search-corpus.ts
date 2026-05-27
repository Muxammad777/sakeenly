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
import uthmaniRaw from "@/lib/knowledge/quran/uthmani.json";
import krachkovskyMap from "@/lib/quran/tanzil/krachkovsky.json";
import osmanovMap     from "@/lib/quran/tanzil/osmanov.json";
import porokhovaMap   from "@/lib/quran/tanzil/porokhova.json";
import ayatiMap       from "@/lib/quran/tanzil/ayati.json";
import sodikMap       from "@/lib/quran/tanzil/sodik.json";
import altayMap       from "@/lib/quran/tanzil/altay.json";
import mokhtasarKyMap from "@/lib/quran/tanzil/mokhtasar-ky.json";
import fooladvandMap  from "@/lib/quran/tanzil/fooladvand.json";

type VerseEntry = { chapter: number; verse: number; text: string };

interface Corpus {
  arabic: Map<string, string>;           // "11:1" → uthmani text
  translations: Map<string, Map<string, string>>; // translatorKey → verseKey → text
}

let _corpus: Corpus | null = null;

function buildMap(data: Record<string, string>): Map<string, string> {
  const m = new Map<string, string>();
  for (const k in data) m.set(k, data[k]);
  return m;
}

function loadCorpus(): Corpus {
  if (_corpus) return _corpus;

  const arabic = new Map<string, string>();
  for (const v of (uthmaniRaw as { quran: VerseEntry[] }).quran) {
    arabic.set(`${v.chapter}:${v.verse}`, v.text);
  }

  const translations = new Map<string, Map<string, string>>();
  translations.set("krachkovsky",  buildMap(krachkovskyMap as Record<string, string>));
  translations.set("osmanov",      buildMap(osmanovMap     as Record<string, string>));
  translations.set("porokhova",    buildMap(porokhovaMap   as Record<string, string>));
  translations.set("ayati",        buildMap(ayatiMap       as Record<string, string>));
  translations.set("sodik",        buildMap(sodikMap       as Record<string, string>));
  translations.set("altay",        buildMap(altayMap       as Record<string, string>));
  translations.set("mokhtasar-ky", buildMap(mokhtasarKyMap as Record<string, string>));
  translations.set("fooladvand",   buildMap(fooladvandMap  as Record<string, string>));

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
