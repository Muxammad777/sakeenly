// Tools exposed to the Claude assistant on /ask.
//
// Each tool declares an Anthropic input_schema and an executor. The
// agent loop in /api/ask/stream iterates tool_use blocks Claude emits,
// calls the matching executor, and streams the tool_result back.
//
// We intentionally keep tools side-effect free — no DB mutations, no
// external state. The pipeline persists messages itself after the
// stream is done.

import { retrieve, type RetrievedAyah } from "./retrieval";
import { searchHadith, getHadith, type HadithHit } from "./hadith-search";
import { TRANSLATIONS, type TranslationKey } from "@/lib/quran/constants";
import { quranApi } from "@/lib/api/quran";

export interface ToolDef {
  name: string;
  description: string;
  // Anthropic tool input schema (JSON Schema subset).
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOLS: ToolDef[] = [
  {
    name: "search_quran",
    description:
      "Search the Qur'an for verses semantically relevant to a query. Returns up to topK ayat with their full translation in the user's preferred language. Use this whenever the user asks about a topic, virtue, prayer, story or attribute — even if you think you know the answer, ALWAYS retrieve so you can cite real verses.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language search query, in the user's language." },
        topK: { type: "number", description: "Max ayat to return (1-7, default 5)." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_ayah",
    description:
      "Fetch the full Arabic text + translation for a specific verse by key like '2:255'. Use when the user names a specific ayah, or to get more context on an ayah another tool already returned.",
    input_schema: {
      type: "object",
      properties: {
        verseKey: { type: "string", description: 'Verse key, format "<surah>:<ayah>", e.g. "2:255".' },
      },
      required: ["verseKey"],
    },
  },
  {
    name: "search_hadith",
    description:
      "Search the bundled Sahih al-Bukhari and Sahih Muslim corpus (~15k narrations, English text) for hadith relevant to a query. Use when the user asks about the Prophet's ﷺ practice, the Sunnah, virtues, or any matter where hadith would strengthen the answer. ALWAYS prefer this tool over making up hadith numbers.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language search query, in English (translate the user's query if needed)." },
        topK: { type: "number", description: "Max hadith to return (1-5, default 3)." },
        collections: {
          type: "array",
          items: { type: "string", enum: ["bukhari", "muslim"] },
          description: "Which collections to search. Defaults to both.",
        },
      },
      required: ["query"],
    },
  },
];

export type ToolName = "search_quran" | "get_ayah" | "search_hadith";

// ─── EXECUTORS ─────────────────────────────────────────────────────

export interface AyahResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  translationKey: TranslationKey;
}
export interface HadithResult {
  collection: "bukhari" | "muslim";
  number: number;
  chapter_en: string;
  narrator: string;
  english: string;
  arabic: string;
}

export interface ToolExecCtx {
  language: "ru" | "en";
  preferredTranslation: TranslationKey;
}

export async function runSearchQuran(
  ctx: ToolExecCtx,
  input: { query: string; topK?: number },
): Promise<{ ayat: AyahResult[] }> {
  const { ayat } = await retrieve({
    query: input.query,
    language: ctx.language,
    preferredTranslation: ctx.preferredTranslation,
    topK: Math.min(7, Math.max(1, input.topK ?? 5)),
  });
  return { ayat: ayat.map(toAyahResult) };
}

export async function runGetAyah(
  ctx: ToolExecCtx,
  input: { verseKey: string },
): Promise<{ ayah: AyahResult | null }> {
  if (!/^\d{1,3}:\d{1,4}$/.test(input.verseKey)) return { ayah: null };
  const translation = TRANSLATIONS.find((t) => t.key === ctx.preferredTranslation);
  try {
    const verse = await quranApi.verseByKey(input.verseKey, {
      language: ctx.language,
      translations: translation && translation.source === "quran.com" ? [translation] : [],
    });
    const tr = verse.translations?.[0]?.text ?? "";
    return {
      ayah: {
        verseKey: verse.verse_key,
        surah: Number(verse.verse_key.split(":")[0]),
        ayah: Number(verse.verse_key.split(":")[1]),
        arabic: verse.text_uthmani,
        translation: tr.replace(/<[^>]+>/g, "").trim(),
        translationKey: ctx.preferredTranslation,
      },
    };
  } catch (err) {
    console.error("[tool/get_ayah]", err);
    return { ayah: null };
  }
}

export async function runSearchHadith(
  _ctx: ToolExecCtx,
  input: { query: string; topK?: number; collections?: Array<"bukhari" | "muslim"> },
): Promise<{ hadith: HadithResult[] }> {
  const hits = searchHadith(input.query, {
    topK: Math.min(5, Math.max(1, input.topK ?? 3)),
    collections: input.collections,
  });
  return { hadith: hits.map(toHadithResult) };
}

// Helper for refs the assistant may cite directly: "Bukhari 6502" →
// lookup so we can validate citations after the stream.
export function lookupHadithRef(
  collection: "bukhari" | "muslim",
  number: number,
): HadithResult | null {
  const h = getHadith(collection, number);
  return h ? toHadithResult(h) : null;
}

function toAyahResult(a: RetrievedAyah): AyahResult {
  return {
    verseKey: a.verseKey,
    surah: a.surah,
    ayah: a.ayah,
    arabic: a.arabic,
    translation: a.translation,
    translationKey: a.translationKey,
  };
}

function toHadithResult(h: HadithHit): HadithResult {
  return {
    collection: h.collection,
    number: h.number,
    chapter_en: h.chapter_en,
    narrator: h.narrator,
    english: h.english,
    arabic: h.arabic,
  };
}
