// Daily hifz plan builder.
//
// Given a user's progress map and settings, produces the three classical
// blocks for today:
//
//   sabaq  — NEW material the user is supposed to memorize today.
//            Size depends on their dailyTargetDenom (1=page, 2=½, 4=¼, 8=⅛).
//            Pulled from the contiguous next chunk after the last sabaq.
//
//   sabqi  — RECENT revision: every ayah marked stage=sabaq in the
//            last ~7 days, sorted oldest-first (so the freshest material
//            stays freshest by getting reviewed today).
//
//   manzil — LONG-TERM revision: ayat with stage=manzil OR mastered
//            that are due today (dueAt ≤ now), plus a juz-cycle of
//            previously-learned ayat to keep coverage broad even when
//            nothing is "due" yet.

import { getMushafPage } from "@/lib/quran/mushaf-pages";

export interface ProgressRow {
  ayahKey: string;
  surah: number;
  ayah: number;
  stage: "new" | "sabaq" | "sabqi" | "manzil" | "mastered";
  dueAt: Date | null;
  lastReviewedAt: Date | null;
  firstLearnedAt: Date | null;
}

export interface DailyPlan {
  sabaq: {
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
    count: number;
  };
  sabqi: ProgressRow[];   // recent (last 7 days of sabaq)
  manzil: ProgressRow[];  // due-today + juz cycle
  totals: {
    learnedAyat: number;
    learnedJuz: number;
    learnedSurahs: number;
    dueToday: number;
  };
}

// Madani Mushaf has 604 pages. We split sabaq targets evenly per page.
// `denom` of N means a sabaq is 1/N of a page → call it "ayah window of N".
// Empirically: 1 page ≈ 15 lines ≈ 8-12 ayat depending on surah. Rather
// than estimate ayat-per-page from page-data, we just walk forward by
// the user's stride (e.g. denom=2 → walk forward until you've spanned
// half a page of the mushaf, OR 5 ayat, whichever comes first).
const AYAT_PER_DENOM: Record<number, number> = {
  1: 10, // full page ≈ 10 ayat
  2: 5,  // ½ page
  4: 3,  // ¼ page
  8: 2,  // ⅛ page
};

/**
 * Compute today's plan from the user's full progress list + settings.
 *
 * `chapters` is a list of {number, ayatCount} so we can step from
 * (surahN, lastAyah) to the next surah without an extra DB hit.
 */
export function buildDailyPlan(opts: {
  progress: ProgressRow[];
  settings: {
    dailyTargetDenom: number;
    startFromSurah: number;
    startFromAyah: number;
  };
  chapters: Array<{ number: number; ayatCount: number }>;
  now?: Date;
}): DailyPlan {
  const now = opts.now ?? new Date();
  const stride = AYAT_PER_DENOM[opts.settings.dailyTargetDenom] ?? 5;

  // ── Where to start the next sabaq ──────────────────────────────────
  // Find the latest ayah the user has touched at any stage above 'new'.
  let lastSurah = opts.settings.startFromSurah;
  let lastAyah = opts.settings.startFromAyah - 1;
  for (const p of opts.progress) {
    if (p.stage === "new") continue;
    if (p.surah > lastSurah || (p.surah === lastSurah && p.ayah > lastAyah)) {
      lastSurah = p.surah;
      lastAyah = p.ayah;
    }
  }
  // Walk forward `stride` ayat from (lastSurah, lastAyah+1).
  const sabaqStart = nextAyah(lastSurah, lastAyah, opts.chapters);
  let endSurah = sabaqStart.surah;
  let endAyah = sabaqStart.ayah;
  let count = 1;
  for (let i = 1; i < stride; i++) {
    const stepped = nextAyah(endSurah, endAyah, opts.chapters);
    if (stepped.surah === endSurah && stepped.ayah === endAyah) break;
    endSurah = stepped.surah;
    endAyah = stepped.ayah;
    count++;
    // Stop early at surah boundary so a sabaq never spans two suras.
    if (stepped.surah !== sabaqStart.surah) break;
    // Stop early at page boundary so sabaq never spans two mushaf pages.
    if (getMushafPage(stepped.surah, stepped.ayah) !==
        getMushafPage(sabaqStart.surah, sabaqStart.ayah)) break;
  }

  // ── Sabqi: stage='sabaq' OR (stage='sabqi' with recent firstLearnedAt) ──
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const sabqi = opts.progress
    .filter((p) =>
      p.stage === "sabaq" ||
      (p.stage === "sabqi" && p.firstLearnedAt && p.firstLearnedAt > sevenDaysAgo),
    )
    .sort((a, b) => {
      const ta = a.firstLearnedAt?.getTime() ?? 0;
      const tb = b.firstLearnedAt?.getTime() ?? 0;
      return tb - ta; // newest first — that's what needs the most reps
    });

  // ── Manzil: due today + a sliver of older material on rotation ───
  // Pull anything stage=manzil/mastered whose dueAt has passed.
  const due = opts.progress
    .filter((p) =>
      (p.stage === "manzil" || p.stage === "mastered") &&
      p.dueAt !== null && p.dueAt <= now,
    )
    .sort((a, b) => (a.dueAt!.getTime() - b.dueAt!.getTime()));

  // If nothing is due but the user already has a lot of manzil-stage
  // material, surface a juz-rotation: today's day-of-year mod count of
  // manzil ayat → that's the starting index of a 20-ayah slice. Cheap
  // way to enforce "every juz seen at least once a month" without
  // an additional DB column.
  let manzil = due;
  if (manzil.length === 0) {
    const manzilAll = opts.progress
      .filter((p) => p.stage === "manzil" || p.stage === "mastered")
      .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
    if (manzilAll.length > 0) {
      const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000,
      );
      const slice = 20;
      const start = (dayOfYear * slice) % manzilAll.length;
      manzil = manzilAll.slice(start, start + slice);
      if (manzil.length < slice) {
        manzil = manzil.concat(manzilAll.slice(0, slice - manzil.length));
      }
    }
  }

  // ── Totals ─────────────────────────────────────────────────────────
  const learnedAyat = opts.progress.filter((p) => p.stage !== "new").length;
  const learnedSurahs = new Set(
    opts.progress.filter((p) => p.stage !== "new").map((p) => p.surah),
  ).size;
  const learnedJuz = estimateJuzLearned(opts.progress);

  return {
    sabaq: {
      startSurah: sabaqStart.surah,
      startAyah: sabaqStart.ayah,
      endSurah,
      endAyah,
      count,
    },
    sabqi,
    manzil,
    totals: {
      learnedAyat,
      learnedJuz,
      learnedSurahs,
      dueToday: sabqi.length + due.length,
    },
  };
}

function nextAyah(
  surah: number,
  ayah: number,
  chapters: Array<{ number: number; ayatCount: number }>,
): { surah: number; ayah: number } {
  const cur = chapters.find((c) => c.number === surah);
  if (!cur) return { surah, ayah: ayah + 1 };
  if (ayah + 1 <= cur.ayatCount) return { surah, ayah: ayah + 1 };
  // overflow → first ayah of next surah
  if (surah + 1 <= 114) return { surah: surah + 1, ayah: 1 };
  // end of mushaf — stay put
  return { surah, ayah };
}

// Rough juz count — we'd need a (surah, ayah) → juz map for exactness.
// As a stand-in: count ayat in groups of ~210 (avg juz ≈ 200-220 ayat).
function estimateJuzLearned(progress: ProgressRow[]): number {
  const learned = progress.filter((p) => p.stage !== "new").length;
  return Math.round((learned / 210) * 10) / 10; // 1 decimal place
}
