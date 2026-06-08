// Client-safe slice of lib/knowledge/tafsir.ts.
//
// The full tafsir.ts module loads .json corpora via node:fs/promises +
// node:path — those Node APIs cannot be bundled into the client. Anything
// the UI needs (types, author list, locale-based default picker) lives
// here so client components can import without dragging fs in.

export type TafsirAuthor = "ibn-kathir" | "saddi" | "jalalayn" | "muyassar";
export type TafsirLang = "ar" | "en" | "ru" | "ur" | "id" | "fa";

const FOLDER: Partial<Record<`${TafsirAuthor}:${TafsirLang}`, true>> = {
  "ibn-kathir:ar": true,
  "ibn-kathir:en": true,
  "ibn-kathir:ur": true,
  "saddi:ar":      true,
  "saddi:ru":      true,
  "saddi:ur":      true,
  "saddi:id":      true,
  "saddi:fa":      true,
  "jalalayn:ar":   true,
  "jalalayn:en":   true,
  "muyassar:ar":   true,
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

/**
 * Pick the best author for the visitor's UI locale: the first author
 * (in canonical picker order) whose top-priority language for that locale
 * is a native, not-fallback entry.
 */
export function pickDefaultAuthor(locale: string): TafsirAuthor {
  const order = NATIVE_PREFERENCE[locale] ?? [];
  const topLang = order[0];
  if (topLang) {
    for (const author of ["saddi", "ibn-kathir", "jalalayn", "muyassar"] as const) {
      if (FOLDER[`${author}:${topLang}` as keyof typeof FOLDER]) return author;
    }
  }
  return "ibn-kathir";
}

export const TAFSIR_AUTHORS: { key: TafsirAuthor; nameRu: string; nameEn: string; nameAr: string }[] = [
  { key: "ibn-kathir", nameRu: "Ибн Касир",     nameEn: "Ibn Kathir",   nameAr: "ابن كثير" },
  { key: "saddi",      nameRu: "Ас-Саади",      nameEn: "As-Saadi",     nameAr: "السعدي" },
  { key: "jalalayn",   nameRu: "Аль-Джалалейн", nameEn: "Al-Jalalayn",  nameAr: "الجلالين" },
  { key: "muyassar",   nameRu: "Аль-Муяссар",   nameEn: "Al-Muyassar",  nameAr: "الميسر" },
];
