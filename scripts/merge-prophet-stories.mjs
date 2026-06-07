// One-shot integration script — parses the workflow output JSON and emits
// the TS array literal for 16 new prophet stories so we can splice them
// into lib/data/prophet-stories.ts without hand-typing 40k characters.

import { readFileSync, writeFileSync } from 'node:fs';

const OUTPUT_PATH = process.argv[2];
const TARGET_PATH = process.argv[3];
if (!OUTPUT_PATH || !TARGET_PATH) {
  console.error('Usage: node merge-prophet-stories.mjs <workflow-output.json> <prophet-stories.ts>');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
const stories = raw.result;
if (!Array.isArray(stories)) {
  console.error('Expected workflow result to be an array');
  process.exit(1);
}

// Muhammad ﷺ uses a different honorific. Schema returned `nameAr` only,
// so we patch the suffix here based on slug.
const SUFFIX_FOR = (slug) => slug === 'muhammad' ? 'ﷺ' : 'عليه السلام';

function quote(s) {
  // Use double-quoted JS string literals with escaping for newlines & quotes.
  return JSON.stringify(s);
}

function renderParagraphs(arr) {
  return arr.map(quote).map((s) => `          ${s},`).join('\n');
}

function renderSources(arr) {
  return arr.map(quote).map((s) => `          ${s},`).join('\n');
}

const blocks = stories.map((s) => `  // ─────────────────────────────────────────────────────────────────────
  {
    slug: ${quote(s.slug)},
    nameAr: ${quote(s.nameAr)},
    suffix: ${quote(SUFFIX_FOR(s.slug))},
    readingMin: ${s.readingMin},
    byLocale: {
      ru: {
        name: ${quote(s.ru.name)},
        theme: ${quote(s.ru.theme)},
        paragraphs: [
${renderParagraphs(s.ru.paragraphs)}
        ],
        lesson: ${quote(s.ru.lesson)},
        sources: [
${renderSources(s.ru.sources)}
        ],
      },
    },
  },`).join('\n');

// Splice them in before the closing "];" of PROPHET_STORIES.
const src = readFileSync(TARGET_PATH, 'utf8');
const closing = '\n];\n';
const idx = src.lastIndexOf(closing);
if (idx === -1) {
  console.error('Could not find PROPHET_STORIES closing "];"');
  process.exit(1);
}

const beforeArrayClose = src.slice(0, idx);
const afterArrayClose = src.slice(idx);

// Sanity: refuse to add duplicates if any of these slugs already exist.
for (const s of stories) {
  if (new RegExp(`\\bslug: ["']${s.slug}["']`).test(beforeArrayClose)) {
    console.error(`Refusing to merge — story slug "${s.slug}" already in target file`);
    process.exit(2);
  }
}

// Need to ensure the previous entry ends with a comma. Most well-formed
// arrays do. We just append our blocks before the closing bracket.
const out = beforeArrayClose + '\n' + blocks + afterArrayClose;
writeFileSync(TARGET_PATH, out, 'utf8');
console.log(`Merged ${stories.length} stories into ${TARGET_PATH}`);
