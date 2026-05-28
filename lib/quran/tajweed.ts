// Tajweed annotations per verse, loaded once at module load.
//
// Source: cpfair/quran-tajweed (Public Domain Tanzil-derived
// tajweed.hafs.uthmani-pause-sajdah.json). Shipped as
// lib/knowledge/quran/tajweed.json (~5 MB).
//
// Annotations are character-offset ranges into the Uthmani text we
// already render (lib/knowledge/quran/uthmani.json). The renderer
// splits the verse into segments and wraps each rule range in a
// span with class "tj tj-<rule>" so CSS can color it.

import tajweedRaw from "@/lib/knowledge/quran/tajweed.json";

export interface TajweedAnnotation {
  start: number;
  end: number;
  rule: string;
}

interface TajweedEntry {
  surah: number;
  ayah: number;
  annotations: TajweedAnnotation[];
}

const BY_KEY = new Map<string, TajweedAnnotation[]>();
for (const e of tajweedRaw as TajweedEntry[]) {
  BY_KEY.set(`${e.surah}:${e.ayah}`, e.annotations);
}

export function getTajweedAnnotations(surah: number, ayah: number): TajweedAnnotation[] {
  return BY_KEY.get(`${surah}:${ayah}`) ?? [];
}

export interface TajweedSegment {
  text: string;
  rule: string | null;
}

/** Split a verse string by its tajweed annotations into non-overlapping
 *  segments, each tagged with the rule that applies (or null for the
 *  uncoloured base text). Caller maps to spans + CSS classes. */
export function splitByTajweed(text: string, annotations: TajweedAnnotation[]): TajweedSegment[] {
  if (annotations.length === 0) return [{ text, rule: null }];
  const sorted = annotations.slice().sort((a, b) => a.start - b.start);
  const out: TajweedSegment[] = [];
  let cursor = 0;
  for (const a of sorted) {
    // Skip / clip overlapping annotations defensively.
    const start = Math.max(a.start, cursor);
    if (start >= a.end) continue;
    if (start > cursor) out.push({ text: text.slice(cursor, start), rule: null });
    out.push({ text: text.slice(start, a.end), rule: a.rule });
    cursor = a.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), rule: null });
  return out;
}
