"use client";

// Live counters card on /kids: letters learned + streak days.
// Only renders for signed-in kids — guests don't see fake progress.

import { useTranslations } from "next-intl";
import { useKids } from "./KidsProvider";
import { ARABIC_LETTERS } from "@/lib/kids/letters";

function applyTpl(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function KidStreakBlock() {
  const { profile, authed } = useKids();
  const t = useTranslations("k");

  // Guests don't see this band at all — no fake progress, no "0 days
  // in a row" frowning at them. They get prompted to sign in elsewhere.
  if (!authed) return null;

  const letterDone = profile?.learnedLetters ?? 0;
  const letterPct = Math.round((letterDone / ARABIC_LETTERS.length) * 100);
  const streak = profile?.streakCurrent ?? 0;

  const today = new Date();
  // Monday = 0
  const dow = (today.getDay() + 6) % 7;

  const weekdayLabels = t.raw("streak_weekdays") as string[];

  return (
    <div className="kid-streak">
      <div className="kid-streak-card">
        <div className="kid-streak-num">{letterDone}</div>
        <div className="kid-streak-info">
          <span className="lbl">{t("streak_alphabet_label")}</span>
          <span className="title">
            {applyTpl(t.raw("streak_alphabet_title"), { n: letterDone, total: ARABIC_LETTERS.length })}
          </span>
          <div className="memo-progress" style={{ marginTop: 8, width: 200 }}>
            <div style={{ width: `${letterPct}%` }} />
          </div>
        </div>
      </div>
      <div className="kid-streak-card">
        <div className="kid-streak-num">{streak}</div>
        <div className="kid-streak-info">
          <span className="lbl">{t("streak_days_label")}</span>
          <span className="title">
            {streak > 0
              ? applyTpl(t.raw("streak_days_title"), { n: streak })
              : t("streak_days_start")}
          </span>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {weekdayLabels.map((d, i) => {
              let cls = "streak-dot";
              if (i < dow) cls += streak > dow - i - 1 ? " done" : "";
              else if (i === dow) cls += profile?.lastActiveDate ? " done" : " today";
              return <div key={`${d}-${i}`} className={cls}>{d}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
