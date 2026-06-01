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
  /** parallel arrays — same length as expected tokens */
  matched: boolean[];
  expectedTokens: string[];
  actualTokens: string[];
}

/**
 * Levenshtein-aligned token diff. We align the user's transcript
 * against the expected ayah and mark which expected words landed
 * (within an edit-distance window). Resulting `matched[i]` flags
 * whether expected[i] was recognized in roughly the right spot.
 */
export function compareRecitation(expected: string, actual: string): CompareResult {
  const expectedTokens = tokens(expected);
  const actualTokens = tokens(actual);
  const matched = new Array(expectedTokens.length).fill(false);

  if (expectedTokens.length === 0) {
    return { similarity: 0, matched, expectedTokens, actualTokens };
  }

  // Walk expected tokens left→right. For each, scan a small window
  // of actual tokens around the same index — if any matches (exact
  // or 1-edit) within ±3 positions, mark it found and advance.
  let actualCursor = 0;
  for (let i = 0; i < expectedTokens.length; i++) {
    const exp = expectedTokens[i];
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
  return { similarity, matched, expectedTokens, actualTokens };
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
