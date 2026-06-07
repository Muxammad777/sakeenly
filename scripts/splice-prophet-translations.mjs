// Take the translation workflow output, combine each prophet's RU master
// with its 10 translated locales, and replace the stub blocks (RU-only)
// currently in lib/data/prophet-stories.ts.
//
// Args: <translation-output.json> <ru-master.json> <prophet-stories.ts>

import { readFileSync, writeFileSync } from 'node:fs';

const [, , translationPath, ruPath, targetPath] = process.argv;
if (!translationPath || !ruPath || !targetPath) {
  console.error('Usage: node splice-prophet-translations.mjs <translation-output> <ru-master> <prophet-stories.ts>');
  process.exit(1);
}

const translation = JSON.parse(readFileSync(translationPath, 'utf8')).result;
const ruMaster = JSON.parse(readFileSync(ruPath, 'utf8')); // [{slug, nameAr, ru: {...}}]

const SUFFIX_FOR = (slug) => slug === 'muhammad' ? 'ﷺ' : 'عليه السلام';
const READING_MIN = {
  idris: 3, hud: 6, salih: 6, lut: 6, ismail: 5, ishaq: 4, yaqub: 5,
  shuayb: 5, harun: 5, dhulkifl: 3, dawud: 6, ilyas: 4, alyasa: 3,
  zakariya: 4, yahya: 4, muhammad: 8,
};
const NAME_AR_FOR = Object.fromEntries(ruMaster.map((m) => [m.slug, m.nameAr]));

// Build a map slug → full byLocale object (ru + 10 translations).
const byProphet = new Map();
for (const m of ruMaster) {
  byProphet.set(m.slug, { ru: m.ru });
}
for (const t of translation) {
  const entry = byProphet.get(t.slug);
  if (!entry) continue;
  for (const [loc, content] of Object.entries(t.byLocale)) {
    entry[loc] = content;
  }
}

function quote(s) { return JSON.stringify(s); }
function indent(n, s) { return ' '.repeat(n) + s; }

function renderLocalized(loc, content, indentBase) {
  const i = indentBase;
  return [
    indent(i, `${loc}: {`),
    indent(i + 2, `name: ${quote(content.name)},`),
    indent(i + 2, `theme: ${quote(content.theme)},`),
    indent(i + 2, `paragraphs: [`),
    ...content.paragraphs.map((p) => indent(i + 4, quote(p) + ',')),
    indent(i + 2, `],`),
    indent(i + 2, `lesson: ${quote(content.lesson)},`),
    indent(i + 2, `sources: [`),
    ...content.sources.map((s) => indent(i + 4, quote(s) + ',')),
    indent(i + 2, `],`),
    indent(i, `},`),
  ].join('\n');
}

// Locale order matches messages/*.json — RU master first, then translations.
const LOCALE_ORDER = ['ru', 'en', 'fa', 'tg', 'uz', 'kk', 'ky', 'ur', 'ms', 'hi', 'id'];

function renderProphetBlock(slug) {
  const entry = byProphet.get(slug);
  const nameAr = NAME_AR_FOR[slug];
  const suffix = SUFFIX_FOR(slug);
  const min = READING_MIN[slug];

  const locales = LOCALE_ORDER.filter((l) => entry[l]).map((l) =>
    renderLocalized(l, entry[l], 6)
  );

  return [
    `  // ─────────────────────────────────────────────────────────────────────`,
    `  {`,
    `    slug: ${quote(slug)},`,
    `    nameAr: ${quote(nameAr)},`,
    `    suffix: ${quote(suffix)},`,
    `    readingMin: ${min},`,
    `    byLocale: {`,
    ...locales.map((s) => s),
    `    },`,
    `  },`,
  ].join('\n');
}

let src = readFileSync(targetPath, 'utf8');

// Remove existing stub blocks for the 16 new prophets. Stub markers were
// inserted with a "// ───" comment line. We find each `slug: "<slug>"` and
// walk backwards to the comment line, forward to the closing `  },\n`.
const SLUGS = ruMaster.map((m) => m.slug);

for (const slug of SLUGS) {
  const slugMarker = `slug: "${slug}"`;
  const sIdx = src.indexOf(slugMarker);
  if (sIdx === -1) {
    console.warn(`Slug ${slug} not found in target — skipping`);
    continue;
  }
  // Walk back to preceding "// ───" line start.
  const beforeSlug = src.lastIndexOf('\n  // ', sIdx);
  const blockStart = beforeSlug === -1 ? sIdx : beforeSlug + 1;
  // Walk forward: find the matching "},\n" that is followed by either
  // another "// ───" comment or "];" (end of array).
  let i = sIdx;
  while (i < src.length) {
    const nextClose = src.indexOf('\n  },\n', i);
    if (nextClose === -1) { console.error(`Could not find end of block for ${slug}`); process.exit(2); }
    const after = src.slice(nextClose + '\n  },\n'.length, nextClose + '\n  },\n'.length + 8);
    // After a top-level entry close, next chars are either "  // " or "];"
    if (after.startsWith('  // ') || after.startsWith('];') || after.startsWith('] ')) {
      // Found the real end of this prophet's top-level entry.
      const blockEnd = nextClose + '\n  },\n'.length;
      src = src.slice(0, blockStart) + src.slice(blockEnd);
      break;
    }
    i = nextClose + 1;
  }
}

// Now insert refreshed blocks before the closing "];".
const closing = '\n];\n';
const idx = src.lastIndexOf(closing);
if (idx === -1) { console.error('Could not find PROPHET_STORIES closing "];"'); process.exit(2); }

const blocks = SLUGS.map(renderProphetBlock).join('\n') + '\n';
const out = src.slice(0, idx) + '\n' + blocks + src.slice(idx);

writeFileSync(targetPath, out, 'utf8');
console.log(`Spliced ${SLUGS.length} fully-translated prophet blocks into ${targetPath}`);
