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

  return (
    <section className="hifz-review-wrap">
      <header className="hifz-learn-head">
        <Link href="/hifz" className="hifz-learn-back">← {t("learn_back")}</Link>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--text-3)" }}>
          {idx + 1} / {items.length}
        </div>
      </header>

      <article className="hifz-ayah is-current">
        <div className="hifz-ayah-key">{current.ayahKey} · {current.stage}</div>
        <div className="hifz-ayah-ar">
          {revealed
            ? current.textUthmani
            : <span className="hifz-ayah-blind">{current.textUthmani}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            className="hifz-control-btn"
            onClick={() => audioRef.current?.play()}
            disabled={!current.audioUrl}
          >{t("learn_play")}</button>
          <button
            type="button"
            className="hifz-control-btn hifz-control-primary"
            onClick={() => setRevealed(true)}
            disabled={revealed}
          >{revealed ? "✓" : "Show"}</button>
        </div>
      </article>

      <div style={{ textAlign: "center", marginTop: 28, color: "var(--text-3)", fontSize: 13 }}>
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
