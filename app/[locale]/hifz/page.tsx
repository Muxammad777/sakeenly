import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { quranApi } from "@/lib/api/quran";
import { buildDailyPlan, type ProgressRow } from "@/lib/hifz/scheduler";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hf" });
  return { title: t("page_title"), alternates: { canonical: "/hifz" } };
}

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

  const plan = buildDailyPlan({
    progress: progressRaw as ProgressRow[],
    settings: {
      dailyTargetDenom: s.dailyTargetDenom,
      startFromSurah: s.startFromSurah,
      startFromAyah: s.startFromAyah,
    },
    chapters: chapters.map((c) => ({ number: c.id, ayatCount: c.verses_count ?? 0 })),
  });

  const sabaqHref = `/hifz/learn/${plan.sabaq.startSurah}/${plan.sabaq.startAyah}?to=${plan.sabaq.endSurah}:${plan.sabaq.endAyah}`;
  const sabqiHref = plan.sabqi.length > 0 ? `/hifz/review?mode=sabqi` : null;
  const manzilHref = plan.manzil.length > 0 ? `/hifz/review?mode=manzil` : null;

  return (
    <>
      <section className="wrap hifz-hero">
        <div className="geo-stars-fade"></div>
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

      <section className="wrap hifz-stats-row">
        <div className="hifz-streak">
          <div className="hifz-streak-num">{s.hifzStreakCurrent}</div>
          <div className="hifz-streak-lbl">{t("streak_days")}</div>
        </div>
        <div className="hifz-stat"><div className="hifz-stat-n">{plan.totals.learnedAyat}</div><div className="hifz-stat-l">{t("stats_learned")}</div></div>
        <div className="hifz-stat"><div className="hifz-stat-n">{plan.totals.learnedJuz}</div><div className="hifz-stat-l">{t("stats_juz")}</div></div>
        <div className="hifz-stat"><div className="hifz-stat-n">{plan.totals.learnedSurahs}</div><div className="hifz-stat-l">{t("stats_surahs")}</div></div>
        <div className="hifz-stat"><div className="hifz-stat-n">{plan.totals.dueToday}</div><div className="hifz-stat-l">{t("stats_due")}</div></div>
      </section>

      <section className="wrap hifz-today">
        <h2 className="hifz-today-h">{t("today")}</h2>
        <div className="hifz-cards">
          <article className="hifz-card hifz-card-sabaq">
            <div className="hifz-card-eyebrow">SABAQ</div>
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
            <Link href={sabaqHref} className="hifz-card-cta">{t("begin_sabaq")} →</Link>
          </article>

          <article className="hifz-card hifz-card-sabqi">
            <div className="hifz-card-eyebrow">SABQI</div>
            <h3>{t("sabqi_title")}</h3>
            <div className="hifz-card-detail">
              {plan.sabqi.length > 0
                ? <span className="hifz-range">{plan.sabqi.length} аят</span>
                : <span className="hifz-empty">{t("no_sabqi")}</span>}
            </div>
            {sabqiHref && <Link href={sabqiHref} className="hifz-card-cta">{t("begin_sabqi")} →</Link>}
          </article>

          <article className="hifz-card hifz-card-manzil">
            <div className="hifz-card-eyebrow">MANZIL</div>
            <h3>{t("manzil_title")}</h3>
            <div className="hifz-card-detail">
              {plan.manzil.length > 0
                ? <span className="hifz-range">{plan.manzil.length} аят</span>
                : <span className="hifz-empty">{t("no_manzil")}</span>}
            </div>
            {manzilHref && <Link href={manzilHref} className="hifz-card-cta">{t("begin_manzil")} →</Link>}
          </article>
        </div>
      </section>
    </>
  );
}
