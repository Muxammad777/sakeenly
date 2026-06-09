import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { quranApi } from "@/lib/api/quran";
import { buildDailyPlan, type ProgressRow } from "@/lib/hifz/scheduler";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

const TOTAL_AYAT = 6236;
const TOTAL_SURAHS = 114;
const TOTAL_JUZ = 30;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hf" });
  return { title: t("page_title"), alternates: { canonical: "/hifz" } };
}

// Small icon glyphs as inline SVG — kept here so they're typed and
// trivially restylable via currentColor. No external icon dependency.
function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c1 3 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 1 2 3 3 3-3Z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h12v17H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 20a2 2 0 0 0 2 2h12" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconStarburst() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M12 2 13.8 9.6 21.5 8 16.4 14 21.5 20 13.8 18.4 12 26h0L10.2 18.4 2.5 20 7.6 14 2.5 8l7.7 1.6Z" />
    </svg>
  );
}
function IconStack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M4 4h16v16H4z" />
    </svg>
  );
}

// (OrnamentDivider removed — shared.css auto-injects an ornament
// between adjacent <section> siblings, so explicit dividers between
// sections are now redundant.)

export default async function HifzDashboard({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hf" });
  const tSn = await getTranslations({ locale, namespace: "sn" });

  // Guest-mode: dashboard renders even without auth, with empty progress
  // and default settings. Saving a sabaq requires login; the learn page
  // surfaces that gate at the moment of action, not on page entry.
  const user = await getCurrentUser();

  const [progressRaw, settings, chapters] = await Promise.all([
    user
      ? db.hifzProgress.findMany({
          where: { userId: user.id },
          select: {
            ayahKey: true, surah: true, ayah: true, stage: true,
            dueAt: true, lastReviewedAt: true, firstLearnedAt: true,
          },
        })
      : Promise.resolve([] as ProgressRow[]),
    user
      ? db.hifzSettings.findUnique({ where: { userId: user.id } })
      : Promise.resolve(null),
    quranApi.chapters(),
  ]);

  const s = settings ?? {
    dailyTargetDenom: 2, startFromSurah: 78, startFromAyah: 1,
    hifzStreakCurrent: 0, hifzStreakLongest: 0, lastHifzDate: null,
  };

  const progress = progressRaw as ProgressRow[];

  const plan = buildDailyPlan({
    progress,
    settings: {
      dailyTargetDenom: s.dailyTargetDenom,
      startFromSurah: s.startFromSurah,
      startFromAyah: s.startFromAyah,
    },
    chapters: chapters.map((c) => ({ number: c.id, ayatCount: c.verses_count ?? 0 })),
  });

  // ─── derived metrics for the redesigned stat band + progress band ───
  const reviewedAyat = progress.filter(
    (p) => p.lastReviewedAt !== null && p.stage !== "new",
  ).length;
  const completedSurahs = (() => {
    // A surah counts as "completed" only when every ayah is at sabqi
    // stage or higher.
    const byS = new Map<number, Set<number>>();
    for (const p of progress) {
      if (p.stage === "new") continue;
      let bucket = byS.get(p.surah);
      if (!bucket) { bucket = new Set(); byS.set(p.surah, bucket); }
      bucket.add(p.ayah);
    }
    let n = 0;
    for (const c of chapters) {
      if ((byS.get(c.id)?.size ?? 0) >= (c.verses_count ?? Infinity)) n++;
    }
    return n;
  })();
  const completedJuz = Math.floor(plan.totals.learnedAyat / (TOTAL_AYAT / TOTAL_JUZ));
  const overallPct = Math.min(100, (plan.totals.learnedAyat / TOTAL_AYAT) * 100);
  const achievements = (() => {
    let n = 0;
    if (plan.totals.learnedAyat >= 1) n++;       // first ayah
    if (plan.totals.learnedAyat >= 10) n++;
    if (plan.totals.learnedAyat >= 50) n++;
    if (plan.totals.learnedAyat >= 100) n++;
    if (completedJuz >= 1) n++;                  // first juz
    if (completedJuz >= 5) n++;
    if (completedJuz >= 15) n++;
    if (completedJuz >= 30) n++;
    if (completedSurahs >= 1) n++;
    if (s.hifzStreakCurrent >= 7) n++;
    if (s.hifzStreakCurrent >= 30) n++;
    return n;
  })();

  // Per-juz fill ratio for the 30-cell juz bar.
  const ayatPerJuz = Math.ceil(TOTAL_AYAT / TOTAL_JUZ);
  const ayatByJuzApprox = (() => {
    const arr = new Array(TOTAL_JUZ).fill(0);
    let pos = 0;
    for (const c of chapters) {
      const len = c.verses_count ?? 0;
      for (let a = 1; a <= len; a++, pos++) {
        const juzIdx = Math.min(TOTAL_JUZ - 1, Math.floor(pos / ayatPerJuz));
        arr[juzIdx]++;
      }
    }
    return arr;
  })();
  const learnedByJuz = (() => {
    const arr = new Array(TOTAL_JUZ).fill(0);
    // Build a flat index ayah-key → global position so we don't have
    // to hit a juz-map. Approximate but consistent with above.
    const posByKey = new Map<string, number>();
    let pos = 0;
    for (const c of chapters) {
      const len = c.verses_count ?? 0;
      for (let a = 1; a <= len; a++, pos++) posByKey.set(`${c.id}:${a}`, pos);
    }
    for (const p of progress) {
      if (p.stage === "new") continue;
      const idx = posByKey.get(p.ayahKey);
      if (idx === undefined) continue;
      const juzIdx = Math.min(TOTAL_JUZ - 1, Math.floor(idx / ayatPerJuz));
      arr[juzIdx]++;
    }
    return arr;
  })();

  // Circular progress geometry — fixed in the markup so SSR == client.
  const ringR = 64;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (ringC * overallPct) / 100;

  // Sabaq estimated minutes — ~50s/ayah at default speed, rounded up.
  const sabaqEtaMin = Math.max(1, Math.round((plan.sabaq.count * 50) / 60));
  const sabqiEtaMin = Math.max(0, Math.round((plan.sabqi.length * 25) / 60));
  const manzilEtaMin = Math.max(0, Math.round((Math.min(plan.manzil.length, 20) * 20) / 60));

  const sabaqHref = `/hifz/learn/${plan.sabaq.startSurah}/${plan.sabaq.startAyah}?to=${plan.sabaq.endSurah}:${plan.sabaq.endAyah}`;
  const sabqiHref = plan.sabqi.length > 0 ? `/hifz/review?mode=sabqi` : null;
  const manzilHref = plan.manzil.length > 0 ? `/hifz/review?mode=manzil` : null;

  return (
    <>
      {/* ╭───────────────────────── HERO ─────────────────────────╮ */}
      <section className="wrap hifz-hero" data-hero-ar="حِفظ">
        <span className="tag"><span className="tag-dot"></span><span>{t("nav")}</span></span>
        <h1>{t("hero_h1")}</h1>
        <p>{t("hero_sub")}</p>
      </section>

      {!user && (
        <section className="wrap" style={{ paddingTop: 0 }}>
          <div className="hifz-guest-banner">
            <span>{t("auth_required")}</span>
            <Link href={`/${locale}/signin?callbackUrl=/${locale}/hifz`} className="hifz-card-cta">
              {t("begin_sabaq")} →
            </Link>
          </div>
        </section>
      )}

      {/* ╭─────────────────── GLOBAL QUR'AN PROGRESS ───────────────╮ */}
      <section className="wrap hifz-progress-band">
        <div className="hifz-progress-card">
          <div className="hifz-progress-left">
            <div className="hifz-card-eyebrow">{t("progress_eyebrow")}</div>
            <h2 className="hifz-progress-h">{t("progress_h")}</h2>
            <p className="hifz-progress-sub">{t("progress_sub", { n: plan.totals.learnedAyat, total: TOTAL_AYAT })}</p>
            <div className="hifz-progress-stats">
              <div className="hifz-progress-stat">
                <span className="hifz-progress-stat-n">{completedJuz}</span>
                <span className="hifz-progress-stat-l">{t("progress_juz_done", { n: TOTAL_JUZ })}</span>
              </div>
              <div className="hifz-progress-stat">
                <span className="hifz-progress-stat-n">{completedSurahs}</span>
                <span className="hifz-progress-stat-l">{t("progress_sura_done", { n: TOTAL_SURAHS })}</span>
              </div>
            </div>
          </div>
          <div className="hifz-progress-right">
            <div className="hifz-ring-wrap">
              <svg className="hifz-ring" viewBox="0 0 160 160" aria-hidden="true">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.16 80)" />
                    <stop offset="100%" stopColor="oklch(0.68 0.18 60)" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r={ringR} className="hifz-ring-track" />
                <circle
                  cx="80" cy="80" r={ringR}
                  className="hifz-ring-fill"
                  stroke="url(#ringGrad)"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="hifz-ring-text">
                <div className="hifz-ring-pct">{Math.round(overallPct * 10) / 10}%</div>
                <div className="hifz-ring-lbl">{t("progress_overall")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Juz path — 30 cells, intensity proportional to learned share */}
        <div className="hifz-juz-row" aria-label={t("progress_juz_path")}>
          {learnedByJuz.map((n, i) => {
            const ratio = ayatByJuzApprox[i] > 0 ? n / ayatByJuzApprox[i] : 0;
            return (
              <div
                key={i}
                className={"hifz-juz-cell" + (ratio >= 1 ? " is-full" : ratio > 0 ? " is-partial" : "")}
                style={{ ["--fill" as never]: ratio }}
                title={`${t("stats_juz")} ${i + 1}: ${n}/${ayatByJuzApprox[i]}`}
              >
                <span className="hifz-juz-cell-n">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ╭───────────────────── STAT CARDS ─────────────────────╮ */}
      <section className="wrap hifz-stats-row">
        <article className="hifz-stat-card hifz-stat-card-streak">
          <div className="hifz-stat-icon"><IconFlame /></div>
          <div className="hifz-stat-n">{s.hifzStreakCurrent}</div>
          <div className="hifz-stat-l">{t("streak_days")}</div>
          {s.hifzStreakLongest > s.hifzStreakCurrent && (
            <div className="hifz-stat-foot">{t("stats_best", { n: s.hifzStreakLongest })}</div>
          )}
        </article>
        <article className="hifz-stat-card">
          <div className="hifz-stat-icon"><IconBook /></div>
          <div className="hifz-stat-n">{plan.totals.learnedAyat}</div>
          <div className="hifz-stat-l">{t("stats_learned")}</div>
        </article>
        <article className="hifz-stat-card">
          <div className="hifz-stat-icon"><IconTarget /></div>
          <div className="hifz-stat-n">{reviewedAyat}</div>
          <div className="hifz-stat-l">{t("stats_reviewed")}</div>
        </article>
        <article className="hifz-stat-card">
          <div className="hifz-stat-icon"><IconStarburst /></div>
          <div className="hifz-stat-n">{achievements}</div>
          <div className="hifz-stat-l">{t("stats_achievements")}</div>
        </article>
        <article className="hifz-stat-card">
          <div className="hifz-stat-icon"><IconStack /></div>
          <div className="hifz-stat-n">{completedSurahs}</div>
          <div className="hifz-stat-l">{t("stats_surahs_done")}</div>
        </article>
      </section>

      {/* ╭───────────────────── TODAY CARDS ─────────────────────╮ */}
      <section className="wrap hifz-today">
        <h2 className="hifz-today-h">{t("today")}</h2>
        <div className="hifz-cards">
          {/* SABAQ */}
          <article className="hifz-card hifz-card-sabaq">
            <div className="hifz-card-deco" aria-hidden="true">
              <svg viewBox="0 0 60 60"><path d="M30 4 L33 27 L56 30 L33 33 L30 56 L27 33 L4 30 L27 27 Z" /></svg>
            </div>
            <div className="hifz-card-eyebrow">SABAQ · {t("status_new")}</div>
            <h3>{t("sabaq_title")}</h3>
            <div className="hifz-card-detail">
              <span className="hifz-surah-name">{tSn(String(plan.sabaq.startSurah))}</span>
              <span className="hifz-range">
                {t("sabaq_range", {
                  startS: plan.sabaq.startSurah, startA: plan.sabaq.startAyah,
                  endS: plan.sabaq.endSurah, endA: plan.sabaq.endAyah,
                  n: plan.sabaq.count,
                })}
              </span>
            </div>
            <div className="hifz-card-progress">
              <div className="hifz-card-progress-track"><div className="hifz-card-progress-fill" style={{ width: "0%" }} /></div>
              <span className="hifz-card-eta">~{sabaqEtaMin} {t("min_short")}</span>
            </div>
            <Link href={sabaqHref} className="hifz-card-cta">{t("begin_sabaq")} →</Link>
          </article>

          {/* SABQI */}
          <article className="hifz-card hifz-card-sabqi">
            <div className="hifz-card-deco" aria-hidden="true">
              <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" /><circle cx="30" cy="30" r="12" /></svg>
            </div>
            <div className="hifz-card-eyebrow">
              SABQI · {plan.sabqi.length > 0 ? t("status_pending") : t("status_done")}
            </div>
            <h3>{t("sabqi_title")}</h3>
            <div className="hifz-card-detail">
              {plan.sabqi.length > 0
                ? <span className="hifz-range">{t("ayat_count_n", { n: plan.sabqi.length })}</span>
                : <span className="hifz-empty">{t("no_sabqi")}</span>}
            </div>
            {plan.sabqi.length > 0 && (
              <div className="hifz-card-progress">
                <div className="hifz-card-progress-track"><div className="hifz-card-progress-fill" style={{ width: "0%" }} /></div>
                <span className="hifz-card-eta">~{sabqiEtaMin} {t("min_short")}</span>
              </div>
            )}
            {sabqiHref && <Link href={sabqiHref} className="hifz-card-cta">{t("begin_sabqi")} →</Link>}
          </article>

          {/* MANZIL */}
          <article className="hifz-card hifz-card-manzil">
            <div className="hifz-card-deco" aria-hidden="true">
              <svg viewBox="0 0 60 60"><path d="M10 50 L30 14 L50 50 Z" /><path d="M20 50 L30 30 L40 50" /></svg>
            </div>
            <div className="hifz-card-eyebrow">
              MANZIL · {plan.manzil.length > 0 ? t("status_pending") : t("status_empty")}
            </div>
            <h3>{t("manzil_title")}</h3>
            <div className="hifz-card-detail">
              {plan.manzil.length > 0
                ? <span className="hifz-range">{t("ayat_count_n", { n: plan.manzil.length })}</span>
                : <span className="hifz-empty">{t("no_manzil")}</span>}
            </div>
            {plan.manzil.length > 0 && (
              <div className="hifz-card-progress">
                <div className="hifz-card-progress-track"><div className="hifz-card-progress-fill" style={{ width: "0%" }} /></div>
                <span className="hifz-card-eta">~{manzilEtaMin} {t("min_short")}</span>
              </div>
            )}
            {manzilHref && <Link href={manzilHref} className="hifz-card-cta">{t("begin_manzil")} →</Link>}
          </article>
        </div>
      </section>

      {/* ╭───────────────────── SURAH PICKER ─────────────────────╮
          Lets the user jump into hifz from any surah without going
          through the scheduler. Especially useful before they've
          configured a daily target. */}
      <section className="wrap hifz-pick">
        <div className="hifz-pick-head">
          <span className="hifz-card-eyebrow">{t("pick_eyebrow")}</span>
          <h2 className="hifz-pick-h">{t("pick_h")}</h2>
          <p className="hifz-pick-sub">{t("pick_sub")}</p>
        </div>
        <div className="hifz-pick-grid">
          {chapters.map((c) => (
            <Link
              key={c.id}
              href={`/hifz/learn/${c.id}/1`}
              className="hifz-pick-cell"
            >
              <span className="hifz-pick-num">{c.id}</span>
              <span className="hifz-pick-name">{tSn(String(c.id))}</span>
              <span className="hifz-pick-ar" dir="rtl">{c.name_arabic}</span>
              <span className="hifz-pick-meta">{t("ayat_count_n", { n: c.verses_count ?? 0 })}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
