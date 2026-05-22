// Inline citation grammar used by the LLM and parsed back out of its response.
//
//   [Quran 2:255]
//   [Quran 36:1-5]              (verse range)
//   [Bukhari 5063]
//   [Muslim 2812]
//   [Tirmidhi 1234]
//   [AbuDawud 5031]
//   [Nasai 88]
//   [IbnMajah 224]

export type Citation =
  | { type: "quran"; ref: string; surah: number; ayah: number; ayahEnd?: number }
  | {
      type: "hadith";
      collection: HadithCollection;
      number: string;
      ref: string;
    };

export const HADITH_COLLECTIONS = [
  "Bukhari",
  "Muslim",
  "Tirmidhi",
  "AbuDawud",
  "Nasai",
  "IbnMajah",
] as const;
export type HadithCollection = (typeof HADITH_COLLECTIONS)[number];

const HADITH_RE = new RegExp(
  String.raw`\[(${HADITH_COLLECTIONS.join("|")})\s+([A-Za-z0-9.\-]+)\]`,
  "g",
);

// Match [Quran S:A] or [Quran S:A-B]. We accept either ASCII colon or full-width
// ":" in case the model produces typography.
const QURAN_RE = /\[Quran\s+(\d{1,3})[:：](\d{1,4})(?:-(\d{1,4}))?\]/g;

export function parseCitations(text: string): Citation[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: Citation[] = [];

  for (const m of text.matchAll(QURAN_RE)) {
    const surah = Number(m[1]);
    const ayah = Number(m[2]);
    const ayahEnd = m[3] ? Number(m[3]) : undefined;
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) continue;
    if (!Number.isInteger(ayah) || ayah < 1) continue;
    const ref = ayahEnd ? `${surah}:${ayah}-${ayahEnd}` : `${surah}:${ayah}`;
    const key = `q:${ref}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type: "quran", ref, surah, ayah, ayahEnd });
  }

  for (const m of text.matchAll(HADITH_RE)) {
    const collection = m[1] as HadithCollection;
    const number = m[2];
    const ref = `${collection} ${number}`;
    const key = `h:${ref}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type: "hadith", collection, number, ref });
  }

  return out;
}

/**
 * True when EVERY substantive sentence in the answer references at least one
 * citation marker. We don't enforce this on the model; instead the API uses it
 * as a soft check ("citation_coverage") to surface to product analytics.
 */
export function hasAnyCitation(text: string): boolean {
  return parseCitations(text).length > 0;
}

/**
 * Replace inline citation markers with <sup class="citation">…</sup> for
 * rendering. The mapping function decides how each citation should render
 * (e.g. as a link to /reader/<surah>/<ayah>).
 */
export function renderCitationsHtml(
  text: string,
  toHtml: (citation: Citation) => string,
): string {
  const replacements: Array<{ start: number; end: number; html: string }> = [];

  const collect = (re: RegExp, build: (m: RegExpExecArray) => Citation | null) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const cit = build(m);
      if (!cit) continue;
      replacements.push({ start: m.index, end: m.index + m[0].length, html: toHtml(cit) });
    }
  };

  collect(QURAN_RE, (m) => {
    const surah = Number(m[1]);
    const ayah = Number(m[2]);
    const ayahEnd = m[3] ? Number(m[3]) : undefined;
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
    const ref = ayahEnd ? `${surah}:${ayah}-${ayahEnd}` : `${surah}:${ayah}`;
    return { type: "quran", ref, surah, ayah, ayahEnd };
  });
  collect(HADITH_RE, (m) => ({
    type: "hadith",
    collection: m[1] as HadithCollection,
    number: m[2],
    ref: `${m[1]} ${m[2]}`,
  }));

  replacements.sort((a, b) => a.start - b.start);

  let out = "";
  let cursor = 0;
  for (const r of replacements) {
    out += text.slice(cursor, r.start) + r.html;
    cursor = r.end;
  }
  out += text.slice(cursor);
  return out;
}
