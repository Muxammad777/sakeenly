// Add the new dynamic i18n keys the HomeStreakBand needs in every locale.
//
//   streak.title_empty   — shown when current streak = 0
//   streak.title_n       — template: "{n} days with the Qur'an"
//   cont.start_empty     — surah-slot placeholder when there's no bookmark yet
//   cont.surah_prefix    — "Сура" / "Surah" / "سوره" / …
//   cont.ayah_of_n       — template: "ayah {a} of {t}"
//   cont.signin_cta      — guest-state CTA on the continue card
//
// We leave the original streak.title and cont.surah/ayah_of keys in place
// so nothing else that imports them breaks.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UPDATES = {
  ru: {
    streak: { title_empty: 'Начни свой путь', title_n: '{n} дней с Кораном' },
    cont:   { start_empty: 'Начни с Аль-Фатихи', surah_prefix: 'Сура', ayah_of_n: 'аят {a} из {t}', signin_cta: 'Войти, чтобы продолжить' },
  },
  en: {
    streak: { title_empty: 'Start your journey', title_n: '{n} days with the Qur’an' },
    cont:   { start_empty: 'Begin with Al-Fatiha', surah_prefix: 'Surah', ayah_of_n: 'ayah {a} of {t}', signin_cta: 'Sign in to continue' },
  },
  fa: {
    streak: { title_empty: 'سفر خود را آغاز کن', title_n: '{n} روز با قرآن' },
    cont:   { start_empty: 'با سوره فاتحه آغاز کن', surah_prefix: 'سوره', ayah_of_n: 'آیه {a} از {t}', signin_cta: 'برای ادامه وارد شوید' },
  },
  tg: {
    streak: { title_empty: 'Сафари худро оғоз кун', title_n: '{n} рӯз бо Қуръон' },
    cont:   { start_empty: 'Аз Фотиҳа оғоз кун', surah_prefix: 'Сура', ayah_of_n: 'ояти {a} аз {t}', signin_cta: 'Барои идома ворид шавед' },
  },
  uz: {
    streak: { title_empty: 'Yo‘lingni boshla', title_n: 'Qur’on bilan {n} kun' },
    cont:   { start_empty: 'Fotihadan boshla', surah_prefix: 'Sura', ayah_of_n: '{t} oyatdan {a}-si', signin_cta: 'Davom etish uchun kiring' },
  },
  kk: {
    streak: { title_empty: 'Жолыңды баста', title_n: 'Құранмен {n} күн' },
    cont:   { start_empty: 'Фатихадан баста', surah_prefix: 'Сүре', ayah_of_n: '{t} аяттан {a}-нші', signin_cta: 'Жалғастыру үшін кіріңіз' },
  },
  ky: {
    streak: { title_empty: 'Жолуңду башта', title_n: 'Куран менен {n} күн' },
    cont:   { start_empty: 'Фатихадан башта', surah_prefix: 'Сүрө', ayah_of_n: '{t} аяттан {a}', signin_cta: 'Улантуу үчүн кириңиз' },
  },
  ur: {
    streak: { title_empty: 'سفر شروع کریں', title_n: 'قرآن کے ساتھ {n} دن' },
    cont:   { start_empty: 'سورۃ الفاتحہ سے شروع کریں', surah_prefix: 'سورۃ', ayah_of_n: '{t} میں سے آیت {a}', signin_cta: 'جاری رکھنے کے لیے سائن ان کریں' },
  },
  ms: {
    streak: { title_empty: 'Mulakan perjalananmu', title_n: '{n} hari bersama al-Qur’an' },
    cont:   { start_empty: 'Mula dengan Al-Fatihah', surah_prefix: 'Surah', ayah_of_n: 'ayat {a} dari {t}', signin_cta: 'Log masuk untuk teruskan' },
  },
  hi: {
    streak: { title_empty: 'अपनी यात्रा शुरू करें', title_n: 'क़ुरआन के साथ {n} दिन' },
    cont:   { start_empty: 'अल-फ़ातिहा से शुरू करें', surah_prefix: 'सूरह', ayah_of_n: '{t} में से आयत {a}', signin_cta: 'जारी रखने के लिए साइन इन करें' },
  },
  id: {
    streak: { title_empty: 'Mulai perjalananmu', title_n: '{n} hari bersama Al-Qur’an' },
    cont:   { start_empty: 'Mulai dengan Al-Fatihah', surah_prefix: 'Surah', ayah_of_n: 'ayat {a} dari {t}', signin_cta: 'Masuk untuk melanjutkan' },
  },
};

const dir = 'messages';
for (const [loc, ns] of Object.entries(UPDATES)) {
  const path = join(dir, `${loc}.json`);
  const obj = JSON.parse(readFileSync(path, 'utf8'));
  for (const [namespace, fields] of Object.entries(ns)) {
    if (!obj[namespace]) obj[namespace] = {};
    for (const [k, v] of Object.entries(fields)) obj[namespace][k] = v;
  }
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json`);
}
