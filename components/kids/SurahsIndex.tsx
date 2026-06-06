"use client";

// Surah index for /kids/surahs — shows the canonical 6 short surahs
// with REAL recite-score bars and "выучена" / "лучший x%" labels.
// Tapping a card goes to /kids/surahs/[num] learn page.

import Link from "next/link";
import { useKids } from "./KidsProvider";

interface SurahMeta {
  n: number;
  ru: string;
  ar: string;
  verses: number;
  meta: string;
  note: string;
  label: string;
}

interface Props { surahs: SurahMeta[]; }

export function SurahsIndex({ surahs }: Props) {
  const { surahs: progress } = useKids();
  return (
    <div className="ks-grid">
      {surahs.map((s) => {
        const row = progress.get(String(s.n));
        const learned = row?.status === "learned";
        const recite = row?.reciteScore ?? 0;
        const filled = learned ? s.verses : Math.round((recite / 100) * s.verses);
        return (
          <Link key={s.n} className={"ks" + (learned ? " ks-learned" : "")} href={`/kids/surahs/${s.n}`}>
            <div className="ks-head">
              <div className="ks-num">{s.n}</div>
              <div className="ks-title">
                <div className="name">{s.ru}</div>
                <div className="meta">{s.meta}</div>
              </div>
              <div className="ks-ar" dir="rtl">{s.ar}</div>
            </div>
            <div className="ks-note">{s.note}</div>
            <div className="ks-progress">
              {Array.from({ length: s.verses }).map((_, j) => (
                <div key={j} className={`b ${j < filled ? "done" : ""}`}></div>
              ))}
            </div>
            <div className="ks-foot">
              <span className="label">{learned ? "Выучена" : recite > 0 ? `Лучший: ${recite}%` : s.label}</span>
              <button className="ks-play" type="button" aria-label="Слушать">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
