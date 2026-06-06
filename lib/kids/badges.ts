// Badge catalogue + earning logic. Awarded server-side after every
// /api/kids/progress write — never trust the client to claim a badge.
//
// Badges are intentionally simple milestones that map to actions a 4–8
// year-old can take in one sitting. Streak badges are evaluated separately
// because they depend on the calendar, not on a single mutation.

import type { PrismaClient } from "@prisma/client";

export interface KidBadgeDef {
  slug: string;
  title: string;
  hint: string;
  icon: string; // emoji-free visual key — UI maps it to an SVG
}

export const KID_BADGES: KidBadgeDef[] = [
  { slug: "first_letter",   title: "Первая буква",   hint: "Выучил первую букву алфавита", icon: "letter" },
  { slug: "letters_10",     title: "10 букв",        hint: "Выучил 10 букв",               icon: "stars" },
  { slug: "letters_28",     title: "Весь алфавит",   hint: "Все 28 букв выучены",          icon: "crown" },
  { slug: "first_surah",    title: "Первая сура",    hint: "Выучил первую короткую суру",  icon: "book" },
  { slug: "surahs_3",       title: "3 суры",         hint: "Выучил 3 короткие суры",       icon: "sparkle" },
  { slug: "first_story",    title: "Первая история", hint: "Прочитал первую историю",      icon: "scroll" },
  { slug: "streak_3",       title: "3 дня подряд",   hint: "Занимался 3 дня подряд",       icon: "flame" },
  { slug: "streak_7",       title: "Неделя",         hint: "7 дней подряд",                icon: "moon" },
];

export const BADGE_BY_SLUG: Record<string, KidBadgeDef> = Object.fromEntries(
  KID_BADGES.map((b) => [b.slug, b]),
);

interface Counters {
  learnedLetters: number;
  learnedSurahs: number;
  readStories: number;
  streakCurrent: number;
}

/**
 * Returns the list of badge slugs the profile has *earned* based on raw
 * counters. Awarding (writing rows) is the caller's job — this just maps.
 */
export function badgesForCounters(c: Counters): string[] {
  const earned: string[] = [];
  if (c.learnedLetters >= 1)   earned.push("first_letter");
  if (c.learnedLetters >= 10)  earned.push("letters_10");
  if (c.learnedLetters >= 28)  earned.push("letters_28");
  if (c.learnedSurahs  >= 1)   earned.push("first_surah");
  if (c.learnedSurahs  >= 3)   earned.push("surahs_3");
  if (c.readStories    >= 1)   earned.push("first_story");
  if (c.streakCurrent  >= 3)   earned.push("streak_3");
  if (c.streakCurrent  >= 7)   earned.push("streak_7");
  return earned;
}

export async function evaluateAndAwardBadges(
  db: PrismaClient,
  profileId: string,
): Promise<string[]> {
  const [profile, learned] = await Promise.all([
    db.kidProfile.findUnique({ where: { id: profileId } }),
    db.kidProgress.findMany({
      where: { profileId, status: "learned" },
      select: { type: true },
    }),
  ]);
  if (!profile) return [];

  const counters: Counters = {
    learnedLetters: learned.filter((p) => p.type === "letter").length,
    learnedSurahs:  learned.filter((p) => p.type === "surah").length,
    readStories:    learned.filter((p) => p.type === "story").length,
    streakCurrent:  profile.streakCurrent,
  };

  const earnedSlugs = badgesForCounters(counters);
  if (!earnedSlugs.length) return [];

  const existing = await db.kidBadge.findMany({
    where: { profileId, slug: { in: earnedSlugs } },
    select: { slug: true },
  });
  const have = new Set(existing.map((b) => b.slug));
  const fresh = earnedSlugs.filter((s) => !have.has(s));
  if (!fresh.length) return [];

  await db.kidBadge.createMany({
    data: fresh.map((slug) => ({ profileId, slug })),
    skipDuplicates: true,
  });
  return fresh;
}
