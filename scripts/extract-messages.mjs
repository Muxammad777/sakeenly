// Sakeenly — one-shot script that converts the design-preview's vanilla-JS
// translation DICTs into next-intl message files (5 nested JSON files).
//
// Run with:  node scripts/extract-messages.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PREVIEW = path.resolve(ROOT, "..", "sakeenly", "design-preview");

const LANGS = ["ru", "tg", "uz", "kk", "ky"];

// ─── Mock browser globals so we can eval() the IIFE scripts ─────────────────
const window = {
  SakeenlyDict: null,
  SakeenlyI18n: { DICT: {}, apply: () => {}, LANGS: {}, get: () => null },
  SakeenlyShared: null,
  addEventListener: () => {},
  dispatchEvent: () => {},
};
const document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => null },
  addEventListener: () => {},
  readyState: "complete",
  querySelectorAll: () => [],
  querySelector: () => null,
};
const location = { pathname: "/", search: "", hash: "", href: "" };
const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const history = { replaceState: () => {} };
const navigator = { language: "ru" };
const setTimeout = () => {};
const MutationObserver = function () { this.observe = () => {}; this.disconnect = () => {}; };

// ─── Extract originals' inline DICT (hero/feat/close/votd/streak/cont/...) ──
// The originals' inline script contains:
//   const DICT = JSON.parse("...giant JSON string...");
// Pull it from listen.html which has the broadest key coverage.
const listenSrc = fs.readFileSync(path.join(PREVIEW, "listen.html"), "utf-8");
const dictMatch = listenSrc.match(/const DICT = JSON\.parse\("((?:\\.|[^"\\])*)"\)/);
let inlineDict = {};
if (dictMatch) {
  try {
    // The captured string is JS-source-escaped; un-escape via JSON.parse '"…"'
    // then parse the unescaped JSON.
    const unescaped = JSON.parse('"' + dictMatch[1] + '"');
    inlineDict = JSON.parse(unescaped);
    console.log(`Inline DICT from listen.html: ${Object.keys(inlineDict).length} keys.`);
  } catch (e) {
    console.error("Failed to parse inline DICT:", e.message);
  }
}

// ─── Evaluate i18n-data.js (defines window.SakeenlyDict) ────────────────────
const dataSrc = fs.readFileSync(path.join(PREVIEW, "i18n-data.js"), "utf-8");
eval(dataSrc);
const dataDict = window.SakeenlyDict || {};

// ─── Evaluate i18n-extra.js (mutates window.SakeenlyI18n.DICT) ──────────────
// Pre-seed with inline DICT so extras' Object.assign overrides correctly.
window.SakeenlyI18n.DICT = { ...inlineDict };
const extraSrc = fs.readFileSync(path.join(PREVIEW, "i18n-extra.js"), "utf-8");
eval(extraSrc);
const extraDict = window.SakeenlyI18n.DICT || {};

// Merge: inline → data → extras (later wins on key conflict).
const merged = { ...inlineDict, ...dataDict, ...extraDict };
const allKeys = Object.keys(merged).sort();
console.log(`Extracted ${allKeys.length} translation keys.`);

// ─── Build nested JSON per language ─────────────────────────────────────────
function setNested(target, dottedKey, value) {
  const parts = dottedKey.split(".");
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cur[k] !== "object" || cur[k] === null || Array.isArray(cur[k])) {
      cur[k] = {};
    }
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const lang of LANGS) {
  const out = {};
  for (const key of allKeys) {
    const entry = merged[key];
    const v = entry?.[lang] ?? entry?.ru ?? null;
    if (v !== null && v !== undefined) {
      setNested(out, key, String(v));
    }
  }
  const outPath = path.join(ROOT, "messages", `${lang}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");
  const bytes = fs.statSync(outPath).size;
  console.log(`  ${lang}.json — ${(bytes / 1024).toFixed(1)} KB`);
}

console.log("Done.");
