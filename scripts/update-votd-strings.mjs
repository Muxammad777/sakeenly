// Refresh the votd.* i18n bundle for the new carousel.
//
// Old keys (surah_tag / translation / cite / label="АЯТ ДНЯ · 18 МАЯ") were
// hard-coded for a single verse. The carousel renders surah/translation/cite
// from lib/data/famous-verses.ts directly, so we only need:
//   - label       — eyebrow ("АЯТ ДНЯ")
//   - surah_word  — "СУРА" / "SURAH" / etc., interpolated with the
//                   localised surah name from FAMOUS_VERSES
//   - play / bookmark / bookmarked / translate / share / copied /
//     open_reader / prev / next — aria-labels & tooltips
//
// We leave the old keys in place so anything else referencing them keeps
// working; just overwrite label and add the new keys.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UPDATES = {
  ru: {
    label: 'АЯТ ДНЯ',
    surah_word: 'СУРА',
    play: 'Слушать',
    bookmark: 'Сохранить',
    bookmarked: 'В закладках',
    translate: 'Открыть с переводом',
    share: 'Поделиться',
    copied: 'Скопировано',
    open_reader: 'Открыть в ридере',
    prev: 'Предыдущий аят',
    next: 'Следующий аят',
  },
  en: {
    label: 'VERSE OF THE DAY',
    surah_word: 'SURAH',
    play: 'Listen',
    bookmark: 'Save',
    bookmarked: 'Saved',
    translate: 'Open with translation',
    share: 'Share',
    copied: 'Copied',
    open_reader: 'Open in reader',
    prev: 'Previous verse',
    next: 'Next verse',
  },
  fa: {
    label: 'آیه روز',
    surah_word: 'سوره',
    play: 'گوش دادن',
    bookmark: 'ذخیره',
    bookmarked: 'ذخیره شد',
    translate: 'باز کردن با ترجمه',
    share: 'اشتراک‌گذاری',
    copied: 'کپی شد',
    open_reader: 'باز کردن در خواننده',
    prev: 'آیه قبلی',
    next: 'آیه بعدی',
  },
  tg: {
    label: 'ОЯТИ РӮЗ',
    surah_word: 'СУРА',
    play: 'Шунавед',
    bookmark: 'Захира кардан',
    bookmarked: 'Захира шуд',
    translate: 'Бо тарҷума кушоед',
    share: 'Мубодила',
    copied: 'Нусхабардорӣ шуд',
    open_reader: 'Дар хонанда кушоед',
    prev: 'Ояти пешина',
    next: 'Ояти оянда',
  },
  uz: {
    label: 'KUNNING OYATI',
    surah_word: 'SURA',
    play: 'Tinglash',
    bookmark: 'Saqlash',
    bookmarked: 'Saqlangan',
    translate: 'Tarjima bilan ochish',
    share: 'Ulashish',
    copied: 'Nusxalandi',
    open_reader: 'O‘qigichda ochish',
    prev: 'Oldingi oyat',
    next: 'Keyingi oyat',
  },
  kk: {
    label: 'КҮН АЯТЫ',
    surah_word: 'СҮРЕ',
    play: 'Тыңдау',
    bookmark: 'Сақтау',
    bookmarked: 'Сақталды',
    translate: 'Аудармамен ашу',
    share: 'Бөлісу',
    copied: 'Көшірілді',
    open_reader: 'Оқу режимінде ашу',
    prev: 'Алдыңғы аят',
    next: 'Келесі аят',
  },
  ky: {
    label: 'КҮНДҮН АЯТЫ',
    surah_word: 'СҮРӨ',
    play: 'Угуу',
    bookmark: 'Сактоо',
    bookmarked: 'Сакталды',
    translate: 'Котормо менен ачуу',
    share: 'Бөлүшүү',
    copied: 'Көчүрүлдү',
    open_reader: 'Окурманда ачуу',
    prev: 'Мурунку аят',
    next: 'Кийинки аят',
  },
  ur: {
    label: 'آیتِ روز',
    surah_word: 'سورۃ',
    play: 'سنیں',
    bookmark: 'محفوظ کریں',
    bookmarked: 'محفوظ ہے',
    translate: 'ترجمہ کے ساتھ کھولیں',
    share: 'شیئر کریں',
    copied: 'کاپی ہو گیا',
    open_reader: 'ریڈر میں کھولیں',
    prev: 'پچھلی آیت',
    next: 'اگلی آیت',
  },
  ms: {
    label: 'AYAT HARI INI',
    surah_word: 'SURAH',
    play: 'Dengar',
    bookmark: 'Simpan',
    bookmarked: 'Disimpan',
    translate: 'Buka dengan terjemahan',
    share: 'Kongsi',
    copied: 'Disalin',
    open_reader: 'Buka dalam pembaca',
    prev: 'Ayat sebelumnya',
    next: 'Ayat seterusnya',
  },
  hi: {
    label: 'आज की आयत',
    surah_word: 'सूरह',
    play: 'सुनें',
    bookmark: 'सहेजें',
    bookmarked: 'सहेजी गई',
    translate: 'अनुवाद के साथ खोलें',
    share: 'साझा करें',
    copied: 'कॉपी हुई',
    open_reader: 'रीडर में खोलें',
    prev: 'पिछली आयत',
    next: 'अगली आयत',
  },
  id: {
    label: 'AYAT HARI INI',
    surah_word: 'SURAH',
    play: 'Dengarkan',
    bookmark: 'Simpan',
    bookmarked: 'Tersimpan',
    translate: 'Buka dengan terjemahan',
    share: 'Bagikan',
    copied: 'Tersalin',
    open_reader: 'Buka di pembaca',
    prev: 'Ayat sebelumnya',
    next: 'Ayat berikutnya',
  },
};

const dir = 'messages';
for (const [loc, fields] of Object.entries(UPDATES)) {
  const path = join(dir, `${loc}.json`);
  const obj = JSON.parse(readFileSync(path, 'utf8'));
  if (!obj.votd) obj.votd = {};
  for (const [k, v] of Object.entries(fields)) obj.votd[k] = v;
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json (${Object.keys(fields).length} keys)`);
}
