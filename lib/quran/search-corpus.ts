// Full-text search over the Qur'an — Arabic Uthmani + per-locale translation.
//
// Loads the entire corpus once per Node worker. The matcher is layered:
//   1. EXACT PHRASE  — full query string appears as a contiguous substring
//                      (highest score, shown first)
//   2. TOKENS        — all tokens AND-match somewhere in the verse
//                      (whole-word boundaries when possible)
//   3. STEM          — same tokens match as substrings (catches related
//                      / inflected forms; the "однокоренные" mode)
//
// The caller can request `exactOnly: true` to drop bucket 3 (stems).
//
// Data sources (all local, no external API on request path):
//   - lib/knowledge/quran/uthmani.json — Hafs `an Asim Uthmani text
//   - lib/quran/tanzil/*.json + lib/knowledge/translations/*.json

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
import kulievRaw      from "@/lib/knowledge/translations/ru_elmirkuliev.json";
import abuadelRaw     from "@/lib/knowledge/translations/ru_abuadel.json";
import sahihRaw       from "@/lib/knowledge/translations/en_sahih_international.json";
import khattabRaw     from "@/lib/knowledge/translations/en_mustafakhattabg.json";
import urMaududiRaw   from "@/lib/knowledge/translations/ur_abulaalamaududi.json";
import urJalandhryRaw from "@/lib/knowledge/translations/ur_fatehmuhammadja.json";
import urJunagarhiRaw from "@/lib/knowledge/translations/ur_junagarhi.json";
import msBasmeihRaw   from "@/lib/knowledge/translations/ms_abdullahmuhamma.json";
import hiSuhelRaw     from "@/lib/knowledge/translations/hi_suhelfarooqkhan.json";
import hiFarooqRaw    from "@/lib/knowledge/translations/hi_farooq.json";
import idKemenagRaw   from "@/lib/knowledge/translations/id_indonesianislam.json";
import idMuntakhabRaw from "@/lib/knowledge/translations/id_muntakhab.json";
import idJalalaynRaw  from "@/lib/knowledge/translations/id_jalalayn.json";

type VerseEntry = { chapter: number; verse: number; text: string };

interface Corpus {
  arabic: Map<string, string>;
  translations: Map<string, Map<string, string>>;
}

let _corpus: Corpus | null = null;

function buildMap(data: Record<string, string>): Map<string, string> {
  const m = new Map<string, string>();
  for (const k in data) m.set(k, data[k]);
  return m;
}

function buildMapFromVerseArray(data: { quran: VerseEntry[] }): Map<string, string> {
  const m = new Map<string, string>();
  for (const v of data.quran) m.set(`${v.chapter}:${v.verse}`, v.text);
  return m;
}

function buildMapFromQuranComApi(data: { data: { surahs: Array<{ number: number; ayahs: Array<{ numberInSurah: number; text: string }> }> } }): Map<string, string> {
  const m = new Map<string, string>();
  for (const sura of data.data.surahs) {
    for (const a of sura.ayahs) m.set(`${sura.number}:${a.numberInSurah}`, a.text);
  }
  return m;
}

function loadCorpus(): Corpus {
  if (_corpus) return _corpus;

  const arabic = new Map<string, string>();
  for (const v of (uthmaniRaw as { quran: VerseEntry[] }).quran) {
    arabic.set(`${v.chapter}:${v.verse}`, v.text);
  }

  const translations = new Map<string, Map<string, string>>();
  translations.set("kuliev",       buildMapFromVerseArray(kulievRaw  as { quran: VerseEntry[] }));
  translations.set("abuadel",      buildMapFromVerseArray(abuadelRaw as { quran: VerseEntry[] }));
  translations.set("sahih-intl",   buildMapFromQuranComApi(sahihRaw as Parameters<typeof buildMapFromQuranComApi>[0]));
  translations.set("khattab",      buildMapFromVerseArray(khattabRaw as { quran: VerseEntry[] }));
  translations.set("krachkovsky",  buildMap(krachkovskyMap as Record<string, string>));
  translations.set("osmanov",      buildMap(osmanovMap     as Record<string, string>));
  translations.set("porokhova",    buildMap(porokhovaMap   as Record<string, string>));
  translations.set("ayati",        buildMap(ayatiMap       as Record<string, string>));
  translations.set("sodik",        buildMap(sodikMap       as Record<string, string>));
  translations.set("altay",        buildMap(altayMap       as Record<string, string>));
  translations.set("mokhtasar-ky", buildMap(mokhtasarKyMap as Record<string, string>));
  translations.set("fooladvand",   buildMap(fooladvandMap  as Record<string, string>));
  // Locales added in 2026-06 — Tanzil-derived translations.
  translations.set("ur-maududi",   buildMapFromVerseArray(urMaududiRaw   as { quran: VerseEntry[] }));
  translations.set("ur-jalandhry", buildMapFromVerseArray(urJalandhryRaw as { quran: VerseEntry[] }));
  translations.set("ur-junagarhi", buildMapFromVerseArray(urJunagarhiRaw as { quran: VerseEntry[] }));
  translations.set("ms-basmeih",   buildMapFromVerseArray(msBasmeihRaw   as { quran: VerseEntry[] }));
  translations.set("hi-suhel",     buildMapFromVerseArray(hiSuhelRaw     as { quran: VerseEntry[] }));
  translations.set("hi-farooq",    buildMapFromVerseArray(hiFarooqRaw    as { quran: VerseEntry[] }));
  translations.set("id-kemenag",   buildMapFromVerseArray(idKemenagRaw   as { quran: VerseEntry[] }));
  translations.set("id-muntakhab", buildMapFromVerseArray(idMuntakhabRaw as { quran: VerseEntry[] }));
  translations.set("id-jalalayn",  buildMapFromVerseArray(idJalalaynRaw  as { quran: VerseEntry[] }));

  _corpus = { arabic, translations };
  return _corpus;
}

// First entry is the locale's default snippet translator. All entries are
// searched in parallel — a verse can match in any of them.
const TRANSLATORS_BY_LOCALE: Record<Locale, string[]> = {
  ru: ["kuliev", "krachkovsky", "osmanov", "porokhova", "abuadel"],
  en: ["sahih-intl", "khattab"],
  fa: ["fooladvand"],
  tg: ["ayati"],
  uz: ["sodik"],
  kk: ["altay"],
  ky: ["mokhtasar-ky"],
  ur: ["ur-maududi", "ur-jalandhry", "ur-junagarhi"],
  ms: ["ms-basmeih"],
  hi: ["hi-suhel", "hi-farooq"],
  id: ["id-kemenag", "id-muntakhab", "id-jalalayn"],
};

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const ALEF_VARIANTS = /[ٱآأإ]/g;
function normalizeArabic(s: string): string {
  return s
    .normalize("NFKD")
    .replace(HARAKAT, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

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

// Russian/transliteration aliases for prophet & figure names.
const RU_NAME_ALIASES: ReadonlyArray<readonly string[]> = [
  ["юсуф",   "йусуф",   "иосиф"],
  ["юнус",   "йунус",   "иона"],
  ["якуб",   "йакуб",   "иаков", "яков"],
  ["ясин",   "йасин"],
  ["иса",    "иисус"],
  ["муса",   "моисей"],
  ["дауд",   "давид"],
  ["сулайман", "сулейман", "соломон"],
  ["ибрахим", "авраам"],
  ["исхак",  "исаак"],
  ["исмаил", "исмаэль", "измаил"],
  ["харун",  "аарон"],
  ["нух",    "ной"],
  ["идрис",  "енох"],
  ["закария","захария"],
  ["яхья",   "иоанн"],
  ["мириам", "марьям", "мария"],
];

function aliasesFor(token: string): string[] {
  for (const group of RU_NAME_ALIASES) {
    if (group.includes(token)) return [...group];
  }
  return [token];
}

export type MatchKind = "exact_phrase" | "tokens" | "stem";

export interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  translator: string | null;
  matched: "arabic" | "translation" | "both";
  /** How this verse matched the query — drives sort order and is shown
   *  to the user as a small chip ("точное"/"однокоренные"). */
  matchKind: MatchKind;
  /** Numerical relevance — higher is more relevant. Same matchKind
   *  results are ordered by score, then by verse number. */
  score: number;
}

export interface SearchOptions {
  /** Drop the "stem" bucket — only exact phrase + token-AND matches. */
  exactOnly?: boolean;
  /** Hard cap on returned results. Default 200 — the client paginates. */
  limit?: number;
}

// Whole-word boundary check for token mode — punctuation/space on both
// sides, or string boundary. For Arabic/Cyrillic/Devanagari we relax the
// JS \b (which treats non-Latin as word boundary) and use a custom char
// class instead.
const WORD_CHAR = /[\p{L}\p{N}]/u;
function isWholeWordMatch(haystack: string, needle: string, pos: number): boolean {
  const end = pos + needle.length;
  const before = pos === 0 ? "" : haystack[pos - 1];
  const after = end >= haystack.length ? "" : haystack[end];
  if (before && WORD_CHAR.test(before)) return false;
  if (after && WORD_CHAR.test(after)) return false;
  return true;
}

function findWholeWord(haystack: string, needle: string): boolean {
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    if (isWholeWordMatch(haystack, needle, idx)) return true;
    idx = haystack.indexOf(needle, idx + 1);
  }
  return false;
}

export function searchQuran(
  query: string,
  locale: Locale,
  options: SearchOptions | number = {},
): SearchResult[] {
  // Back-compat: old signature passed `limit: number` as third arg.
  const opts: SearchOptions = typeof options === "number" ? { limit: options } : options;
  const limit = opts.limit ?? 200;
  const exactOnly = opts.exactOnly ?? false;

  const q = query.trim();
  if (q.length < 2) return [];

  const corpus = loadCorpus();
  const trKeys = TRANSLATORS_BY_LOCALE[locale];
  const trEntries: Array<[string, Map<string, string>]> = [];
  for (const k of trKeys) {
    const m = corpus.translations.get(k);
    if (m) trEntries.push([k, m]);
  }
  const defaultEntry = trEntries[0] ?? null;

  const splitTokens = (s: string) =>
    s.split(/[\s.,;:!?()«»"'\-—–]+/).filter((t) => t.length >= 2);

  const arQuery = looksArabic(q) ? normalizeArabic(q) : null;
  const arPhrase = arQuery;
  const arTokens = arQuery ? splitTokens(arQuery) : [];

  const txPhrase = normalizeText(q);
  const txTokens = splitTokens(txPhrase);
  const txTokenGroups = txTokens.map(aliasesFor);

  const allTokensWholeWord = (haystack: string, tokens: string[]) => {
    if (tokens.length === 0) return false;
    for (const t of tokens) if (!findWholeWord(haystack, t)) return false;
    return true;
  };
  const allTokensSubstring = (haystack: string, tokens: string[]) => {
    if (tokens.length === 0) return false;
    for (const t of tokens) if (!haystack.includes(t)) return false;
    return true;
  };
  const allGroupsWholeWord = (haystack: string, groups: string[][]) => {
    if (groups.length === 0) return false;
    for (const g of groups) {
      let hit = false;
      for (const v of g) if (findWholeWord(haystack, v)) { hit = true; break; }
      if (!hit) return false;
    }
    return true;
  };
  const allGroupsSubstring = (haystack: string, groups: string[][]) => {
    if (groups.length === 0) return false;
    for (const g of groups) {
      let hit = false;
      for (const v of g) if (haystack.includes(v)) { hit = true; break; }
      if (!hit) return false;
    }
    return true;
  };

  // Score weights — higher = ranked sooner.
  // exact_phrase >> tokens >> stem. Within each tier we boost translation
  // hits over Arabic-only when the query looked like translation text,
  // and vice versa.
  const SCORE = {
    exact_phrase_both: 10000,
    exact_phrase: 9000,
    tokens_both: 5000,
    tokens: 4000,
    stem: 1000,
  } as const;

  type RawHit = {
    verseKey: string;
    surah: number;
    ayah: number;
    arabic: string;
    matchedTranslator: string | null;
    matchedText: string | null;
    matched: "arabic" | "translation" | "both";
    matchKind: MatchKind;
    score: number;
  };

  const hits: RawHit[] = [];

  for (const [verseKey, arabicText] of corpus.arabic) {
    const normAr = arPhrase ? normalizeArabic(arabicText) : "";

    // ── ARABIC matching ────────────────────────────────────────────
    // exact_phrase = whole-phrase WORD-BOUNDARY match (so "мир" doesn't
    // collide with "смиренно"). tokens = each token whole-word but the
    // full phrase is broken up. stem = substring fallback.
    let arKind: MatchKind | null = null;
    if (arPhrase) {
      if (findWholeWord(normAr, arPhrase)) {
        arKind = "exact_phrase";
      } else if (arTokens.length > 1 && allTokensWholeWord(normAr, arTokens)) {
        arKind = "tokens";
      } else if (!exactOnly && allTokensSubstring(normAr, arTokens)) {
        arKind = "stem";
      }
    }

    // ── TRANSLATION matching (pick first translator that hits, best kind) ──
    let txKind: MatchKind | null = null;
    let matchedTranslator: string | null = null;
    let matchedText: string | null = null;
    if (txTokenGroups.length > 0) {
      const rank = { exact_phrase: 3, tokens: 2, stem: 1 } as const;
      const isMultiToken = txTokens.length > 1;
      for (const [key, map] of trEntries) {
        const txt = map.get(verseKey);
        if (!txt) continue;
        const norm = normalizeText(txt);
        let kind: MatchKind | null = null;
        if (findWholeWord(norm, txPhrase)) kind = "exact_phrase";
        else if (isMultiToken && allGroupsWholeWord(norm, txTokenGroups)) kind = "tokens";
        else if (!exactOnly && allGroupsSubstring(norm, txTokenGroups)) kind = "stem";
        if (kind && (!txKind || rank[kind] > rank[txKind])) {
          txKind = kind;
          matchedTranslator = key;
          matchedText = txt;
          if (kind === "exact_phrase") break;
        }
      }
    }

    if (!arKind && !txKind) continue;

    // Pick the dominant matchKind (best across both sides).
    const rank = { exact_phrase: 3, tokens: 2, stem: 1 } as const;
    const matchKind: MatchKind =
      arKind && txKind
        ? rank[arKind] >= rank[txKind] ? arKind : txKind
        : (arKind ?? txKind)!;

    const matched: "arabic" | "translation" | "both" =
      arKind && txKind ? "both" : arKind ? "arabic" : "translation";

    let score = 0;
    if (matchKind === "exact_phrase") score = matched === "both" ? SCORE.exact_phrase_both : SCORE.exact_phrase;
    else if (matchKind === "tokens") score = matched === "both" ? SCORE.tokens_both : SCORE.tokens;
    else score = SCORE.stem;

    // Earlier surahs/ayat slightly preferred when scores tie — gives a
    // stable, mushaf-order layout within each bucket.
    const [s, a] = verseKey.split(":").map(Number);
    score += Math.max(0, 200 - s) * 0.1 + Math.max(0, 200 - a) * 0.01;

    hits.push({
      verseKey,
      surah: s,
      ayah: a,
      arabic: arabicText,
      matchedTranslator,
      matchedText,
      matched,
      matchKind,
      score,
    });
  }

  // Sort by score desc, then surah:ayah asc for stable order within tier.
  hits.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    if (x.surah !== y.surah) return x.surah - y.surah;
    return x.ayah - y.ayah;
  });

  const out: SearchResult[] = [];
  for (const h of hits) {
    const snippetText = h.matchedText ?? defaultEntry?.[1].get(h.verseKey) ?? null;
    const snippetKey  = h.matchedTranslator ?? (snippetText ? defaultEntry?.[0] ?? null : null);
    out.push({
      verseKey: h.verseKey,
      surah: h.surah,
      ayah: h.ayah,
      arabic: h.arabic,
      translation: snippetText,
      translator: snippetKey,
      matched: h.matched,
      matchKind: h.matchKind,
      score: h.score,
    });
    if (out.length >= limit) break;
  }
  return out;
}
