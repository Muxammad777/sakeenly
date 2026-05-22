// Sakeenly — curated translations and reciters.
//
// Quran.com API v4 hosts only Kuliev (RU) + Sahih International (EN). For
// Krachkovsky / Osmanov / Porokhova we ship a static corpus pulled from
// alquran.cloud at build/dev time (see /lib/quran/tanzil/*.json). Each file
// is a flat { "1:1": "...", "1:2": "...", ... } map of verse_key → text.

export type TranslationKey =
  | "kuliev"
  | "krachkovsky"
  | "osmanov"
  | "porokhova"
  | "sahih-intl"
  | "ayati"
  | "sodik"
  | "altay"
  | "mokhtasar-ky";

export type TranslationSource = "quran.com" | "tanzil";

export type TranslationLanguage = "ru" | "en" | "tg" | "uz" | "kk" | "ky";

export interface TranslationMeta {
  key: TranslationKey;
  /** Quran.com /resources/translations id — only valid when source === "quran.com" */
  id: number;
  label: string;
  short: string;
  language: TranslationLanguage;
  author: string;
  source: TranslationSource;
}

export const TRANSLATIONS: readonly TranslationMeta[] = [
  { key: "kuliev",      id: 45,  short: "Кулиев",      label: "Кулиев",              language: "ru", author: "Эльмир Кулиев · 2002",       source: "quran.com" },
  { key: "krachkovsky", id: 0,   short: "Крачковский", label: "Крачковский",         language: "ru", author: "И. Ю. Крачковский · 1963",   source: "tanzil"   },
  { key: "osmanov",     id: 0,   short: "Османов",     label: "Османов",             language: "ru", author: "М.-Н. Османов · 1995",       source: "tanzil"   },
  { key: "porokhova",   id: 0,   short: "Порохова",    label: "Порохова",            language: "ru", author: "В. М. Порохова · 1991",      source: "tanzil"   },
  { key: "ayati",       id: 0,   short: "Оятӣ",        label: "Оятӣ (тоҷикӣ)",       language: "tg", author: "AbdolMohammad Ayati",        source: "tanzil"   },
  { key: "sodik",       id: 0,   short: "Содиқ",       label: "Содиқ (oʻzbek)",      language: "uz", author: "Muhammad Sodik Yusuf",       source: "tanzil"   },
  { key: "altay",        id: 0,   short: "Алтай",       label: "Алтай (қазақша)",          language: "kk", author: "Халифа Алтай",                source: "tanzil"   },
  { key: "mokhtasar-ky", id: 0,   short: "Мухтасар",    label: "Мухтасар (кыргызча)",      language: "ky", author: "Мухтасар тафсири · KG",       source: "tanzil"   },
  { key: "sahih-intl",   id: 20,  short: "Sahih Int.",  label: "Sahih International",      language: "en", author: "Sahih International",         source: "quran.com" },
] as const;

/** Locale → default translation key. Used to preselect the right pill per UI language. */
export const DEFAULT_TRANSLATION_BY_LOCALE: Record<string, TranslationKey> = {
  ru: "kuliev",
  tg: "ayati",
  uz: "sodik",
  kk: "altay",
  ky: "mokhtasar-ky",
};

export const DEFAULT_TRANSLATION_KEY: TranslationKey = "kuliev";

export function findTranslation(key: TranslationKey | string | undefined): TranslationMeta {
  return TRANSLATIONS.find((t) => t.key === key) ?? TRANSLATIONS[0];
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ReciterMeta {
  /** Quran.com /resources/recitations id */
  id: number;
  slug: string;
  name: string;
  style?: "Mujawwad" | "Murattal" | "Muallim";
}

export const RECITERS: readonly ReciterMeta[] = [
  { id: 7, slug: "mishary", name: "Mishari Rashid al-`Afasy" },
  { id: 1, slug: "abdulbaset-mujawwad", name: "Abdul-Basit Abdul-Samad", style: "Mujawwad" },
  { id: 2, slug: "abdulbaset-murattal", name: "Abdul-Basit Abdul-Samad", style: "Murattal" },
  { id: 3, slug: "sudais", name: "Abdur-Rahman as-Sudais" },
  { id: 4, slug: "shatri", name: "Abu Bakr al-Shatri" },
  { id: 5, slug: "rifai", name: "Hani ar-Rifai" },
  { id: 6, slug: "husary", name: "Mahmoud Khalil Al-Husary" },
  { id: 8, slug: "minshawi-mujawwad", name: "Mohamed Siddiq al-Minshawi", style: "Mujawwad" },
  { id: 9, slug: "minshawi-murattal", name: "Mohamed Siddiq al-Minshawi", style: "Murattal" },
  { id: 10, slug: "shuraym", name: "Sa`ud ash-Shuraym" },
  { id: 11, slug: "tablawi", name: "Mohamed al-Tablawi" },
  { id: 12, slug: "husary-muallim", name: "Mahmoud Khalil Al-Husary", style: "Muallim" },
] as const;

export const DEFAULT_RECITER_SLUG = "mishary";

export function findReciter(slug: string | undefined): ReciterMeta {
  return RECITERS.find((r) => r.slug === slug) ?? RECITERS[0];
}
