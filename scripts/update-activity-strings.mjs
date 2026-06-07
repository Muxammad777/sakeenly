import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UPDATES = {
  ru: { readers: 'Сейчас в Sakeenly: {n} читающих', hifz: 'Вместе выучено: {n} аятов', bookmarks: 'Сохранено: {n} аятов в закладках' },
  en: { readers: 'Now in Sakeenly: {n} readers', hifz: 'Memorised together: {n} ayat', bookmarks: 'Saved: {n} bookmarked verses' },
  fa: { readers: 'هم اکنون در سکینلی: {n} خواننده', hifz: 'حفظ شده با هم: {n} آیه', bookmarks: 'ذخیره شده: {n} آیه' },
  tg: { readers: 'Ҳозир дар Sakeenly: {n} хонанда', hifz: 'Дар якҷоягӣ ҳифз шуд: {n} оят', bookmarks: 'Захира шуд: {n} оят' },
  uz: { readers: 'Hozir Sakeenly’da: {n} oʻquvchi', hifz: 'Birga yodlandi: {n} oyat', bookmarks: 'Saqlangan: {n} oyat' },
  kk: { readers: 'Қазір Sakeenly-де: {n} оқырман', hifz: 'Бірге жатталды: {n} аят', bookmarks: 'Сақталды: {n} аят' },
  ky: { readers: 'Азыр Sakeenly’де: {n} окурман', hifz: 'Чогуу жатталды: {n} аят', bookmarks: 'Сакталды: {n} аят' },
  ur: { readers: 'ابھی سکینلی میں: {n} قارئین', hifz: 'مل کر یاد کیا: {n} آیات', bookmarks: 'محفوظ شدہ: {n} آیات' },
  ms: { readers: 'Sekarang di Sakeenly: {n} pembaca', hifz: 'Dihafal bersama: {n} ayat', bookmarks: 'Disimpan: {n} ayat' },
  hi: { readers: 'अभी Sakeenly पर: {n} पाठक', hifz: 'मिलकर याद किए: {n} आयतें', bookmarks: 'सहेजी गई: {n} आयतें' },
  id: { readers: 'Sekarang di Sakeenly: {n} pembaca', hifz: 'Dihafal bersama: {n} ayat', bookmarks: 'Tersimpan: {n} ayat' },
};

const dir = 'messages';
for (const [loc, fields] of Object.entries(UPDATES)) {
  const path = join(dir, `${loc}.json`);
  const obj = JSON.parse(readFileSync(path, 'utf8'));
  if (!obj.activity) obj.activity = {};
  for (const [k, v] of Object.entries(fields)) obj.activity[k] = v;
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json`);
}
