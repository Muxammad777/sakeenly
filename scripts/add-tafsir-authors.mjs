// Add tafsir_jalalayn + tafsir_muyassar keys across all 11 locales.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const JALALAYN = {
  ru: 'Аль-Джалалейн', en: 'Al-Jalalayn', fa: 'الجلالین', tg: 'Ал-Ҷалолайн',
  uz: 'Al-Jalolayn',  kk: 'Әл-Жалалайн', ky: 'Ал-Жалалайн', ur: 'الجلالین',
  ms: 'Al-Jalalain',  hi: 'अल-जलालैन', id: 'Al-Jalalain',
};

const MUYASSAR = {
  ru: 'Аль-Муяссар', en: 'Al-Muyassar', fa: 'المیسر', tg: 'Ал-Муяссар',
  uz: 'Al-Muyassar', kk: 'Әл-Муяссар',  ky: 'Ал-Муяссар', ur: 'المیسر',
  ms: 'Al-Muyassar', hi: 'अल-मुयस्सर', id: 'Al-Muyassar',
};

const dir = 'messages';
for (const loc of Object.keys(JALALAYN)) {
  const path = join(dir, `${loc}.json`);
  const obj = JSON.parse(readFileSync(path, 'utf8'));
  if (!obj.rd) obj.rd = {};
  obj.rd.tafsir_jalalayn = JALALAYN[loc];
  obj.rd.tafsir_muyassar = MUYASSAR[loc];
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`Updated ${loc}.json`);
}
