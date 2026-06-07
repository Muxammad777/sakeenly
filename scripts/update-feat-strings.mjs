// Refresh the homepage "Что внутри" (feat.*) cards.
//
//   01 Reading  — was "Five translations" (we ship 24)
//   02 Listen   — was "27 more voices" (we ship 30 reciters)
//   03 Ask      — was "Coming soon" (Ask is live)
//
// Per-key string replacement so we preserve the file's existing key order
// and formatting — no full re-stringify.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UPDATES = {
  ru: {
    f1_b: 'KFGQPC Hafs шрифт. 24 перевода на 11 языках. Закладки, заметки, поиск по аяту, кнопка «в хифз» — всё одним тапом.',
    f2_b: 'Абдуль-Басит, Хусары, Минши, Судайс и ещё 26 голосов. Скорость, повтор аята, автопрокрутка по чтению.',
    f3_l2: 'Спросить сейчас →',
  },
  en: {
    f1_b: 'KFGQPC Hafs script. 24 translations across 11 languages. Bookmarks, notes, in-ayah search, send-to-hifz — all one tap away.',
    f2_b: 'Abdul-Basit, al-Husary, al-Minshawi, as-Sudais and twenty-six more. Speed, ayah loop, auto-scroll with the recitation.',
    f3_l2: 'Ask now →',
  },
  fa: {
    f1_b: 'قلم KFGQPC حفص. ۲۴ ترجمه به ۱۱ زبان. نشانک، یادداشت، جست‌وجو در آیه، ارسال به حفظ — همه با یک ضربه.',
    f2_b: 'عبدالباسط، حصری، منشاوی، السدیس و ۲۶ قاری دیگر. سرعت، تکرار آیه، اسکرول خودکار همراه با قرائت.',
    f3_l2: 'همین حالا بپرس ←',
  },
  tg: {
    f1_b: 'Хатти KFGQPC Ҳафс. 24 тарҷума ба 11 забон. Аломатгузорӣ, ёддошт, ҷустуҷӯ дар оят, гузариш ба ҳифз — ҳама бо як зер.',
    f2_b: 'Абдулбосит, Ҳусарӣ, Миншавӣ, Судайс ва боз 26 қорӣ. Суръат, такрори оят, лағжиши худкор дар вақти тиловат.',
    f3_l2: 'Ҳозир бипурс ←',
  },
  uz: {
    f1_b: 'KFGQPC Hafs shrifti. 11 tilda 24 tarjima. Xatchoʻplar, izohlar, oyat ichida qidiruv, hifzga oʻtish — barchasi bir tegishda.',
    f2_b: 'Abdulbosit, Husariy, Minshoviy, Sudays va yana 26 qori. Tezlik, oyatni takrorlash, tilovat ortidan avtomatik aylantirish.',
    f3_l2: 'Hozir soʻrash ←',
  },
  kk: {
    f1_b: 'KFGQPC Хафс қарпі. 11 тілде 24 аударма. Бетбелгілер, ескертпелер, аят ішінен іздеу, хифзға өту — бәрі бір түртумен.',
    f2_b: 'Әбдулбасит, Хусари, Миншави, Судайс және тағы 26 қари. Жылдамдық, аятты қайталау, қираатпен бірге автопрокрутка.',
    f3_l2: 'Қазір сұрау ←',
  },
  ky: {
    f1_b: 'KFGQPC Хафс ариби. 11 тилде 24 котормо. Закладка, эскертүү, аят ичинен издөө, хифзга өтүү — баары бир басуу менен.',
    f2_b: 'Абдулбасит, Хусари, Миншави, Судайс жана дагы 26 кары. Ылдамдык, аятты кайталоо, кыраат менен авто-сыдыргы.',
    f3_l2: 'Азыр суроо ←',
  },
  ur: {
    f1_b: 'KFGQPC حفص رسم۔ گیارہ زبانوں میں چوبیس تراجم۔ بک مارکس، نوٹس، آیت میں تلاش، حفظ پر بھیجیں — سب ایک ٹیپ پر۔',
    f2_b: 'عبد الباسط، الحصری، المنشاوی، السدیس اور مزید چھبیس قاری۔ رفتار، آیت کا اعادہ، تلاوت کے ساتھ خودکار اسکرول۔',
    f3_l2: 'ابھی پوچھیں ←',
  },
  ms: {
    f1_b: 'Tulisan KFGQPC Hafs. 24 terjemahan dalam 11 bahasa. Penanda, nota, carian dalam ayat, hantar ke hifz — semuanya satu ketuk.',
    f2_b: 'Abdul-Basit, al-Husary, al-Minshawi, as-Sudais dan 26 lagi. Kelajuan, ulangan ayat, auto-tatal mengikut bacaan.',
    f3_l2: 'Tanya sekarang →',
  },
  hi: {
    f1_b: 'KFGQPC हफ़्स लिपि। 11 भाषाओं में 24 अनुवाद। बुकमार्क, नोट्स, आयत में खोज, हिफ़्ज़ पर भेजें — सब एक टैप पर।',
    f2_b: 'अब्दुल-बासित, अल-हुसरी, अल-मिनशावी, अस-सुदैस और 26 और क़ारी। गति, आयत दोहराव, क़िरात के साथ ऑटो-स्क्रॉल।',
    f3_l2: 'अभी पूछें →',
  },
  id: {
    f1_b: 'Tulisan KFGQPC Hafs. 24 terjemahan dalam 11 bahasa. Penanda, catatan, pencarian dalam ayat, kirim ke hifz — semuanya satu ketuk.',
    f2_b: 'Abdul-Basit, al-Husary, al-Minshawi, as-Sudais dan 26 lainnya. Kecepatan, ulang ayat, auto-scroll mengikuti bacaan.',
    f3_l2: 'Tanya sekarang →',
  },
};

function jsonStr(s) {
  // Same escaping as JSON.stringify but without the outer quotes — used
  // inline into our string-template replacement.
  return JSON.stringify(s);
}

const dir = 'messages';
for (const [loc, fields] of Object.entries(UPDATES)) {
  const path = join(dir, `${loc}.json`);
  let src = readFileSync(path, 'utf8');
  let changed = 0;
  for (const [k, v] of Object.entries(fields)) {
    // Match exactly one "<key>": "...whatever..." inside the "feat" namespace.
    // The keys f1_b/f2_b/f3_l2 are unique across the file, so global match is safe.
    const re = new RegExp(`("${k}"\\s*:\\s*)"[^"]*"`, 'g');
    const before = src;
    src = src.replace(re, `$1${jsonStr(v)}`);
    if (src !== before) changed++;
    else console.warn(`  ${loc}.${k} — pattern not matched`);
  }
  writeFileSync(path, src, 'utf8');
  console.log(`Updated ${loc}.json (${changed}/3 keys)`);
}
