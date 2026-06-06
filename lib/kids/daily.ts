// Daily challenge picker. Given a profile's learned/in-progress state,
// pick 3 fresh items and 2 review items, deterministic per UTC day so the
// same kid sees the same list all day even after a refresh.

import { ARABIC_LETTERS, KID_SURAHS } from "./letters";

interface KnownState {
  learnedLetterSlugs: Set<string>;
  inProgressLetterSlugs: Set<string>;
  learnedSurahKeys: Set<string>;
}

export interface DailyItem {
  type: "letter" | "surah";
  key: string;
  label: string;
  ar: string;
  mode: "new" | "review";
}

// Fast hash so we get a stable, profile+day specific shuffle. Not cryptographic.
function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = (h ^ str.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function ymd(d = new Date()) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function pickN<T>(items: T[], n: number, seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export function pickDailyChallenge(state: KnownState, profileId: string, now = new Date()): DailyItem[] {
  const seed = hash(`${profileId}:${ymd(now)}`);

  const freshLetters = ARABIC_LETTERS.filter(
    (l) => !state.learnedLetterSlugs.has(l.slug) && !state.inProgressLetterSlugs.has(l.slug),
  );
  const reviewLetters = ARABIC_LETTERS.filter((l) => state.learnedLetterSlugs.has(l.slug));
  const freshSurahs = KID_SURAHS.filter((s) => !state.learnedSurahKeys.has(String(s.num)));

  const items: DailyItem[] = [];

  for (const l of pickN(freshLetters, 3, seed)) {
    items.push({ type: "letter", key: l.slug, label: l.name, ar: l.ar, mode: "new" });
  }
  for (const l of pickN(reviewLetters, 2, seed ^ 0xdeadbeef)) {
    items.push({ type: "letter", key: l.slug, label: l.name, ar: l.ar, mode: "review" });
  }
  if (items.length < 5 && freshSurahs.length) {
    const s = pickN(freshSurahs, 5 - items.length, seed ^ 0x1234)[0];
    if (s) items.push({ type: "surah", key: String(s.num), label: s.name, ar: s.ar, mode: "new" });
  }

  return items.slice(0, 5);
}
