// Spaced-repetition scheduler for hifz.
//
// Foundation is SM-2 (the algorithm that powers Anki, originally from
// Piotr Wozniak's SuperMemo). For Quran memorization we tune it:
//
//   - 4 grades instead of 0-5 (the user just had to recall an ayah
//     they should already know — finer granularity is noise).
//   - Stage transitions: new → sabaq → sabqi → manzil → mastered.
//     SRS interval works independently; stage decides which review
//     queue the ayah lands in next.
//   - "Forgot" doesn't just reset interval — it drops the stage too,
//     mirroring the madrasa convention that a forgotten ayah goes
//     back into the recent-review (sabqi) bucket.
//   - "Leech" detection: 8 lapses → flag for manual attention.

import type { HifzStage, HifzGrade } from "@prisma/client";

export type Stage = HifzStage;
export type Grade = HifzGrade;

export interface SrsState {
  stage: Stage;
  srsInterval: number;
  srsEase: number;
  srsLapses: number;
  srsReps: number;
  consecutiveOk: number;
}

export interface SrsUpdate extends SrsState {
  dueAt: Date;
  isLeech: boolean;
}

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const LEECH_THRESHOLD = 8;

const STAGE_ORDER: Stage[] = ["new", "sabaq", "sabqi", "manzil", "mastered"];

function nextStage(s: Stage): Stage {
  const i = STAGE_ORDER.indexOf(s);
  if (i === -1 || i === STAGE_ORDER.length - 1) return s;
  return STAGE_ORDER[i + 1];
}
function prevStage(s: Stage): Stage {
  const i = STAGE_ORDER.indexOf(s);
  if (i <= 1) return "sabaq"; // never go below sabaq once started
  return STAGE_ORDER[i - 1];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * First-time memorization: the user just learned a brand-new ayah.
 * Starts the SRS clock at interval=1 day, stage=sabaq.
 */
export function applyFirstLearn(now: Date = new Date()): SrsUpdate {
  return {
    stage: "sabaq",
    srsInterval: 1,
    srsEase: 2.5,
    srsLapses: 0,
    srsReps: 1,
    consecutiveOk: 1,
    dueAt: addDays(now, 1),
    isLeech: false,
  };
}

/**
 * Apply a review grade to existing progress. Returns the new SRS state
 * and the scheduled next-review timestamp.
 *
 * Grade meanings (4-button system):
 *   forgot — could not recall  → drop stage, reset interval to 1
 *   hard   — recalled w/ effort → keep stage, interval × 1.2, ease -0.15
 *   good   — solid recall       → advance stage if eligible, interval × ease
 *   easy   — instant recall     → advance stage if eligible, interval × ease × 1.3, ease +0.15
 */
export function applyGrade(
  current: SrsState,
  grade: Grade,
  now: Date = new Date(),
): SrsUpdate {
  let { stage, srsInterval, srsEase, srsLapses, srsReps, consecutiveOk } = current;

  switch (grade) {
    case "forgot": {
      stage = prevStage(stage);
      srsInterval = 1;
      srsEase = clamp(srsEase - 0.2, MIN_EASE, MAX_EASE);
      srsLapses += 1;
      srsReps = 0;
      consecutiveOk = 0;
      break;
    }
    case "hard": {
      srsInterval = Math.max(1, Math.round(srsInterval * 1.2));
      srsEase = clamp(srsEase - 0.15, MIN_EASE, MAX_EASE);
      srsReps += 1;
      consecutiveOk += 1;
      // stage stays
      break;
    }
    case "good": {
      // The very first successful rep moves interval from 1 → 3 days,
      // the second from 3 → ~7. After that the ease-factor takes over.
      if (srsReps === 0) srsInterval = 1;
      else if (srsReps === 1) srsInterval = 3;
      else srsInterval = Math.round(srsInterval * srsEase);
      srsReps += 1;
      consecutiveOk += 1;
      if (consecutiveOk >= 3) stage = nextStage(stage);
      break;
    }
    case "easy": {
      if (srsReps === 0) srsInterval = 2;
      else srsInterval = Math.round(srsInterval * srsEase * 1.3);
      srsEase = clamp(srsEase + 0.15, MIN_EASE, MAX_EASE);
      srsReps += 1;
      consecutiveOk += 1;
      // Easy hops two stages at once if eligible.
      stage = nextStage(stage);
      if (consecutiveOk >= 4) stage = nextStage(stage);
      break;
    }
  }

  // Cap manzil interval at 60 days — even a perfect hafiz should see
  // every ayah at least every two months to stay fluent. Mastered ayat
  // get a 90-day cap.
  const cap = stage === "mastered" ? 90 : 60;
  if (srsInterval > cap) srsInterval = cap;

  return {
    stage,
    srsInterval,
    srsEase,
    srsLapses,
    srsReps,
    consecutiveOk,
    dueAt: addDays(now, srsInterval),
    isLeech: srsLapses >= LEECH_THRESHOLD,
  };
}
