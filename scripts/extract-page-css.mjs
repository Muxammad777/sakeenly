// Extract page-specific CSS from each design-preview HTML.
// Skips the first <style> block (= shared boilerplate already in globals.css).
// Writes one CSS file per page into `app/preview-styles/`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PREVIEW = path.resolve(ROOT, "design-preview");
const OUT_DIR = path.resolve(ROOT, "app", "preview-styles");
fs.mkdirSync(OUT_DIR, { recursive: true });

// page → source HTML file
const PAGES = {
  index:        "index.html",
  reader:       "reader.html",
  listen:       "listen.html",
  kids:         "kids.html",
  pricing:      "pricing.html",
  privacy:      "privacy.html",
  ayat:         "ayat-dlya-trevogi.standalone-src.html",
  // pages I added (no inline shared boilerplate — single style block):
  "ask":              "ask.html",
  "ayat-index":       "ayat.html",
  "about":            "about.html",
  "scholars":         "scholars.html",
  "signin":           "signin.html",
  "profile":          "profile.html",
  "kids-alphabet":    "kids-alphabet.html",
  "kids-surahs":      "kids-surahs.html",
  "kids-stories":     "kids-stories.html",
  "nf":               "404.html",
};

for (const [page, file] of Object.entries(PAGES)) {
  const src = fs.readFileSync(path.join(PREVIEW, file), "utf-8");
  // Find ALL <style> blocks
  const styleRe = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g;
  const blocks = [];
  let m;
  while ((m = styleRe.exec(src)) !== null) blocks.push(m[1]);
  // Originals have shared inline boilerplate in their first <style> block, so
  // we skip block #0. My added pages (ask/about/scholars/...) load shared.css
  // as <link> — their first (and only) <style> block IS page-specific, so we
  // keep block #0 too.
  const isOriginal = ["index.html","reader.html","listen.html","kids.html","pricing.html","privacy.html","ayat-dlya-trevogi.standalone-src.html"].includes(file);
  const startAt = isOriginal ? 1 : 0;
  const pageCss = blocks.slice(startAt).join("\n\n").trim();
  const outPath = path.join(OUT_DIR, `${page}.css`);
  fs.writeFileSync(outPath, `/* Page-specific styles extracted from ${file} */\n\n${pageCss}\n`, "utf-8");
  console.log(`  ${page}.css — ${(pageCss.length / 1024).toFixed(1)} KB`);
}

console.log("Done.");
