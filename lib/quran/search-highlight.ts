// Shared search-highlight + match-count helpers, used by both the
// global /search page and the in-surah search in the reader.
//
// Design points carried over from server-side search-corpus:
//
//   1. Translator commentary wrapped in (), [], [[]], {} is NOT part of
//      the Qur'an text. We never highlight inside those brackets, and we
//      never count matches inside them.
//
//   2. "Exact" matches use unicode word-boundary lookarounds so a query
//      like "мир" doesn't light up the "мир" inside "смиренно" / "мире".
//      Non-exact matches use plain substring (catches related forms).

const TOKEN_SPLIT = /[\s.,;:!?()«»"'\-—–]+/;
const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
const ARABIC_RANGE = /[؀-ۿ]/;

/** Tokenize a query the same way the server does. */
export function queryTokens(query: string): string[] {
  return query
    .split(TOKEN_SPLIT)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(REGEX_SPECIAL, "\\$&"));
}

export function looksArabic(s: string): boolean {
  return ARABIC_RANGE.test(s);
}

/**
 * Build the OR-of-tokens regex used for `text.replace(...)` highlight
 * and for `text.match(...)` count. Returns null when the query is too
 * short or yields no tokens.
 *
 * `wholeWord = true`  → matches only when surrounded by non-letter/digit
 *                       (or string boundary); the "exact" / "точное" mode.
 * `wholeWord = false` → plain substring; catches "смиренно" for "мир".
 */
export function buildHighlightRegex(query: string, wholeWord: boolean): RegExp | null {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return null;
  const inner = tokens.join("|");
  const pattern = wholeWord
    ? `(?<![\\p{L}\\p{N}])(${inner})(?![\\p{L}\\p{N}])`
    : `(${inner})`;
  const flags = looksArabic(query) ? "gu" : "giu";
  try { return new RegExp(pattern, flags); }
  catch { return null; }
}

/**
 * Slice a string into alternating "outside-brackets" / "inside-brackets"
 * segments. Brackets are (), [], {} and any nesting depth. Used by
 * highlight to skip translator commentary, and by count to ignore it
 * in match totals.
 */
export function splitByBrackets(text: string): Array<{ inside: boolean; text: string }> {
  const segs: Array<{ inside: boolean; text: string }> = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[" || c === "{") {
      if (depth === 0 && buf) {
        segs.push({ inside: false, text: buf });
        buf = "";
      }
      buf += c;
      depth++;
    } else if (c === ")" || c === "]" || c === "}") {
      buf += c;
      depth--;
      if (depth <= 0) {
        depth = 0;
        segs.push({ inside: true, text: buf });
        buf = "";
      }
    } else {
      buf += c;
    }
  }
  if (buf) segs.push({ inside: depth > 0, text: buf });
  return segs;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Wrap matches of `re` in <mark class="markClass">…</mark>, but only in
 * the parts of `text` outside translator-brackets. The output is safe
 * to feed to dangerouslySetInnerHTML — bracket contents are HTML-escaped.
 */
export function highlightToHtml(text: string, re: RegExp | null, markClass = ""): string {
  if (!text) return "";
  if (!re) return escapeHtml(text);
  const mark = markClass ? `<mark class="${markClass}">` : "<mark>";
  return splitByBrackets(text)
    .map((seg) =>
      seg.inside
        ? escapeHtml(seg.text)
        : escapeHtml(seg.text).replace(re, `${mark}$1</mark>`),
    )
    .join("");
}

/**
 * Wrap matches of `re` in <mark> tokens inside an HTML string while
 * preserving existing tags (Qur'an translation strings sometimes
 * include citations like <a> or <span>). Bracket-aware: skips matches
 * inside translator commentary.
 *
 * NOT a full HTML parser — assumes the input is sanitized translation
 * markup with simple inline tags. Adequate for the citation HTML we
 * ship in translation JSON.
 */
export function highlightHtmlString(html: string, re: RegExp | null, markClass = ""): string {
  if (!html || !re) return html;
  const mark = markClass ? `<mark class="${markClass}">` : "<mark>";
  // Walk the string. Inside a <tag> we don't touch text. Outside, we
  // apply the bracket-aware text highlight.
  let out = "";
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const close = html.indexOf(">", i);
      if (close === -1) { out += html.slice(i); break; }
      out += html.slice(i, close + 1);
      i = close + 1;
      continue;
    }
    // Grab a chunk of pure text until the next tag.
    const next = html.indexOf("<", i);
    const chunk = next === -1 ? html.slice(i) : html.slice(i, next);
    out += splitByBrackets(chunk)
      .map((seg) => (seg.inside ? seg.text : seg.text.replace(re, `${mark}$1</mark>`)))
      .join("");
    if (next === -1) break;
    i = next;
  }
  return out;
}

/**
 * Count how many times `re` matches across `text`, ignoring matches
 * inside translator brackets. Used by the in-surah counter.
 */
export function countMatchesIgnoreBrackets(text: string, re: RegExp | null): number {
  if (!text || !re) return 0;
  let n = 0;
  for (const seg of splitByBrackets(text)) {
    if (seg.inside) continue;
    n += (seg.text.match(re) ?? []).length;
  }
  return n;
}

/** Like countMatchesIgnoreBrackets but strips HTML tags first. */
export function countHtmlMatchesIgnoreBrackets(html: string, re: RegExp | null): number {
  if (!html || !re) return 0;
  const plain = html.replace(/<[^>]+>/g, "");
  return countMatchesIgnoreBrackets(plain, re);
}
