// Update the kst.more string in every locale now that all 25 prophets
// are authored — replace the "+ 16 more" tease with a confirmation line.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES = [
  ['ru.json', 'Все 25 пророков, упомянутые в Коране.'],
  ['en.json', 'All 25 prophets named in the Qur’an.'],
  ['fa.json', '‏هر ۲۵ پیامبر نام‌برده در قرآن.'],
  ['tg.json', 'Ҳамаи 25 пайғамбари дар Қуръон номбаршуда.'],
  ['uz.json', 'Qur’onda nomi tilga olingan barcha 25 paygʻambar.'],
  ['kk.json', 'Құранда аты аталған барлық 25 пайғамбар.'],
  ['ky.json', 'Куранда айтылган бардык 25 пайгамбар.'],
  ['ur.json', '‏قرآن میں نامزد تمام ۲۵ انبیاء۔'],
  ['ms.json', 'Semua 25 nabi yang dinamakan dalam al-Qur’an.'],
  ['hi.json', 'क़ुरआन में नामित सभी 25 पैगंबर।'],
  ['id.json', 'Semua 25 nabi yang disebut dalam Al-Qur’an.'],
];

const dir = 'messages';
for (const [file, text] of MESSAGES) {
  const path = join(dir, file);
  const src = readFileSync(path, 'utf8');
  // Replace only the line 492 "more" inside the "kst" namespace block.
  // Match the pattern: the line that contains "more" + "пророк/prophet/nabi/etc"
  // — too brittle. Use the actual unique +-prefix as a marker.
  const replaced = src.replace(
    /"more":\s*"\+\s*[^"]*"/,
    `"more": ${JSON.stringify(text)}`,
  );
  if (replaced === src) {
    console.warn(`No change in ${file} — pattern not matched`);
    continue;
  }
  writeFileSync(path, replaced, 'utf8');
  console.log(`Updated ${file}`);
}
