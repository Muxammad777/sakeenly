// Strip the localised "Prophet" prefix and trailing salutations from every
// byLocale.<locale>.name in prophet-stories.ts.
//
// The /kids/stories index already prefixes each name with the locale-
// appropriate "Prophet" word (PROPHET_PREFIX map in page.tsx) and the
// suffix tag is rendered separately from story.suffix. The 16 freshly-
// authored prophets shipped their names like "Пророк Худ" or "Prophet Hud,
// peace be upon him" — duplicating both. Strip both ends in place.

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'lib/data/prophet-stories.ts';

const PREFIXES = [
  /^Пророк\s+/,
  /^Prophet\s+/,
  /^Nabi\s+/,
  /^Payg[''']?ambar\s+/,
  /^Пайғамбар\s+/,
  /^Пайгамбар\s+/,
  /^Паёмбар\s+/,                   // tg
  /^Пайамбар\s+/,                  // kk variant
  /^Пайгамбер\s+/,                 // kz spelling drift
  /^حضرت\s+/,
  /^हज़रत\s+/,
  /^हजरत\s+/,
];

// Some locales place the word "prophet" AFTER the name ("Худ пайгамбар",
// "Hud payg'ambar"). Strip those as well.
const POSTPOSED_TITLE = [
  /\s+payg[''']?ambar\b\.?$/i,
  /\s+пайғамбар\.?$/i,
  /\s+пайгамбар\.?$/i,
  /\s+паёмбар\.?$/i,
  /\s+пайамбар\.?$/i,
  /\s+nabi\.?$/i,
];

const SUFFIXES = [
  /[,;]?\s*мир ему\.?$/i,
  /[,;]?\s*peace be upon him\.?$/i,
  /[,;]?\s*alaihissalom\.?$/i,
  /[,;]?\s*alaihissalam\.?$/i,
  /[,;]?\s*alayhissalom\.?$/i,
  /[,;]?\s*alayhissalam\.?$/i,
  /[,;]?\s*алайҳиссалом\.?$/i,
  /[,;]?\s*алейҳиссалом\.?$/i,
  /[,;]?\s*алейһиссәләм\.?$/i,
  /[,;]?\s*аллейхи салам\.?$/i,
  /[,;]?\s*салляллоҳу[^"]*саллам\.?$/i,
  /[,;]?\s*sallallahu\s+'?alaihi\s+wasallam\.?$/i,
  /[,;]?\s*shallallahu\s+'?alaihi\s+wasallam\.?$/i,
  /[,;]?\s*sollallohu\s+alayhi\s+va\s+sallam\.?$/i,
  /[,;]?\s*салләллаһу\s+алейһи\s+ва\s+сәлләм\.?$/i,
  /[,;]?\s*саллаллаху\s+алейхи\s+ва\s+саллам\.?$/i,
  /[,;]?\s*саллаллоҳу\s+алайҳи\s+ва\s+саллам\.?$/i,
  /[,;]?\s*صلى\s*الله\s*عليه\s*وسلم\.?$/,
  /[,;]?\s*ﷺ\.?$/,
  /[,;]?\s*да благословит его Аллах и приветствует\.?$/i,
  /[,;]?\s*عليه السلام\.?$/,
  // Kazakh / Kyrgyz greeting variants ("may peace be upon him")
  /[,;]?\s*оған сәлем болсын\.?$/i,
  /[,;]?\s*оған салауат болсын\.?$/i,
  /[,;]?\s*ага салам болсун\.?$/i,
  /[,;]?\s*алейхис салам\.?$/i,
];

function strip(name) {
  let s = name;
  // Repeatedly strip — some entries had both prefix and suffix.
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of PREFIXES) {
      const next = s.replace(re, '');
      if (next !== s) { s = next; changed = true; }
    }
    for (const re of POSTPOSED_TITLE) {
      const next = s.replace(re, '');
      if (next !== s) { s = next; changed = true; }
    }
    for (const re of SUFFIXES) {
      const next = s.replace(re, '');
      if (next !== s) { s = next; changed = true; }
    }
  }
  return s.trim();
}

let src = readFileSync(PATH, 'utf8');
let touched = 0;

// Replace every name: "…" string literal in the file. The 9 original
// prophets already had clean names like "Адам" — strip() is a no-op for
// those — so we don't need to scope to specific slugs.
src = src.replace(/(name:\s*)"((?:[^"\\]|\\.)*)"/g, (m, lead, raw) => {
  // raw still has JS escape sequences; cheap path: JSON.parse to unescape.
  const decoded = JSON.parse(`"${raw}"`);
  const stripped = strip(decoded);
  if (stripped === decoded) return m;
  touched++;
  return `${lead}${JSON.stringify(stripped)}`;
});

writeFileSync(PATH, src, 'utf8');
console.log(`Stripped prefix/suffix from ${touched} name fields in ${PATH}`);
