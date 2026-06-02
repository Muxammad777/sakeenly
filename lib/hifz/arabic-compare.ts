// Compare a Quran ayah against an ASR transcript.
//
// Both strings come from different sources — Uthmani script vs Modern
// Standard Arabic transcribed by Web Speech — so before scoring we
// normalize aggressively: strip ALL diacritics, fold alef/ya/ta variants,
// drop tatweel, collapse whitespace.

// Unicode property escapes — robust against any copy-paste mangling
// of the source. Mn = Nonspacing Mark, Me = Enclosing Mark. Together
// they cover every Arabic harakat (fatha/damma/kasra/sukun/shadda/
// tanwins/madda/quranic marks). Tatweel is a separate base char.
const COMBINING_MARKS = /\p{M}/gu;
const TATWEEL = /ـ/g;
// Alef variants: ٱ (U+0671 wasla) آ (U+0622 madda) أ (U+0623 hamza-above)
// إ (U+0625 hamza-below). After NFKD these decompose to bare alef +
// combining mark; we collapse the precomposed forms here so both
// pre- and post-NFKD paths converge on ا (U+0627).
const ALEF_VARIANTS = /[ٱآأإ]/g;
// Hamza-bearing forms — ASR often drops or substitutes the seat.
const HAMZA_FORMS = /[ؤئء]/g; // ؤ ئ ء

export function normalizeArabic(s: string): string {
  return s
    .normalize("NFKC")          // recompose first so ALEF_VARIANTS hits
    .replace(ALEF_VARIANTS, "ا")
    .normalize("NFKD")          // then decompose harakat off bases
    .replace(COMBINING_MARKS, "")
    .replace(TATWEEL, "")
    .replace(HAMZA_FORMS, "ء")
    .replace(/ى/g, "ي") // alef maksura → ya
    .replace(/ة/g, "ه") // ta marbuta → ha
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalizeArabic(s).split(" ").filter(Boolean);
}

export interface CompareResult {
  /** 0–1; 1.0 = identical after normalization */
  similarity: number;
  /** parallel arrays — same length as expectedTokens */
  matched: boolean[];
  /** display-ready expected tokens (original Uthmani with harakat) */
  expectedTokens: string[];
  /** normalized form per expected token — for tooltips/debug */
  expectedNorm: string[];
  actualTokens: string[];
  /**
   * Same length as actualTokens. For each ASR token, the prettified
   * form for display: when the token matched an expected word, this
   * is the corresponding Uthmani word *with harakat* (so the "what I
   * heard" panel reads like real Quran). Unmatched tokens fall back
   * to the raw ASR string.
   */
  actualDisplay: string[];
}

/**
 * Levenshtein-aligned token diff. expectedTokens preserves the original
 * Uthmani word forms (with diacritics) so the UI can render real Quran
 * text; matching is done on the normalized projection.
 */
export function compareRecitation(expected: string, actual: string): CompareResult {
  // Preserve original word boundaries — split on whitespace BEFORE
  // normalization so we can show users the real Uthmani words rather
  // than the stripped-down skeletons.
  const expectedRaw = expected.split(/\s+/).filter(Boolean);
  const expectedNorm = expectedRaw.map((w) => normalizeArabic(w));
  // Drop any words that normalize to empty (rare but possible — pure
  // diacritic clusters, end-of-verse markers etc).
  const keep: number[] = [];
  for (let i = 0; i < expectedRaw.length; i++) {
    if (expectedNorm[i].length > 0) keep.push(i);
  }
  const expectedTokens = keep.map((i) => expectedRaw[i]);
  const normTokens = keep.map((i) => expectedNorm[i]);

  const actualTokens = tokens(actual);
  const matched = new Array(expectedTokens.length).fill(false);
  // Start with raw ASR; we'll overwrite matched slots with the Uthmani
  // (with-harakat) version below.
  const actualDisplay = [...actualTokens];

  if (expectedTokens.length === 0) {
    return {
      similarity: 0, matched, expectedTokens,
      expectedNorm: normTokens, actualTokens, actualDisplay,
    };
  }

  let actualCursor = 0;
  for (let i = 0; i < expectedTokens.length; i++) {
    const exp = normTokens[i];
    // Allow ≥1 edit even for 2-letter words (ASR loves to append a
    // tail vowel like 'عم' → 'عما'). Cap at 2 for short words and
    // scale up by ~1/3 length for longer ones.
    const threshold = Math.max(1, Math.min(3, Math.floor(exp.length / 3) + 1));
    const windowEnd = Math.min(actualCursor + 4, actualTokens.length);
    for (let j = actualCursor; j < windowEnd; j++) {
      const act = actualTokens[j];
      if (act === exp || editDistance(act, exp) <= threshold) {
        matched[i] = true;
        // Show the expected Uthmani word for the matched ASR slot —
        // restores diacritics the user actually pronounced but ASR
        // dropped.
        actualDisplay[j] = expectedTokens[i];
        actualCursor = j + 1;
        break;
      }
    }
  }

  const hits = matched.filter(Boolean).length;
  const similarity = hits / expectedTokens.length;
  return {
    similarity, matched, expectedTokens,
    expectedNorm: normTokens, actualTokens, actualDisplay,
  };
}

// Standard Levenshtein. We used to bail out when |Δlen| > 4 as a
// micro-opt, but it caused false misses for long words paired with
// partially-recognized ASR. Keep the algorithm honest — Quran words
// rarely exceed 12 chars after normalization so cost stays trivial.
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}
