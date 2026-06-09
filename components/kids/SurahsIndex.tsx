"use client";

// Surah index for /kids/surahs — shows the canonical 6 short surahs
// with REAL recite-score bars and "выучена" / "лучший x%" labels.
// Tapping a card goes to /kids/surahs/[num] learn page.

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useKids } from "./KidsProvider";

function applyTpl(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

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
  const t = useTranslations("k");
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
              <span className="label">{learned ? t("surah_learned") : recite > 0 ? applyTpl(t.raw("surah_short_best"), { p: recite }) : s.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
