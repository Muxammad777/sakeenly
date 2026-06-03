"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface HifzReviewItem {
  ayahKey: string;
  surah: number;
  ayah: number;
  stage: "new" | "sabaq" | "sabqi" | "manzil" | "mastered";
  textUthmani: string;
  audioUrl: string | null;
}

type Grade = "forgot" | "hard" | "good" | "easy";

export function HifzReviewClient({ items }: { items: HifzReviewItem[] }) {
  const t = useTranslations("hf");
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = items[idx];

  // Whenever idx changes, reset reveal + ready a fresh audio element.
  useEffect(() => {
    setRevealed(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (current?.audioUrl) {
      const url = current.audioUrl.startsWith("//") ? `https:${current.audioUrl}` : current.audioUrl;
      audioRef.current = new Audio(url);
    }
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, [idx, current]);

  const grade = async (g: Grade) => {
    if (!current || grading) return;
    setGrading(true);
    try {
      await fetch("/api/hifz/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ayahKey: current.ayahKey, grade: g }),
      });
      // Advance regardless of server response — UI feels snappier.
      setIdx((i) => i + 1);
    } finally {
      setGrading(false);
    }
  };

  if (!current) {
    return (
      <section className="hifz-review-wrap">
        <h1 className="hifz-review-h">{t("review_h1")}</h1>
        <div className="hifz-review-done">
          {t("review_done")}
          <div style={{ marginTop: 18 }}>
            <Link href="/hifz" className="hifz-card-cta">← {t("learn_back")}</Link>
          </div>
        </div>
      </section>
    );
  }

  const progressPct = items.length > 0 ? ((idx) / items.length) * 100 : 0;

  return (
    <section className="hifz-review-wrap">
      <div className="hifz-learn-bg" aria-hidden="true" />
      <header className="hifz-learn-head">
        <Link href="/hifz" className="hifz-learn-back">← {t("learn_back")}</Link>
        <div className="hifz-review-progress">
          <div className="hifz-review-progress-track">
            <div className="hifz-review-progress-fill" style={{ width: progressPct + "%" }} />
          </div>
          <div className="hifz-learn-counter">
            <span className="hifz-learn-counter-cur">{idx + 1}</span>
            <span className="hifz-learn-counter-sep">/</span>
            <span className="hifz-learn-counter-tot">{items.length}</span>
          </div>
        </div>
      </header>

      <div className="hifz-learn-divider" aria-hidden="true">
        <span className="hifz-divider-line" />
        <svg className="hifz-divider-star" viewBox="0 0 24 24">
          <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
        </svg>
        <span className="hifz-divider-line" />
      </div>

      <article className="hifz-ayah is-current hifz-review-ayah">
        <div className="hifz-ayah-key">
          {current.ayahKey}
          <span className={"hifz-review-stage hifz-review-stage-" + current.stage}>{current.stage}</span>
        </div>
        <div className="hifz-ayah-ar">
          {revealed
            ? current.textUthmani
            : <span className="hifz-ayah-blind">{current.textUthmani}</span>}
        </div>
        <div className="hifz-review-actions">
          <button
            type="button"
            className="hifz-control-btn"
            onClick={() => audioRef.current?.play()}
            disabled={!current.audioUrl}
          >▶ {t("learn_play")}</button>
          <button
            type="button"
            className="hifz-control-btn hifz-control-primary"
            onClick={() => setRevealed(true)}
            disabled={revealed}
          >{revealed ? "✓ открыт" : "показать"}</button>
        </div>
      </article>

      <div className="hifz-review-grade-q">
        {t("review_grade_q")}
      </div>
      <div className="hifz-grade-row">
        <button className="hifz-grade-btn hifz-grade-btn-forgot" onClick={() => grade("forgot")} disabled={grading}>
          {t("grade_forgot")}
        </button>
        <button className="hifz-grade-btn" onClick={() => grade("hard")} disabled={grading}>
          {t("grade_hard")}
        </button>
        <button className="hifz-grade-btn" onClick={() => grade("good")} disabled={grading}>
          {t("grade_good")}
        </button>
        <button className="hifz-grade-btn hifz-grade-btn-easy" onClick={() => grade("easy")} disabled={grading}>
          {t("grade_easy")}
        </button>
      </div>
    </section>
  );
}
