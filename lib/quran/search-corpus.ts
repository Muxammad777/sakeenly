// Full-text search over the Qur'an — Arabic Uthmani + per-locale translation.
//
// Loads the entire corpus once per Node worker (6236 verses × a handful of
// strings = ~6MB heap). On each query we run a normalized token AND scan;
// for 6236 records this is ~5–10ms which is fine before we invest in
// pgvector / Voyage embeddings.
//
// Data sources (all local, no external API on request path):
//   - lib/knowledge/quran/uthmani.json — Hafs `an Asim Uthmani text
//   - lib/quran/tanzil/<translator>.json — translation maps
//
// Per-locale translator stack:
//   - First entry's text shows up in results (the snippet language).
//   - All entries are searched, so a query worded by one translator
//     still finds verses that match another's phrasing.

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

// Same shape as uthmani.json: {quran: [{chapter, verse, text}]}.
function buildMapFromVerseArray(data: { quran: VerseEntry[] }): Map<string, string> {
  const m = new Map<string, string>();
  for (const v of data.quran) m.set(`${v.chapter}:${v.verse}`, v.text);
  return m;
}

// Quran.com API response shape: {data: {surahs: [{number, ayahs: [{numberInSurah, text}]}]}}
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

  _corpus = { arabic, translations };
  return _corpus;
}

const TRANSLATORS_BY_LOCALE: Record<Locale, string[]> = {
  ru: ["kuliev", "krachkovsky", "osmanov", "porokhova", "abuadel"],
  en: ["sahih-intl", "khattab"],
  fa: ["fooladvand"],
  tg: ["ayati"],
  uz: ["sodik"],
  kk: ["altay"],
  ky: ["mokhtasar-ky"],
  // Newly-added locales — local Tanzil translations not bundled yet.
  // Search still works (Arabic-only matching) until we add per-locale
  // canonical translators (Maududi UR, Wahiduddin HI, Yusuf Ali BM,
  // Kemenag ID). Falls back to EN for now so substring matches at least
  // hit English-cognate words.
  ur: ["sahih-intl", "khattab"],
  ms: ["sahih-intl", "khattab"],
  hi: ["sahih-intl", "khattab"],
  id: ["sahih-intl", "khattab"],
};

// Arabic normalization — strip ALL Quranic tashkeel + tatweel and fold
// the common letter variants so a user typing "الله" finds the Uthmani
// "ٱللَّهِ" (alef-wasla + shadda + harakat), and "بسم" finds "بِسۡمِ"
// (sukun above is U+06E1, well inside the Quranic mark range).
//
// Mark ranges covered:
//   U+0610–U+061A  Arabic-script annotation marks
//   U+064B–U+065F  Basic tashkeel + Quranic marks
//   U+0670         Superscript alef
//   U+06D6–U+06ED  Quranic annotation marks (incl. sukun above U+06E1)
//   U+0640         Tatweel
const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const ALEF_VARIANTS = /[ٱآأإ]/g; // ٱ آ أ إ → ا
function normalizeArabic(s: string): string {
  return s
    .normalize("NFKD")
    .replace(HARAKAT, "")
    .replace(ALEF_VARIANTS, "ا") // ا
    .replace(/ى/g, "ي")     // ى → ي
    .replace(/ة/g, "ه")     // ة → ه
    .trim();
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

// Russian/transliteration aliases for prophet & figure names.
// Quran translations consistently use the classical "Йусуф / Йунус /
// Йакуб" forms but most users type the colloquial "Юсуф / Юнус / Якуб"
// (and a few try the Biblical forms — Иосиф, Иона). For each canonical
// token we keep every variant readers might type; a query token that
// hits this map expands into an OR across all variants.
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

// Token → its alias group (or just [token] when not aliased).
function aliasesFor(token: string): string[] {
  for (const group of RU_NAME_ALIASES) {
    if (group.includes(token)) return [...group];
  }
  return [token];
}

export interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  /** The translation snippet shown to the user. When matched in a
   *  non-default translator, this is THAT translator's text (not the
   *  display default) — so the user sees the words their query actually
   *  hit. Otherwise it's the locale's default-translator snippet. */
  translation: string | null;
  /** Which translator the snippet above is from. Frontend renders this
   *  as a small "перевод: Османов" chip so the user understands why
   *  the wording differs from elsewhere on the site. */
  translator: string | null;
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
  const trKeys = TRANSLATORS_BY_LOCALE[locale];
  // Pair each translator key with its loaded map (skip any that
  // failed to load). First entry is the locale's display default.
  const trEntries: Array<[string, Map<string, string>]> = [];
  for (const k of trKeys) {
    const m = corpus.translations.get(k);
    if (m) trEntries.push([k, m]);
  }
  const defaultEntry = trEntries[0] ?? null;

  // Tokenize: split on whitespace + punctuation, drop tokens < 2 chars.
  // Each token must hit somewhere in the haystack (AND-match) — so
  // "Господ миров" finds "Господу миров" because both stems are present.
  const splitTokens = (s: string) =>
    s.split(/[\s.,;:!?()«»"'\-—–]+/).filter((t) => t.length >= 2);

  const arQuery = looksArabic(q) ? normalizeArabic(q) : null;
  const arTokens = arQuery ? splitTokens(arQuery) : [];
  const txTokens = splitTokens(normalizeText(q));

  // Pre-compute alias OR-groups per text token (Arabic tokens have no
  // alias map yet, so they pass through as single-element groups).
  const txTokenGroups = txTokens.map(aliasesFor);

  const allTokensIn = (haystack: string, tokens: string[]) => {
    if (tokens.length === 0) return false;
    for (const t of tokens) if (!haystack.includes(t)) return false;
    return true;
  };
  const allGroupsIn = (haystack: string, groups: string[][]) => {
    if (groups.length === 0) return false;
    for (const g of groups) {
      let hit = false;
      for (const v of g) if (haystack.includes(v)) { hit = true; break; }
      if (!hit) return false;
    }
    return true;
  };

  const results: SearchResult[] = [];

  for (const [verseKey, arabicText] of corpus.arabic) {
    let arHit = false;
    let txHit = false;

    if (arTokens.length > 0) {
      const normAr = normalizeArabic(arabicText);
      if (allTokensIn(normAr, arTokens)) arHit = true;
    }

    // Track WHICH translator caught the match so we can show that
    // translator's snippet (not the default's) — otherwise the user
    // sees a verse whose displayed text doesn't contain the query.
    let matchedTranslator: string | null = null;
    let matchedText: string | null = null;
    if (txTokenGroups.length > 0) {
      for (const [key, map] of trEntries) {
        const txt = map.get(verseKey);
        if (!txt) continue;
        if (allGroupsIn(normalizeText(txt), txTokenGroups)) {
          txHit = true;
          matchedTranslator = key;
          matchedText = txt;
          break;
        }
      }
    }

    if (!arHit && !txHit) continue;
    const [s, a] = verseKey.split(":").map(Number);
    // Prefer the matched translator's text in the snippet, falling
    // back to the locale default for arabic-only / pure-arabic hits.
    const snippetText = matchedText ?? defaultEntry?.[1].get(verseKey) ?? null;
    const snippetKey  = matchedTranslator ?? (snippetText ? defaultEntry?.[0] ?? null : null);
    results.push({
      verseKey,
      surah: s,
      ayah: a,
      arabic: arabicText,
      translation: snippetText,
      translator: snippetKey,
      matched: arHit && txHit ? "both" : arHit ? "arabic" : "translation",
    });

    if (results.length >= limit) break;
  }

  return results;
}
