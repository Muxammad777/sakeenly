// "Muallim Sani" — children's tajwid course for Sakeenly.
//
// SOURCE OF TRUTH ─────────────────────────────────────────────────────
// All lesson titles, numbering and rule structure follow the printed
// textbook:
//
//   Аббясов Р.Р. «Учим арабский: учебное пособие по чтению Корана».
//   Москва, 2005. 100 с.
//   Редактор: имам Арслан Садриев. Одобрено и рекомендовано в качестве
//   пособия для исламских учебных заведений, находящихся под духовным
//   попечительством Совета муфтиев России.
//
// Аббясов's edition is the most widely-used modern Russian-language
// adaptation of Ахмадхади Максуди's classical «Мөгаллим Сани» (1892).
// All explanations were rewritten from scratch in child-friendly
// language; no text was copied verbatim from the book. Example phrases
// are short Qur'anic words drawn from the public-domain Uthmani text
// (Hafs `an `Asim). Where the book points the student at a specific
// surah to practise the rule on, we re-use that same surah.
//
// Lesson numbering matches the Table of Contents of the book, in
// reading order.

export interface MuallimExample {
  ar: string;          // Arabic phrase to recite
  tr: string;          // Latin transliteration
  hint?: string;       // optional one-line pedagogical hint (Russian)
}

export interface MuallimLesson {
  id: number;          // 1..17
  slug: string;        // url segment + progress key
  /** Which section of the book the lesson belongs to. */
  section: "razdel1" | "razdel2";
}

// Lesson titles and rule explanations live in the i18n bundle under
// the `muallim` namespace — see messages/{locale}.json. This file
// declares the structural skeleton + language-neutral example phrases.

export const MUALLIM_LESSONS: MuallimLesson[] = [
  // Раздел I — Навыки чтения
  { id: 1,  slug: "shadda",            section: "razdel1" },
  { id: 2,  slug: "tanwin",            section: "razdel1" },
  { id: 3,  slug: "hamza",             section: "razdel1" },
  { id: 4,  slug: "ta-marbuta",        section: "razdel1" },
  // Раздел II — Правила чтения Корана (Таджвид)
  { id: 5,  slug: "lam",               section: "razdel2" },
  { id: 6,  slug: "ra",                section: "razdel2" },
  { id: 7,  slug: "lam-shamsi-qamari", section: "razdel2" },
  { id: 8,  slug: "izhar",             section: "razdel2" },
  { id: 9,  slug: "idgham",            section: "razdel2" },
  { id: 10, slug: "iqlab",             section: "razdel2" },
  { id: 11, slug: "ikhfa",             section: "razdel2" },
  { id: 12, slug: "idgham-shafawi",    section: "razdel2" },
  { id: 13, slug: "ikhfa-shafawi",     section: "razdel2" },
  { id: 14, slug: "izhar-shafawi",     section: "razdel2" },
  { id: 15, slug: "idgham-mustaqil",   section: "razdel2" },
  { id: 16, slug: "madd",              section: "razdel2" },
  { id: 17, slug: "qalqalah",          section: "razdel2" },
];

export const MUALLIM_EXAMPLES: Record<string, MuallimExample[]> = {
  shadda: [
    { ar: "إِنَّ",          tr: "inna",          hint: "поистине — шадда удваивает «н»" },
    { ar: "رَبَّ",          tr: "rabba",         hint: "Господь — двойное «б»" },
    { ar: "ٱللَّهُ",         tr: "Allāh",          hint: "имя Аллаха — шадда на ل" },
    { ar: "ٱلَّذِينَ",      tr: "alladhīna",     hint: "которые — шадда на ل" },
    { ar: "أَلَّا",          tr: "allā",          hint: "чтобы не — двойное «л»" },
  ],
  tanwin: [
    { ar: "كِتَابًا",        tr: "kitāban",       hint: "ـً — окончание «-ан»" },
    { ar: "رَحْمَةٍ",        tr: "raḥmatin",      hint: "ـٍ — окончание «-ин»" },
    { ar: "هُدًى",          tr: "hudan",         hint: "ـً на алифе" },
    { ar: "نُورٌ",           tr: "nūrun",         hint: "ـٌ — окончание «-ун»" },
    { ar: "عَلِيمٌ",         tr: "ʿalīmun",       hint: "знающий — танвин-дамма" },
  ],
  hamza: [
    { ar: "أَنْعَمْتَ",      tr: "anʿamta",       hint: "хамза-катъ всегда звучит" },
    { ar: "إِيَّاكَ",         tr: "iyyāka",        hint: "хамза с кясрой" },
    { ar: "أُمَّةً",          tr: "ummatan",       hint: "хамза с даммой" },
    { ar: "ٱقْرَأْ",          tr: "iqraʾ",         hint: "хамза-васл в начале слова" },
    { ar: "بَدَأَ",          tr: "badaʾa",        hint: "хамза в середине слова" },
  ],
  "ta-marbuta": [
    { ar: "رَحْمَةٌ",         tr: "raḥmah",        hint: "та-марбута на конце — звучит как «х»" },
    { ar: "صَلَاةً",          tr: "ṣalāh",         hint: "молитва — та-марбута с танвином" },
    { ar: "جَنَّةُ",           tr: "jannatu",       hint: "сад — та-марбута + дамма" },
    { ar: "سُورَةٌ",          tr: "sūrah",         hint: "сура" },
    { ar: "مَلَائِكَةً",       tr: "malāʾikah",     hint: "ангелы" },
  ],
  lam: [
    { ar: "قُلْ",            tr: "qul",           hint: "«л» твёрдо в конце" },
    { ar: "بِسْمِ ٱللَّهِ",   tr: "bismillāh",     hint: "после кясры — «л» мягко" },
    { ar: "ٱلْحَمْدُ",         tr: "al-ḥamdu",      hint: "после фатхи — «л» твёрдо" },
    { ar: "لَا",              tr: "lā",            hint: "отрицание" },
    { ar: "إِلَّا",            tr: "illā",          hint: "кроме — после кясры мягко" },
  ],
  ra: [
    { ar: "رَبِّ",            tr: "rabbi",         hint: "«р» с фатхой — твёрдо" },
    { ar: "رِزْقٌ",           tr: "rizq",          hint: "«р» с кясрой — мягко" },
    { ar: "رُؤْيَا",           tr: "ruʾyā",         hint: "«р» с даммой — твёрдо" },
    { ar: "ٱلْفَجْرِ",         tr: "al-fajr",       hint: "сукун после кясры — мягко" },
    { ar: "ٱلْأَبْتَرُ",       tr: "al-abtar",      hint: "после фатхи — твёрдо" },
  ],
  "lam-shamsi-qamari": [
    { ar: "ٱلشَّمْسُ",        tr: "ash-shams",     hint: "«ش» — солнечная: лям не звучит" },
    { ar: "ٱلرَّحْمَٰنُ",      tr: "ar-Raḥmān",     hint: "«ر» — солнечная" },
    { ar: "ٱلتِّينِ",          tr: "at-tīn",        hint: "«ت» — солнечная" },
    { ar: "ٱلْقَمَرُ",         tr: "al-qamar",      hint: "«ق» — лунная: лям звучит" },
    { ar: "ٱلْكِتَابُ",        tr: "al-kitāb",      hint: "«ك» — лунная" },
  ],
  izhar: [
    { ar: "مَنْ آمَنَ",       tr: "man āmana",     hint: "нун перед ء — ясно" },
    { ar: "مِنْ خَيْرٍ",       tr: "min khayr",     hint: "нун перед خ" },
    { ar: "مِنْ هُمْ",         tr: "min hum",       hint: "нун перед ه" },
    { ar: "أَنْعَمْتَ",        tr: "anʿamta",       hint: "нун перед ع" },
    { ar: "وَمِنْ غِلٍّ",      tr: "wa-min ghill",  hint: "нун перед غ" },
  ],
  idgham: [
    { ar: "مَنْ يَّقُولُ",      tr: "may-yaqūlu",    hint: "с гунной — слияние с ي" },
    { ar: "مِنْ رَّبِّكُمْ",     tr: "mir-rabbikum",  hint: "без гунны — слияние с ر" },
    { ar: "مِنْ نُّورٍ",         tr: "min-nūrin",     hint: "слияние с ن" },
    { ar: "هُدًى لِّلْمُتَّقِينَ", tr: "hudal-lil-muttaqīn", hint: "без гунны — слияние с ل" },
    { ar: "وَلَدٌ مِّنْ",        tr: "waladum-min",   hint: "с гунной — слияние с م" },
  ],
  iqlab: [
    { ar: "مِنۢ بَعْدِ",        tr: "mim-baʿd",      hint: "нун → м перед ب" },
    { ar: "أَنۢبِئْهُمْ",        tr: "ambiʾhum",      hint: "нун → м в середине" },
    { ar: "كِرَامٍۭ بَرَرَةٍ",   tr: "kirāmim-bararah", hint: "танвин → м перед ب" },
    { ar: "صُمٌّۢ بُكْمٌ",       tr: "ṣummum-bukm",   hint: "танвин → м" },
    { ar: "مِنۢ بَيْنِ",         tr: "mim-bayn",      hint: "из-под, между" },
  ],
  ikhfa: [
    { ar: "أَنْتَ",            tr: "anta",          hint: "нун скрытно перед ت" },
    { ar: "إِنْ كُنْتُمْ",       tr: "in kuntum",     hint: "скрытно перед ك" },
    { ar: "مِنْ قَبْلُ",         tr: "min qabl",      hint: "скрытно перед ق" },
    { ar: "مِنْ شَرِّ",          tr: "min sharr",     hint: "Аль-Фаляк — перед ش" },
    { ar: "أَنْفُسَكُمْ",        tr: "anfusakum",     hint: "скрытно перед ف" },
  ],
  "idgham-shafawi": [
    { ar: "لَهُم مِّن",         tr: "lahum-min",     hint: "мим + мим — слияние" },
    { ar: "هُم مُّتَّقُونَ",      tr: "hum-muttaqūn",  hint: "сомкнутые губы 2 счёта" },
    { ar: "كَم مِّن",           tr: "kam-min",       hint: "сколько из…" },
    { ar: "أَنفُسَكُم مَّعَكُمْ", tr: "anfusakum-maʿakum", hint: "слитное произношение" },
    { ar: "إِنَّهُم مَّعَكُمْ",    tr: "innahum-maʿakum",  hint: "сомкнутые губы" },
  ],
  "ikhfa-shafawi": [
    { ar: "تَرْمِيهِم بِحِجَارَةٍ", tr: "tarmīhim bi-ḥijārah", hint: "Аль-Филь — мим перед ب" },
    { ar: "هُم بِهِ",            tr: "hum bi-hī",     hint: "при сомкнутых губах" },
    { ar: "وَمَا هُم بِخَارِجِينَ", tr: "wa-mā hum bi-khārijīn", hint: "не выходящие" },
    { ar: "رَبَّهُم بِهِمْ",       tr: "rabbahum bi-him", hint: "из суры Курайш" },
    { ar: "أَنْعَمْتَهُم بِهِ",    tr: "anʿamtahum bi-hī", hint: "сомкнутые губы" },
  ],
  "izhar-shafawi": [
    { ar: "أَلَمْ تَرَ",          tr: "alam tara",     hint: "Аль-Филь — мим ясно перед ت" },
    { ar: "لَكُمْ دِينُكُمْ",     tr: "lakum dīnukum", hint: "Аль-Кафирун" },
    { ar: "هُمْ فِيهَا",         tr: "hum fīhā",      hint: "ясно перед ف" },
    { ar: "أَنْعَمْتَ عَلَيْهِمْ",   tr: "anʿamta ʿalayhim", hint: "Аль-Фатиха" },
    { ar: "هُمْ يَعْلَمُونَ",      tr: "hum yaʿlamūn",  hint: "перед ي — изхар шадид" },
  ],
  "idgham-mustaqil": [
    { ar: "ٱذْهَب بِّكِتَابِي",   tr: "idhhab bi-kitābī",  hint: "мутажанисайн — د→ب" },
    { ar: "بَل رَّفَعَهُ",         tr: "bar-rafaʿahu",  hint: "мутакарибайн — ل→ر" },
    { ar: "قَد دَّخَلُوا",         tr: "qad-dakhalū",   hint: "мутамасиляйн — د→د" },
    { ar: "إِذ ظَّلَمُوا",          tr: "idh-ẓalamū",    hint: "мутажанисайн — ذ→ظ" },
    { ar: "أَثْقَلَت دَّعَوَا",      tr: "athqalat-daʿawā", hint: "мутажанисайн — ت→د" },
  ],
  madd: [
    { ar: "قَالَ",              tr: "qāla",          hint: "мадд табии — 2 счёта" },
    { ar: "ٱلرَّحِيمِ",          tr: "ar-Raḥīm",      hint: "долгая «и»" },
    { ar: "نُورٌ",               tr: "nūr",           hint: "долгая «у»" },
    { ar: "جَآءَ",               tr: "jāʾa",          hint: "мадд ваджиб муттасиль — 4-5 счётов" },
    { ar: "ٱلضَّآلِّينَ",          tr: "aḍ-ḍāllīn",     hint: "мадд лязим — 6 счётов" },
  ],
  qalqalah: [
    { ar: "أَحَدٌ",              tr: "aḥad",          hint: "Аль-Ихляс — кубра в конце" },
    { ar: "ٱلْفَلَقِ",            tr: "al-falaq",      hint: "сугра в середине" },
    { ar: "يَدْعُونَ",            tr: "yadʿūn",        hint: "د с сукуном — сугра" },
    { ar: "قُتِلَ",               tr: "qutila",        hint: "ق в начале" },
    { ar: "ٱلصِّرَاطَ",            tr: "aṣ-ṣirāṭ",      hint: "ط на конце" },
  ],
};

export function findMuallimLesson(slugOrId: string): MuallimLesson | undefined {
  return MUALLIM_LESSONS.find((l) => l.slug === slugOrId || String(l.id) === slugOrId);
}

export function neighbourLessons(slug: string): { prev?: MuallimLesson; next?: MuallimLesson } {
  const idx = MUALLIM_LESSONS.findIndex((l) => l.slug === slug);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? MUALLIM_LESSONS[idx - 1] : undefined,
    next: idx < MUALLIM_LESSONS.length - 1 ? MUALLIM_LESSONS[idx + 1] : undefined,
  };
}

export const MUALLIM_SOURCE = {
  title: "Учим арабский. Учебное пособие по чтению Корана",
  author: "Аббясов Р.Р.",
  year: 2005,
  publisher: "Москва",
  editor: "имам Арслан Садриев",
  approved: "Совет муфтиев России",
  note: "Современная переработка классического «Мөгаллим Сани» Ахмадхади Максуди (1892).",
} as const;
