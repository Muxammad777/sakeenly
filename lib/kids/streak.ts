// Streak math for a kid profile. A "kid day" counts when the kid records
// at least one successful action (mastered a letter / surah / story).
// We mirror the rules from hifz: keep, +1, or reset based on the calendar
// distance between the previous active day and today.

import type { PrismaClient, KidProfile } from "@prisma/client";

export async function bumpKidStreak(
  db: PrismaClient,
  profile: Pick<KidProfile, "id" | "streakCurrent" | "streakLongest" | "lastActiveDate">,
  now = new Date(),
): Promise<{ current: number; longest: number; updated: boolean }> {
  const today0 = new Date(now); today0.setHours(0, 0, 0, 0);
  const last = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (last && last.getTime() === today0.getTime()) {
    return { current: profile.streakCurrent, longest: profile.streakLongest, updated: false };
  }

  const yesterday0 = new Date(today0); yesterday0.setDate(yesterday0.getDate() - 1);
  const nextCurrent = last && last.getTime() === yesterday0.getTime()
    ? profile.streakCurrent + 1
    : 1;
  const nextLongest = Math.max(profile.streakLongest, nextCurrent);

  await db.kidProfile.update({
    where: { id: profile.id },
    data: { streakCurrent: nextCurrent, streakLongest: nextLongest, lastActiveDate: now },
  });

  return { current: nextCurrent, longest: nextLongest, updated: true };
}
