// Compare a Quran ayah against an ASR transcript.
//
// Both strings come from different sources — Uthmani script vs Modern
// Standard Arabic transcribed by Web Speech — so before scoring we
// normalize aggressively: strip ALL diacritics, fold alef/ya/ta variants,
// drop tatweel, collapse whitespace.

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const ALEF_VARIANTS = /[ٱآأإ]/g;

export function normalizeArabic(s: string): string {
  return s
    .normalize("NFKD")
    .replace(HARAKAT, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
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

  if (expectedTokens.length === 0) {
    return { similarity: 0, matched, expectedTokens, expectedNorm: normTokens, actualTokens };
  }

  let actualCursor = 0;
  for (let i = 0; i < expectedTokens.length; i++) {
    const exp = normTokens[i];
    const windowEnd = Math.min(actualCursor + 4, actualTokens.length);
    for (let j = actualCursor; j < windowEnd; j++) {
      const act = actualTokens[j];
      if (act === exp || editDistance(act, exp) <= Math.min(2, Math.floor(exp.length / 3))) {
        matched[i] = true;
        actualCursor = j + 1;
        break;
      }
    }
  }

  const hits = matched.filter(Boolean).length;
  const similarity = hits / expectedTokens.length;
  return { similarity, matched, expectedTokens, expectedNorm: normTokens, actualTokens };
}

// Standard Levenshtein, capped at length difference so we exit early.
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 4) return 99;
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
