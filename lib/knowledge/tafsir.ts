// Tafsir loader — reads the JSON corpora in lib/knowledge/tafsir/* and
// returns the verse-level commentary for the requested verse + author.
//
// We ship two of the most-cited tafsirs:
//   - Ibn Kathir (classical, 8th-century)  →  ar + en
//   - As-Saadi  (modern, 20th-century)    →  ar + ru
//
// For locales that don't have a native translation of the author the
// loader falls back: ru → ar → en for ibn-kathir, ru → ar for saddi,
// en → ar for saddi. Caller gets the actualLang so the UI can show the
// "shown in English/Arabic" note when needed.

import { readFile } from "node:fs/promises";
import path from "node:path";

export type TafsirAuthor = "ibn-kathir" | "saddi" | "jalalayn" | "muyassar";
export type TafsirLang = "ar" | "en" | "ru" | "ur" | "id" | "fa";

const FOLDER: Partial<Record<`${TafsirAuthor}:${TafsirLang}`, string>> = {
  // Ibn Kathir — classical, 8th c. AR + EN + UR are full-length.
  "ibn-kathir:ar": "ar-tafsir-ibn-kathir",
  "ibn-kathir:en": "en-tafisr-ibn-kathir", // (yes — typo is the folder name on disk)
  "ibn-kathir:ur": "ur-tafseer-ibn-e-kaseer",
  // As-Saadi — modern, 20th c. AR + RU + UR + ID + FA.
  "saddi:ar":      "ar-tafseer-al-saddi",
  "saddi:ru":      "ru-tafseer-al-saddi",
  "saddi:ur":      "ur-tafseer-al-saddi",
  "saddi:id":      "id-tafseer-al-saddi",
  "saddi:fa":      "fa-tafseer-al-saddi",
  // Al-Jalalayn — most-cited concise classical tafsir. AR + EN.
  "jalalayn:ar":   "ar-tafsir-al-jalalayn",
  "jalalayn:en":   "en-al-jalalayn",
  // Al-Muyassar — King Fahd Quran Complex, modern, very concise. AR only.
  "muyassar:ar":   "ar-tafsir-muyassar",
};

const NATIVE_PREFERENCE: Record<string, TafsirLang[]> = {
  ru: ["ru", "en", "ar"],
  en: ["en", "ar", "ur"],
  ar: ["ar", "en"],
  fa: ["fa", "ar", "en"],
  tg: ["ru", "ar"],
  uz: ["ru", "ar"],
  kk: ["ru", "ar"],
  ky: ["ru", "ar"],
  ur: ["ur", "ar", "en"],
  ms: ["id", "ar", "en"],
  hi: ["ur", "en", "ar"],
  id: ["id", "ar", "en"],
};

function pickLang(author: TafsirAuthor, locale: string): TafsirLang | null {
  const order = NATIVE_PREFERENCE[locale] ?? ["en", "ar"];
  for (const lang of order) {
    if (FOLDER[`${author}:${lang}` as keyof typeof FOLDER]) return lang;
  }
  return null;
}

interface TafsirRow { ayah: number; surah: number; text: string }
// Two formats float around the open-data tafsir corpora:
//   1) { ayahs: [{ayah, surah, text}] }  — wrapper object
//   2) [ {ayah, surah, text} ]           — raw array
// Both are handled below.
type TafsirFile = { ayahs?: TafsirRow[] } | TafsirRow[];

// Tiny in-process cache: one suras-file is opened many times when the
// reader scrolls through verses. JSON is read once per (folder, surah).
const cache = new Map<string, Map<number, string>>();

async function loadSurah(folder: string, surah: number): Promise<Map<number, string>> {
  const key = `${folder}:${surah}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const file = path.join(process.cwd(), "lib", "knowledge", "tafsir", folder, `${surah}.json`);
  try {
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw) as TafsirFile;
    const rows = Array.isArray(data) ? data : (data.ayahs ?? []);
    const map = new Map<number, string>();
    for (const a of rows) {
      if (typeof a.ayah === "number" && typeof a.text === "string") {
        map.set(a.ayah, a.text);
      }
    }
    cache.set(key, map);
    return map;
  } catch {
    const empty = new Map<number, string>();
    cache.set(key, empty);
    return empty;
  }
}

export async function getTafsir(
  surah: number,
  ayah: number,
  author: TafsirAuthor,
  locale: string,
): Promise<{ text: string; lang: TafsirLang } | null> {
  const lang = pickLang(author, locale);
  if (!lang) return null;
  const folder = FOLDER[`${author}:${lang}` as keyof typeof FOLDER];
  if (!folder) return null;
  const surahMap = await loadSurah(folder, surah);
  const text = surahMap.get(ayah);
  if (!text) return null;
  return { text, lang };
}

export async function getTafsirRange(
  surah: number,
  ayahs: number[],
  author: TafsirAuthor,
  locale: string,
): Promise<Array<{ ayah: number; text: string; lang: TafsirLang } | null>> {
  const lang = pickLang(author, locale);
  if (!lang) return ayahs.map(() => null);
  const folder = FOLDER[`${author}:${lang}` as keyof typeof FOLDER];
  if (!folder) return ayahs.map(() => null);
  const surahMap = await loadSurah(folder, surah);
  return ayahs.map((a) => {
    const text = surahMap.get(a);
    return text ? { ayah: a, text, lang } : null;
  });
}

export const TAFSIR_AUTHORS: { key: TafsirAuthor; nameRu: string; nameEn: string; nameAr: string }[] = [
  { key: "ibn-kathir", nameRu: "Ибн Касир",     nameEn: "Ibn Kathir",   nameAr: "ابن كثير" },
  { key: "saddi",      nameRu: "Ас-Саади",      nameEn: "As-Saadi",     nameAr: "السعدي" },
  { key: "jalalayn",   nameRu: "Аль-Джалалейн", nameEn: "Al-Jalalayn",  nameAr: "الجلالين" },
  { key: "muyassar",   nameRu: "Аль-Муяссар",   nameEn: "Al-Muyassar",  nameAr: "الميسر" },
];
