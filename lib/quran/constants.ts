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
  | "haleem"
  | "pickthall"
  | "yusufali"
  | "taji"
  | "islamhouse-fa"
  | "fooladvand"
  | "ayati"
  | "sodik"
  | "altay"
  | "mokhtasar-ky"
  | "ur-maududi"
  | "ur-jalandhry"
  | "ur-junagarhi"
  | "ms-basmeih"
  | "hi-suhel"
  | "hi-farooq"
  | "id-kemenag"
  | "id-muntakhab"
  | "id-jalalayn";

export type TranslationSource = "quran.com" | "tanzil";

export type TranslationLanguage = "ru" | "en" | "fa" | "tg" | "uz" | "kk" | "ky" | "ur" | "ms" | "hi" | "id";

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
  { key: "haleem",       id: 85,  short: "Haleem",      label: "M.A.S. Abdel Haleem",      language: "en", author: "M.A.S. Abdel Haleem · Oxford World's Classics 2004", source: "quran.com" },
  { key: "pickthall",    id: 19,  short: "Pickthall",   label: "M. Pickthall",             language: "en", author: "Marmaduke Pickthall · 1930",  source: "quran.com" },
  { key: "yusufali",     id: 22,  short: "Yusuf Ali",   label: "A. Yusuf Ali",             language: "en", author: "Abdullah Yusuf Ali · 1934",   source: "quran.com" },
  { key: "taji",         id: 29,  short: "تاجی",        label: "Hussein Taji Kal Dari",    language: "fa", author: "حسین تاجی گله‌داری",          source: "quran.com" },
  { key: "islamhouse-fa",id: 135, short: "اسلام‌هاوس",  label: "IslamHouse · فارسی",       language: "fa", author: "IslamHouse.com",              source: "quran.com" },
  { key: "fooladvand",   id: 0,   short: "فولادوند",    label: "محمدمهدی فولادوند",        language: "fa", author: "محمدمهدی فولادوند · 1373",   source: "tanzil"   },
  // ─── Urdu (Pakistan / South Asia) ───
  { key: "ur-maududi",   id: 0,   short: "مودودی",      label: "ابوالاعلیٰ مودودی · تفہیم القرآن", language: "ur", author: "Sayyid Abul A'la Maududi · 1972", source: "tanzil" },
  { key: "ur-jalandhry", id: 0,   short: "جالندھری",    label: "فتح محمد جالندھری",                language: "ur", author: "Fateh Muhammad Jalandhry · 1899", source: "tanzil" },
  { key: "ur-junagarhi", id: 0,   short: "جوناگڑھی",    label: "محمد جوناگڑھی",                    language: "ur", author: "Muhammad Junagarhi",            source: "tanzil" },
  // ─── Malay (JAKIM canonical) ───
  { key: "ms-basmeih",   id: 0,   short: "Basmeih",     label: "Abdullah Muhammad Basmeih",        language: "ms", author: "Abdullah Muhammad Basmeih · JAKIM", source: "tanzil" },
  // ─── Hindi ───
  { key: "hi-suhel",     id: 0,   short: "सुहेल फ़ारूक़", label: "सुहेल फ़ारूक़ ख़ान & सैफ़ुर्रहमान नदवी", language: "hi", author: "Suhel Farooq Khan & Saifur Rahman Nadwi", source: "tanzil" },
  { key: "hi-farooq",    id: 0,   short: "मुहम्मद फ़ारूक़", label: "मुहम्मद फ़ारूक़ ख़ान & मुहम्मद अहमद",     language: "hi", author: "Muhammad Farooq Khan & Muhammad Ahmed",  source: "tanzil" },
  // ─── Indonesian (Kemenag / Quraish Shihab / Jalalayn) ───
  { key: "id-kemenag",   id: 0,   short: "Kemenag",     label: "Kementerian Agama RI",             language: "id", author: "Kementerian Agama Republik Indonesia", source: "tanzil" },
  { key: "id-muntakhab", id: 0,   short: "Muntakhab",   label: "M. Quraish Shihab · Muntakhab",    language: "id", author: "Muhammad Quraish Shihab",       source: "tanzil" },
  { key: "id-jalalayn",  id: 0,   short: "Jalalayn",    label: "Tafsir Jalalayn (ID)",             language: "id", author: "Tafsir Jalalayn — Indonesian",   source: "tanzil" },
] as const;

/** Locale → default translation key. Used to preselect the right pill per UI language. */
export const DEFAULT_TRANSLATION_BY_LOCALE: Record<string, TranslationKey> = {
  ru: "kuliev",
  en: "sahih-intl",
  // Fooladvand is the gold-standard scholarly Persian translation
  // (used by tanzil.net and most Persian Quran apps). Default for fa.
  fa: "fooladvand",
  tg: "ayati",
  uz: "sodik",
  kk: "altay",
  ky: "mokhtasar-ky",
  // Indo-Pak/SE-Asia defaults — pick the most authoritative per region.
  ur: "ur-maududi",      // Maududi's Tafhim is the most-read Urdu work
  ms: "ms-basmeih",      // JAKIM-canonical, no alternative in open corpora
  hi: "hi-suhel",        // Suhel Farooq & Nadwi (Sahih Hindi) — Madani-aligned
  id: "id-kemenag",      // Kementerian Agama RI, official state edition
};

export const DEFAULT_TRANSLATION_KEY: TranslationKey = "kuliev";

export function findTranslation(key: TranslationKey | string | undefined): TranslationMeta {
  return TRANSLATIONS.find((t) => t.key === key) ?? TRANSLATIONS[0];
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ReciterMeta {
  /** Unique numeric id. For Quran.com reciters (id 1-12) this matches
   *  Quran.com /resources/recitations id. For mp3quran.net reciters
   *  (id >= 1000) it's our own counter offset to avoid collisions. */
  id: number;
  slug: string;
  name: string;
  style?: "Mujawwad" | "Murattal" | "Muallim";
  /** When present, chapter audio is fetched directly from this base URL
   *  via the pattern `${mp3quranServer}${chapter3digit}.mp3` instead of
   *  going through the Quran.com chapter_recitations API. */
  mp3quranServer?: string;
}

/** Curated list of 30 reciters.
 *  - ids 1-12 are official Quran.com chapter recitations
 *    (https://api.quran.com/api/v4/resources/recitations).
 *  - ids 1000+ hotlink to mp3quran.net which has the full Hafs Murattal
 *    recordings for ~200 qaris. Server URLs verified end-to-end with
 *    curl /001.mp3 → 200 audio/mpeg. */
export const RECITERS: readonly ReciterMeta[] = [
  // ─── Quran.com (11) ───
  { id: 1,  slug: "abdulbaset-mujawwad", name: "Abdul-Basit Abdul-Samad",      style: "Mujawwad" },
  { id: 2,  slug: "abdulbaset-murattal", name: "Abdul-Basit Abdul-Samad",      style: "Murattal" },
  { id: 3,  slug: "sudais",              name: "Abdur-Rahman as-Sudais" },
  { id: 4,  slug: "shatri",              name: "Abu Bakr al-Shatri" },
  { id: 5,  slug: "rifai",               name: "Hani ar-Rifai" },
  { id: 6,  slug: "husary",              name: "Mahmoud Khalil Al-Husary" },
  { id: 8,  slug: "minshawi-mujawwad",   name: "Mohamed Siddiq al-Minshawi",   style: "Mujawwad" },
  { id: 9,  slug: "minshawi-murattal",   name: "Mohamed Siddiq al-Minshawi",   style: "Murattal" },
  { id: 10, slug: "shuraym",             name: "Sa`ud ash-Shuraym" },
  { id: 11, slug: "tablawi",             name: "Mohamed al-Tablawi" },
  { id: 12, slug: "husary-muallim",      name: "Mahmoud Khalil Al-Husary",     style: "Muallim" },
  // ─── mp3quran.net (19) — all Hafs an Asim, Murattal ───
  { id: 1001, slug: "maher",        name: "Maher Al Meaqli",       mp3quranServer: "https://server12.mp3quran.net/maher/" },
  { id: 1002, slug: "ghamdi",       name: "Saad Al-Ghamdi",        mp3quranServer: "https://server7.mp3quran.net/s_gmd/" },
  { id: 1003, slug: "yasser",       name: "Yasser Al-Dosari",      mp3quranServer: "https://server11.mp3quran.net/yasser/" },
  { id: 1004, slug: "huthaifi",     name: "Ali Al-Huthaifi",       mp3quranServer: "https://server9.mp3quran.net/hthfi/" },
  { id: 1005, slug: "ayyub",        name: "Mohammed Ayyub",        mp3quranServer: "https://server8.mp3quran.net/ayyub/" },
  { id: 1006, slug: "hatem",        name: "Hatem Fareed Alwaer",   mp3quranServer: "https://server11.mp3quran.net/hatem/" },
  { id: 1007, slug: "tunaiji",      name: "Khalifa Al-Tunaiji",    mp3quranServer: "https://server12.mp3quran.net/tnjy/" },
  { id: 1008, slug: "qatami",       name: "Nasser Al-Qatami",      mp3quranServer: "https://server6.mp3quran.net/qtm/" },
  { id: 1009, slug: "bukhatir",     name: "Salah Bukhatir",        mp3quranServer: "https://server8.mp3quran.net/bu_khtr/" },
  { id: 1010, slug: "lohaidan",     name: "Mohammed Al-Lohaidan",  mp3quranServer: "https://server8.mp3quran.net/lhdan/" },
  { id: 1011, slug: "ali-jaber",    name: "Ali Jaber",             mp3quranServer: "https://server11.mp3quran.net/a_jbr/" },
  { id: 1012, slug: "qahtani",      name: "Khaled Al-Qahtani",     mp3quranServer: "https://server10.mp3quran.net/qht/" },
  { id: 1013, slug: "sayegh",       name: "Tawfiq As-Sayegh",      mp3quranServer: "https://server6.mp3quran.net/twfeeq/" },
  { id: 1014, slug: "ahmad-huth",   name: "Ahmad Al-Huthaifi",     mp3quranServer: "https://server8.mp3quran.net/ahmad_huth/" },
  { id: 1015, slug: "ibrahim-dosri",name: "Ibrahim Al-Dosari",     mp3quranServer: "https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Hafs-A-n-Assem/" },
  { id: 1016, slug: "wadood",       name: "Abdul-Wadud Haneef",    mp3quranServer: "https://server8.mp3quran.net/wdod/" },
  { id: 1017, slug: "akdar",        name: "Ibrahim Al-Akhdar",     mp3quranServer: "https://server6.mp3quran.net/akdr/" },
  { id: 1018, slug: "abkr",         name: "Idrees Abkr",           mp3quranServer: "https://server6.mp3quran.net/abkr/" },
  { id: 1019, slug: "juhany",       name: "Abdullah Al-Juhany",    mp3quranServer: "https://server13.mp3quran.net/jhn/" },
] as const;

/** Pad chapter number to 3 digits as required by mp3quran.net layout
 *  (001.mp3 ... 114.mp3). */
export function mp3quranChapterUrl(reciter: ReciterMeta, chapter: number): string | null {
  if (!reciter.mp3quranServer) return null;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) return null;
  return `${reciter.mp3quranServer}${String(chapter).padStart(3, "0")}.mp3`;
}

export const DEFAULT_RECITER_SLUG = "abdulbaset-mujawwad";

export function findReciter(slug: string | undefined): ReciterMeta {
  return RECITERS.find((r) => r.slug === slug) ?? RECITERS[0];
}
