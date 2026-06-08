// Generates lib/data/famous-verses.ts from the translation corpora
// already in the repo. Run on demand when the verse list changes.
//
//   node scripts/generate-famous-verses.mjs

import { readFileSync, writeFileSync } from 'node:fs';

// 6 verses chosen for the home carousel — short, well-known, hopeful.
// 13:28 leads the rotation: it sets the emotional tone we want first-time
// visitors to land on (hearts at rest in the remembrance of Allah).
const VERSES = [
  { surah: 13, ayah: 28  }, // поминанием Аллаха покой сердца — ОТКРЫВАЕТ
  { surah: 94, ayah: 5   }, // с тягостью — облегчение
  { surah: 2,  ayah: 152 }, // поминайте Меня
  { surah: 65, ayah: 3   }, // кто уповает — тому достаточно
  { surah: 39, ayah: 53  }, // не отчаивайтесь в милости
  { surah: 2,  ayah: 286 }, // не возлагает на душу — длинный, идёт последним
];

// Surah names per locale. Hard-coded for the 5 surahs we touch.
const SURAH_NAMES = {
  2:  { ru: 'Корова',     en: 'The Cow',     ar: 'البقرة',  fa: 'بقره',  tg: 'Бақара',  uz: 'Baqara',  kk: 'Бақара',  ky: 'Бакара', ur: 'البقرة',   ms: 'Al-Baqarah', hi: 'अल-बक़रह',  id: 'Al-Baqarah'  },
  94: { ru: 'Раскрытие',  en: 'The Relief',  ar: 'الشرح',   fa: 'شرح',   tg: 'Шарҳ',    uz: 'Sharh',   kk: 'Шарх',    ky: 'Шарх',   ur: 'الشرح',    ms: 'Asy-Syarh',  hi: 'अश-शरह',    id: 'Asy-Syarh'   },
  13: { ru: 'Гром',       en: 'The Thunder', ar: 'الرعد',   fa: 'رعد',   tg: 'Раъд',    uz: 'Raʼd',    kk: 'Раъд',    ky: 'Рад',    ur: 'الرعد',    ms: 'Ar-Ra’d',    hi: 'अर-रअद',    id: 'Ar-Ra’d'     },
  65: { ru: 'Развод',     en: 'Divorce',     ar: 'الطلاق',  fa: 'طلاق',  tg: 'Талоқ',   uz: 'Taloq',   kk: 'Талаq',   ky: 'Талак',  ur: 'الطلاق',   ms: 'At-Talaq',   hi: 'अत-तलाक़',  id: 'At-Talaq'    },
  39: { ru: 'Толпы',      en: 'The Throngs', ar: 'الزمر',   fa: 'زمر',   tg: 'Зумар',   uz: 'Zumar',   kk: 'Зумар',   ky: 'Зумар',  ur: 'الزمر',    ms: 'Az-Zumar',   hi: 'अज़-ज़ुमर', id: 'Az-Zumar'    },
};

// Per-locale translation source + cite label shown under the verse.
const SOURCES = {
  ru: { file: 'lib/knowledge/translations/ru_elmirkuliev.json',  format: 'knowledge-quran', cite: 'ПЕРЕВОД Э. КУЛИЕВА' },
  en: { file: 'lib/knowledge/translations/en_sahih_international.json', format: 'knowledge-surahs', cite: 'SAHIH INTERNATIONAL' },
  // For AR locale the "translation" IS the Uthmani text — same file we
  // already use for the arabic field. Renders the verse twice (large
  // arabic + small arabic in quotes) which reads fine for native speakers.
  ar: { file: 'lib/knowledge/quran/uthmani.json',                format: 'knowledge-quran', cite: 'النص العثماني' },
  fa: { file: 'lib/knowledge/translations/fa_nasermakaremshi.json', format: 'knowledge-quran', cite: 'ترجمه مکارم شیرازی' },
  tg: { file: 'lib/quran/tanzil/ayati.json',                     format: 'tanzil-flat',     cite: 'ТАРҶУМАИ ОЯТӢ' },
  uz: { file: 'lib/knowledge/translations/uz_alauddinmansour.json', format: 'knowledge-quran', cite: 'ALOUDDIN MANSUR TARJIMASI' },
  kk: { file: 'lib/quran/tanzil/altay.json',                     format: 'tanzil-flat',     cite: 'ХАЛИФА АЛТАЙ АУДАРМАСЫ' },
  ky: { file: 'lib/quran/tanzil/mokhtasar-ky.json',              format: 'tanzil-flat',     cite: 'МУХТАСАР ТАФСИРИ' },
  ur: { file: 'lib/knowledge/translations/ur_junagarhi.json',    format: 'knowledge-quran', cite: 'ترجمہ جوناگڑھی' },
  ms: { file: 'lib/knowledge/translations/ms_abdullahmuhamma.json', format: 'knowledge-quran', cite: 'TERJEMAHAN BASMEIH' },
  hi: { file: 'lib/knowledge/translations/hi_suhelfarooqkhan.json', format: 'knowledge-quran', cite: 'अनुवाद सुहेल फ़ारूक़' },
  id: { file: 'lib/knowledge/translations/id_indonesianislam.json', format: 'knowledge-quran', cite: 'TERJEMAHAN KEMENAG' },
};

function loadKnowledgeQuran(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const map = new Map();
  for (const v of data.quran) map.set(`${v.chapter}:${v.verse}`, v.text);
  return map;
}
function loadKnowledgeSurahs(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const map = new Map();
  for (const s of data.data.surahs) {
    for (const a of s.ayahs) map.set(`${s.number}:${a.numberInSurah}`, a.text);
  }
  return map;
}
function loadTanzilFlat(path) {
  // Tanzil files ship with a UTF-8 BOM that JSON.parse rejects — strip it.
  const txt = readFileSync(path, 'utf8').replace(/^﻿/, '');
  return new Map(Object.entries(JSON.parse(txt)));
}
function loadByFormat(file, format) {
  switch (format) {
    case 'knowledge-quran': return loadKnowledgeQuran(file);
    case 'knowledge-surahs': return loadKnowledgeSurahs(file);
    case 'tanzil-flat': return loadTanzilFlat(file);
    default: throw new Error(`unknown format ${format}`);
  }
}

const ARABIC = loadKnowledgeQuran('lib/knowledge/quran/uthmani.json');
const LOC_MAPS = Object.fromEntries(
  Object.entries(SOURCES).map(([loc, s]) => [loc, loadByFormat(s.file, s.format)])
);

function quote(s) { return JSON.stringify(s); }
function indent(n, s) { return ' '.repeat(n) + s; }

const lines = [
  `// Auto-generated by scripts/generate-famous-verses.mjs — DO NOT EDIT BY HAND.`,
  `// Source verses: ${VERSES.map((v) => `${v.surah}:${v.ayah}`).join(', ')}.`,
  `// Translation sources per locale: see the SOURCES map in the generator.`,
  ``,
  `import type { Locale } from "@/i18n/routing";`,
  ``,
  `export interface FamousVerseLocalized {`,
  `  translation: string;`,
  `  /** Short surah name in this locale's script (e.g. "Корова", "The Cow"). */`,
  `  surah: string;`,
  `  /** Translator credit shown under the verse, ALL CAPS where the script supports it. */`,
  `  cite: string;`,
  `}`,
  ``,
  `export interface FamousVerse {`,
  `  surah: number;`,
  `  ayah: number;`,
  `  arabic: string;`,
  `  /** Pre-built audio URL (Quran.com CDN, Abdul-Basit Mujawwad). */`,
  `  audioUrl: string;`,
  `  byLocale: Record<Locale, FamousVerseLocalized>;`,
  `}`,
  ``,
  `export const FAMOUS_VERSES: FamousVerse[] = [`,
];

for (const v of VERSES) {
  const key = `${v.surah}:${v.ayah}`;
  const arabic = ARABIC.get(key);
  if (!arabic) throw new Error(`missing arabic for ${key}`);
  const six = String(v.surah).padStart(3, '0') + String(v.ayah).padStart(3, '0');
  const audioUrl = `https://verses.quran.com/AbdulBaset/Mujawwad/mp3/${six}.mp3`;
  lines.push(`  {`);
  lines.push(`    surah: ${v.surah},`);
  lines.push(`    ayah: ${v.ayah},`);
  lines.push(`    arabic: ${quote(arabic)},`);
  lines.push(`    audioUrl: ${quote(audioUrl)},`);
  lines.push(`    byLocale: {`);
  for (const loc of Object.keys(SOURCES)) {
    const t = LOC_MAPS[loc].get(key);
    if (!t) throw new Error(`missing translation for ${loc} ${key}`);
    const name = SURAH_NAMES[v.surah][loc];
    const cite = SOURCES[loc].cite;
    lines.push(indent(6, `${loc}: {`));
    lines.push(indent(8, `translation: ${quote(t)},`));
    lines.push(indent(8, `surah: ${quote(name)},`));
    lines.push(indent(8, `cite: ${quote(cite)},`));
    lines.push(indent(6, `},`));
  }
  lines.push(`    },`);
  lines.push(`  },`);
}

lines.push(`];`);
lines.push(``);

writeFileSync('lib/data/famous-verses.ts', lines.join('\n'), 'utf8');
console.log(`Wrote ${VERSES.length} verses × ${Object.keys(SOURCES).length} locales → lib/data/famous-verses.ts`);
