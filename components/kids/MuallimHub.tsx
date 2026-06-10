"use client";

// Muallim Sani — hub showing all 17 lessons in two sections, with the
// child's progress checkmark on each.

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useKids } from "./KidsProvider";
import { MUALLIM_LESSONS, type MuallimLesson } from "@/lib/kids/muallim";

export function MuallimHub() {
  const t = useTranslations("muallim");
  const { muallim } = useKids();

  const learnedCount = MUALLIM_LESSONS.reduce((n, l) => n + (muallim.get(l.slug)?.status === "learned" ? 1 : 0), 0);
  const total = MUALLIM_LESSONS.length;

  const section1 = MUALLIM_LESSONS.filter((l) => l.section === "razdel1");
  const section2 = MUALLIM_LESSONS.filter((l) => l.section === "razdel2");

  return (
    <div className="muallim-hub">
      <div className="muallim-hub-meter">
        <div className="muallim-hub-meter-bar">
          <div style={{ width: `${(learnedCount / total) * 100}%` }} />
        </div>
        <div className="muallim-hub-meter-text">
          {t("hub_progress", { n: learnedCount, total })}
        </div>
      </div>

      <h2 className="muallim-section-title">{t("hub_section_1")}</h2>
      <ul className="muallim-grid">
        {section1.map((l) => <LessonCard key={l.slug} lesson={l} status={muallim.get(l.slug)?.status ?? null} />)}
      </ul>

      <h2 className="muallim-section-title">{t("hub_section_2")}</h2>
      <ul className="muallim-grid">
        {section2.map((l) => <LessonCard key={l.slug} lesson={l} status={muallim.get(l.slug)?.status ?? null} />)}
      </ul>

      <div className="muallim-source">
        <h3>{t("source_title")}</h3>
        <p>{t("source_body")}</p>
        <p className="muallim-source-cite">{t("source_citation")}</p>
      </div>
    </div>
  );
}

function LessonCard({ lesson, status }: { lesson: MuallimLesson; status: "in_progress" | "learned" | null }) {
  const t = useTranslations("muallim");
  const learned = status === "learned";
  const inProgress = status === "in_progress";
  const title = t(`${lesson.slug}_t` as never);
  return (
    <li className="muallim-card-wrap">
      <Link href={`/kids/muallim/${lesson.slug}`} className={"muallim-card" + (learned ? " is-learned" : "") + (inProgress ? " is-progress" : "")}>
        <div className="muallim-card-head">
          <span className="muallim-card-num">{t("hub_lesson")} {lesson.id}</span>
          {learned && (
            <span className="muallim-card-check" aria-label={t("hub_learned")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-11" />
              </svg>
            </span>
          )}
          {inProgress && !learned && <span className="muallim-card-dot" />}
        </div>
        <div className="muallim-card-title">{title}</div>
        <div className="muallim-card-cta">{t("hub_open")} →</div>
      </Link>
    </li>
  );
}
