// Retrieval layer for the RAG pipeline.
//
// MVP strategy:
//   1. Lexical search over translations via Quran.com /search (no own index).
//   2. Optional hadith retrieval via Sunnah.com — disabled until SUNNAH_API_KEY
//      is set AND we have a curated index of "number to retrieve" (Task 5+).
//
// We deliberately retrieve translations in the user's language so the model
// reads the same words the user reads — citations align with what they see.

import { quranApi, type SearchResult } from "@/lib/api/quran";
import { TRANSLATIONS, type TranslationKey, findTranslation } from "@/lib/quran/constants";

export interface RetrievedAyah {
  /** "S:A" */
  verseKey: string;
  surah: number;
  ayah: number;
  /** Arabic text (Uthmani) for the model — never displayed unless retrieved. */
  arabic: string;
  /** Translation matched to the active translation key, with HTML stripped. */
  translation: string;
  /** Which translation produced the `translation` field. */
  translationKey: TranslationKey;
}

interface RetrieveParams {
  query: string;
  language: "ru" | "en";
  /** Translation the user is reading right now (defaults to Kuliev for ru). */
  preferredTranslation?: TranslationKey;
  /** Max results to return (default 5). */
  topK?: number;
}

export interface RetrievalResult {
  ayat: RetrievedAyah[];
  /** Hadith retrieval reserved for future use (see Sunnah.com client). */
  hadith: never[];
}

const STRIP_HTML = /<[^>]+>/g;

export async function retrieve({
  query,
  language,
  preferredTranslation,
  topK = 5,
}: RetrieveParams): Promise<RetrievalResult> {
  const results = await quranApi.search({ query, language, size: topK });

  const targetMeta = findTranslation(
    preferredTranslation ?? (language === "ru" ? "kuliev" : "sahih-intl"),
  );

  const ayat = results
    .map((r) => toRetrievedAyah(r, targetMeta.id, targetMeta.key))
    .filter((a): a is RetrievedAyah => a !== null)
    .slice(0, topK);

  return { ayat, hadith: [] };
}

function toRetrievedAyah(
  r: SearchResult,
  preferredResourceId: number,
  preferredKey: TranslationKey,
): RetrievedAyah | null {
  const [surahStr, ayahStr] = r.verse_key.split(":");
  const surah = Number(surahStr);
  const ayah = Number(ayahStr);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return null;

  const match =
    r.translations.find((t) => t.resource_id === preferredResourceId) ??
    r.translations.find((t) =>
      TRANSLATIONS.some((tm) => tm.id === t.resource_id),
    ) ??
    r.translations[0];
  if (!match) return null;

  return {
    verseKey: r.verse_key,
    surah,
    ayah,
    arabic: r.text,
    translation: match.text.replace(STRIP_HTML, "").trim(),
    translationKey:
      TRANSLATIONS.find((tm) => tm.id === match.resource_id)?.key ?? preferredKey,
  };
}
