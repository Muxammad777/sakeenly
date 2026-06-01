// GET /api/quran/wbw/<surah>/<ayah>?lang=ru
//
// Word-by-word data for a single ayah, proxied from Quran.com /api/v4.
// We return per-word arabic, transliteration, translation, line/page,
// and morphology hints (char_type, position). The route caches the
// upstream response — words don't change, so we hit Quran.com once
// per (verseKey, lang) per cold start.

import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";

// In-memory cache. Cleared on each cold start; Next.js workers live long
// enough that this is meaningful. ~50KB per ayah × 6236 × 11 locales
// would be ~3GB if fully populated — in practice users hit a tiny
// subset, so unbounded growth isn't a real concern.
const cache = new Map<string, unknown>();

interface WordRaw {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;       // "word" | "end" | "pause" | etc.
  page_number: number;
  line_number: number;
  text_uthmani: string;
  text_imlaei?: string;
  transliteration: { text: string; language_name: string };
  translation: { text: string; language_name: string };
}
interface VerseRaw {
  id: number;
  verse_key: string;
  words: WordRaw[];
}
interface UpstreamResponse { verse: VerseRaw }

const BASE = process.env.QURAN_API_URL ?? "https://api.quran.com/api/v4";

// Quran.com word_translation_language only supports ~10 codes. Map our
// 11 locales onto the closest available; unmapped → 'en'.
const WT_LANG: Record<string, string> = {
  ru: "russian",
  en: "english",
  fa: "persian",
  tg: "persian",   // closest written tradition
  uz: "uzbek",
  kk: "english",   // no kazakh in quran.com words
  ky: "english",
  ur: "urdu",
  ms: "malay",
  hi: "hindi",
  id: "indonesian",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ surah: string; ayah: string }> },
) {
  const { surah, ayah } = await ctx.params;
  const s = Number(surah), a = Number(ayah);
  if (!Number.isInteger(s) || !Number.isInteger(a) || s < 1 || s > 114 || a < 1) {
    return NextResponse.json({ error: "invalid_ref" }, { status: 400 });
  }
  const url = new URL(_req.url);
  const localeParam = url.searchParams.get("lang") ?? "ru";
  const locale = (routing.locales as readonly string[]).includes(localeParam) ? localeParam : "ru";
  const wtLang = WT_LANG[locale] ?? "english";
  const key = `${s}:${a}:${wtLang}`;

  if (cache.has(key)) {
    return NextResponse.json(cache.get(key));
  }

  const params = new URLSearchParams({
    words: "true",
    word_fields: "text_uthmani,text_imlaei,char_type_name,line_number,page_number,position",
    word_translation_language: wtLang,
    fields: "text_uthmani,verse_key",
  });
  const upstreamUrl = `${BASE}/verses/by_key/${encodeURIComponent(`${s}:${a}`)}?${params.toString()}`;

  const res = await fetch(upstreamUrl, {
    headers: { "accept": "application/json" },
    // Next.js fetch cache — 24h per (verseKey, lang) tuple.
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "upstream", status: res.status }, { status: 502 });
  }
  const data = (await res.json()) as UpstreamResponse;

  const verse = data.verse;
  const words = verse.words.map((w) => ({
    position: w.position,
    type: w.char_type_name,
    arabic: w.text_uthmani,
    imlaei: w.text_imlaei ?? null,
    translation: w.translation?.text ?? null,
    transliteration: w.transliteration?.text ?? null,
    line: w.line_number,
    page: w.page_number,
  }));

  const payload = {
    verseKey: verse.verse_key,
    locale,
    wtLang,
    words,
  };
  cache.set(key, payload);
  return NextResponse.json(payload);
}
