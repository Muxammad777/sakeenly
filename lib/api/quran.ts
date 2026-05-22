// Thin typed client for the Quran.com v4 REST API.
// Docs: https://api-docs.quran.com/docs/quran.com_versioned/
//
// All GETs are cached via Next.js fetch revalidate — the Quranic corpus is
// immutable, so we cache for a week. The client can be used from RSC, route
// handlers, or — with a CORS-friendly endpoint — from the browser.

import type { TranslationMeta, ReciterMeta } from "@/lib/quran/constants";

const BASE = process.env.QURAN_API_URL ?? "https://api.quran.com/api/v4";
const ONE_WEEK = 60 * 60 * 24 * 7;

interface QuranFetchOptions {
  /** seconds; defaults to one week */
  revalidate?: number;
}

async function fetchJson<T>(path: string, options: QuranFetchOptions = {}): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    next: { revalidate: options.revalidate ?? ONE_WEEK },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Quran.com ${res.status} on ${path}: ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as T;
}

// ─── Types (subset; only fields we consume) ──────────────────────────────────

export interface Chapter {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: { language_name: string; name: string };
}

export interface VerseTranslation {
  id: number;
  resource_id: number;
  text: string; // HTML-bearing string from Quran.com — sanitize on render.
}

export interface VerseAudio {
  url: string;
  segments?: number[][]; // [[wordIndex, startMs, endMs], ...]
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string; // "1:1"
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  sajdah_number: number | null;
  translations: VerseTranslation[];
  audio?: VerseAudio;
}

interface ChaptersResponse {
  chapters: Chapter[];
}
interface ChapterResponse {
  chapter: Chapter;
}
interface VersesByChapterResponse {
  verses: Verse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}
interface VerseByKeyResponse {
  verse: Verse;
}
interface TranslationsResponse {
  translations: Array<{
    id: number;
    name: string;
    author_name: string;
    slug: string;
    language_name: string;
  }>;
}
interface RecitationsResponse {
  recitations: Array<{
    id: number;
    reciter_name: string;
    style: string | null;
    translated_name: { name: string; language_name: string };
  }>;
}
interface ChapterAudioResponse {
  audio_file: {
    id: number;
    chapter_id: number;
    file_size: number;
    format: string;
    audio_url: string;
  };
}

// ─── Public client ───────────────────────────────────────────────────────────

export const quranApi = {
  /** All 114 chapter metadata records. */
  async chapters(language = "en"): Promise<Chapter[]> {
    const data = await fetchJson<ChaptersResponse>(
      `/chapters?language=${encodeURIComponent(language)}`,
    );
    return data.chapters;
  },

  async chapter(id: number, language = "en"): Promise<Chapter> {
    const data = await fetchJson<ChapterResponse>(
      `/chapters/${id}?language=${encodeURIComponent(language)}`,
    );
    return data.chapter;
  },

  /**
   * Verses for a full surah with selected translations and (optionally) the
   * recitation timing for verse-by-verse highlight.
   */
  async versesByChapter({
    chapter,
    translations,
    reciter,
    language = "en",
    perPage = 300,
  }: {
    chapter: number;
    translations: TranslationMeta[];
    reciter?: ReciterMeta;
    language?: string;
    perPage?: number;
  }): Promise<Verse[]> {
    const params = new URLSearchParams({
      language,
      per_page: String(perPage),
      fields: "text_uthmani,verse_key,verse_number,juz_number,page_number,sajdah_number",
    });
    if (translations.length > 0) {
      params.set("translations", translations.map((t) => t.id).join(","));
    }
    if (reciter) {
      params.set("audio", String(reciter.id));
    }
    const data = await fetchJson<VersesByChapterResponse>(
      `/verses/by_chapter/${chapter}?${params.toString()}`,
    );
    return data.verses;
  },

  async verseByKey(
    verseKey: string,
    {
      translations = [],
      reciter,
      language = "en",
    }: { translations?: TranslationMeta[]; reciter?: ReciterMeta; language?: string } = {},
  ): Promise<Verse> {
    const params = new URLSearchParams({
      language,
      fields: "text_uthmani,verse_key,verse_number",
    });
    if (translations.length > 0)
      params.set("translations", translations.map((t) => t.id).join(","));
    if (reciter) params.set("audio", String(reciter.id));
    const data = await fetchJson<VerseByKeyResponse>(
      `/verses/by_key/${encodeURIComponent(verseKey)}?${params.toString()}`,
    );
    return data.verse;
  },

  /** Full-surah mp3 URL for a given reciter (used by the global player). */
  async chapterAudio(reciterId: number, chapter: number): Promise<string> {
    const data = await fetchJson<ChapterAudioResponse>(
      `/chapter_recitations/${reciterId}/${chapter}`,
    );
    return data.audio_file.audio_url;
  },

  async listTranslations(language: string) {
    const data = await fetchJson<TranslationsResponse>(
      `/resources/translations?language=${encodeURIComponent(language)}`,
    );
    return data.translations;
  },

  async listRecitations() {
    const data = await fetchJson<RecitationsResponse>(`/resources/recitations`);
    return data.recitations;
  },

  /**
   * Full-text search over translations (default: en). Returns matched verses
   * with verse_key + translations[]. Used by the RAG retriever as a lexical
   * substitute for a vector index until we ship our own.
   */
  async search({
    query,
    language = "en",
    size = 5,
    page = 1,
  }: {
    query: string;
    language?: string;
    size?: number;
    page?: number;
  }): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      q: query,
      language,
      size: String(size),
      page: String(page),
    });
    const data = await fetchJson<SearchResponse>(`/search?${params.toString()}`, {
      // Lexical search results are sensitive to the question text — short
      // cache to balance cost and freshness.
      revalidate: 60 * 60,
    });
    return data.search?.results ?? [];
  },
};

export interface SearchResultTranslation {
  text: string;
  resource_id: number;
  name: string;
  language_name: string;
}

export interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  translations: SearchResultTranslation[];
}

interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    current_page: number;
    total_pages: number;
    results: SearchResult[];
  };
}
