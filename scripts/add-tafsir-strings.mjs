// Add tafsir-related i18n keys to the "rd" namespace across all 11 locales.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UPDATES = {
  ru: { tafsir_label: 'Тафсир', tafsir_title: 'Толкование аята',     tafsir_ibn_kathir: 'Ибн Касир', tafsir_saddi: 'Ас-Саади', tafsir_loading: 'Загрузка тафсира…',     tafsir_unavailable: 'Тафсир для этого аята недоступен.' },
  en: { tafsir_label: 'Tafsir', tafsir_title: 'Verse commentary',     tafsir_ibn_kathir: 'Ibn Kathir', tafsir_saddi: 'As-Saadi',  tafsir_loading: 'Loading tafsir…',         tafsir_unavailable: 'No tafsir available for this verse.' },
  fa: { tafsir_label: 'تفسیر', tafsir_title: 'تفسیر آیه',             tafsir_ibn_kathir: 'ابن کثیر', tafsir_saddi: 'السعدی',    tafsir_loading: 'در حال بارگیری تفسیر…',   tafsir_unavailable: 'تفسیری برای این آیه در دسترس نیست.' },
  tg: { tafsir_label: 'Тафсир', tafsir_title: 'Тафсири оят',          tafsir_ibn_kathir: 'Ибни Касир', tafsir_saddi: 'Ас-Саадӣ', tafsir_loading: 'Боргузории тафсир…',     tafsir_unavailable: 'Тафсир барои ин оят дастрас нест.' },
  uz: { tafsir_label: 'Tafsir', tafsir_title: 'Oyat tafsiri',          tafsir_ibn_kathir: 'Ibn Kasir', tafsir_saddi: 'Sa\'diy',  tafsir_loading: 'Tafsir yuklanmoqda…',      tafsir_unavailable: 'Bu oyat uchun tafsir mavjud emas.' },
  kk: { tafsir_label: 'Тәпсір', tafsir_title: 'Аят тәпсірі',           tafsir_ibn_kathir: 'Ибн Кәсір', tafsir_saddi: 'Сағди',    tafsir_loading: 'Тәпсір жүктелуде…',        tafsir_unavailable: 'Бұл аят үшін тәпсір қолжетімсіз.' },
  ky: { tafsir_label: 'Тафсир', tafsir_title: 'Аят тафсири',           tafsir_ibn_kathir: 'Ибн Касир', tafsir_saddi: 'Сагди',    tafsir_loading: 'Тафсир жүктөлүүдө…',       tafsir_unavailable: 'Бул аят үчүн тафсир жок.' },
  ur: { tafsir_label: 'تفسیر', tafsir_title: 'آیت کی تفسیر',           tafsir_ibn_kathir: 'ابن کثیر', tafsir_saddi: 'السعدی',    tafsir_loading: 'تفسیر لوڈ ہو رہی ہے…',     tafsir_unavailable: 'اس آیت کی تفسیر دستیاب نہیں۔' },
  ms: { tafsir_label: 'Tafsir', tafsir_title: 'Tafsir ayat',           tafsir_ibn_kathir: 'Ibn Kathir', tafsir_saddi: 'As-Sa\'di', tafsir_loading: 'Memuatkan tafsir…',       tafsir_unavailable: 'Tafsir tidak tersedia untuk ayat ini.' },
  hi: { tafsir_label: 'तफ़सीर', tafsir_title: 'आयत की तफ़सीर',         tafsir_ibn_kathir: 'इब्न कसीर', tafsir_saddi: 'अस-सादी',  tafsir_loading: 'तफ़सीर लोड हो रही है…',   tafsir_unavailable: 'इस आयत के लिए तफ़सीर उपलब्ध नहीं है।' },
  id: { tafsir_label: 'Tafsir', tafsir_title: 'Tafsir ayat',           tafsir_ibn_kathir: 'Ibn Katsir', tafsir_saddi: 'As-Sa\'di', tafsir_loading: 'Memuat tafsir…',          tafsir_unavailable: 'Tafsir untuk ayat ini tidak tersedia.' },
};

const dir = 'messages';
for (const [loc, fields] of Object.entries(UPDATES)) {
  const path = join(dir, `${loc}.json`);
  const obj = JSON.parse(readFileSync(path, 'utf8'));
  if (!obj.rd) obj.rd = {};
  for (const [k, v] of Object.entries(fields)) obj.rd[k] = v;
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json`);
}
