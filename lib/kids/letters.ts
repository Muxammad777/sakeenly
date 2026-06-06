// The 28 Arabic letters with the metadata our kids UI needs:
//   - slug:          stable progress key ("alif", "ba", …)
//   - ar:            isolated glyph
//   - name:          Latin name shown in Russian UI ("Алиф")
//   - tts:           token we feed to the Web Speech API to pronounce it
//   - order:         classical alphabet order, 1-based
//
// We keep the list here (not in DB) because it never changes.

export interface ArabicLetter {
  slug: string;      // stable progress key — DO NOT renumber
  ar: string;
  name: string;
  tr: string;        // ASCII transliteration, shown beside the glyph
  audio: string;     // file in /public/audio/alphabet/{audio}.mp3
  order: number;
}

// Transliteration follows DIN 31635 — the canonical scholarly standard used in
// Arabist/Islamic-studies publishing (Brill EI, German/Russian academic tradition).
// Russian names for the emphatic letters ص ض ط ظ use the classical Madrasa form
// (Сод/Дод/Тоʼ/Зоʼ) to prevent collisions with their non-emphatic siblings
// ت / د / ز so a child never confuses ط and ت by name alone.
export const ARABIC_LETTERS: ArabicLetter[] = [
  { slug: "alif",     ar: "ا", name: "Алиф", tr: "ʾ",  audio: "01-alif",    order: 1 },
  { slug: "ba",       ar: "ب", name: "Ба",   tr: "b",  audio: "02-ba",      order: 2 },
  { slug: "ta",       ar: "ت", name: "Та",   tr: "t",  audio: "03-ta",      order: 3 },
  { slug: "tha",      ar: "ث", name: "Са",   tr: "ṯ",  audio: "04-tha",     order: 4 },
  { slug: "jim",      ar: "ج", name: "Джим", tr: "ǧ",  audio: "05-jim",     order: 5 },
  { slug: "ha",       ar: "ح", name: "Ха",   tr: "ḥ",  audio: "06-ha",      order: 6 },
  { slug: "kha",      ar: "خ", name: "Ха",   tr: "ḫ",  audio: "07-kha",     order: 7 },
  { slug: "dal",      ar: "د", name: "Даль", tr: "d",  audio: "08-dal",     order: 8 },
  { slug: "dhal",     ar: "ذ", name: "Заль", tr: "ḏ",  audio: "09-dhal",    order: 9 },
  { slug: "ra",       ar: "ر", name: "Ра",   tr: "r",  audio: "10-ra",      order: 10 },
  { slug: "zay",      ar: "ز", name: "Зай",  tr: "z",  audio: "11-zay",     order: 11 },
  { slug: "sin",      ar: "س", name: "Син",  tr: "s",  audio: "12-sin",     order: 12 },
  { slug: "shin",     ar: "ش", name: "Шин",  tr: "š",  audio: "13-shin",    order: 13 },
  { slug: "sad",      ar: "ص", name: "Сод",  tr: "ṣ",  audio: "14-sad",     order: 14 },
  { slug: "dad",      ar: "ض", name: "Дод",  tr: "ḍ",  audio: "15-dad",     order: 15 },
  { slug: "ta_emp",   ar: "ط", name: "Тоʼ",  tr: "ṭ",  audio: "16-ta-emp",  order: 16 },
  { slug: "za_emp",   ar: "ظ", name: "Зоʼ",  tr: "ẓ",  audio: "17-za-emp",  order: 17 },
  { slug: "ayn",      ar: "ع", name: "Айн",  tr: "ʿ",  audio: "18-ayn",     order: 18 },
  { slug: "ghayn",    ar: "غ", name: "Гайн", tr: "ġ",  audio: "19-ghayn",   order: 19 },
  { slug: "fa",       ar: "ف", name: "Фа",   tr: "f",  audio: "20-fa",      order: 20 },
  { slug: "qaf",      ar: "ق", name: "Каф",  tr: "q",  audio: "21-qaf",     order: 21 },
  { slug: "kaf",      ar: "ك", name: "Кяф",  tr: "k",  audio: "22-kaf",     order: 22 },
  { slug: "lam",      ar: "ل", name: "Лям",  tr: "l",  audio: "23-lam",     order: 23 },
  { slug: "mim",      ar: "م", name: "Мим",  tr: "m",  audio: "24-mim",     order: 24 },
  { slug: "nun",      ar: "ن", name: "Нун",  tr: "n",  audio: "25-nun",     order: 25 },
  { slug: "ha_soft",  ar: "ه", name: "Хаʼ",  tr: "h",  audio: "26-ha-soft", order: 26 },
  { slug: "waw",      ar: "و", name: "Уау",  tr: "w",  audio: "27-waw",     order: 27 },
  { slug: "ya",       ar: "ي", name: "Йа",   tr: "y",  audio: "28-ya",      order: 28 },
];

export const LETTER_BY_SLUG: Record<string, ArabicLetter> = Object.fromEntries(
  ARABIC_LETTERS.map((l) => [l.slug, l]),
);

// "First surahs for hifz" — the canonical 5 short ones plus Al-Fatiha.
// Surah number is the progress key.
export interface KidSurah {
  num: number;
  slug: string;
  ar: string;
  name: string;
  ayahs: number;
}

export const KID_SURAHS: KidSurah[] = [
  { num: 1,   slug: "fatiha",  ar: "الفاتحة",    name: "Аль-Фатиха", ayahs: 7 },
  { num: 114, slug: "nas",     ar: "الناس",      name: "Ан-Нас",     ayahs: 6 },
  { num: 113, slug: "falaq",   ar: "الفلق",      name: "Аль-Фалак",  ayahs: 5 },
  { num: 112, slug: "ikhlas",  ar: "الإخلاص",    name: "Аль-Ихлас",  ayahs: 4 },
  { num: 111, slug: "masad",   ar: "المسد",      name: "Аль-Масад",  ayahs: 5 },
  { num: 110, slug: "nasr",    ar: "النصر",      name: "Ан-Наср",    ayahs: 3 },
];

export const KID_SURAH_BY_KEY: Record<string, KidSurah> = Object.fromEntries(
  KID_SURAHS.map((s) => [String(s.num), s]),
);
