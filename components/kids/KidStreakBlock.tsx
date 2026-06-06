"use client";

// Replaces the hardcoded "12/28 letters" + "4 days in a row" cards
// on /kids with live counters from the user's profile.

import { useKids } from "./KidsProvider";
import { ARABIC_LETTERS } from "@/lib/kids/letters";

const WEEKDAY_LABELS = ["П", "В", "С", "Ч", "П", "С", "В"];

export function KidStreakBlock() {
  const { profile } = useKids();
  const letterDone = profile?.learnedLetters ?? 0;
  const letterPct = Math.round((letterDone / ARABIC_LETTERS.length) * 100);
  const streak = profile?.streakCurrent ?? 0;

  const today = new Date();
  // Monday = 0
  const dow = (today.getDay() + 6) % 7;

  return (
    <div className="kid-streak">
      <div className="kid-streak-card">
        <div className="kid-streak-num">{letterDone}</div>
        <div className="kid-streak-info">
          <span className="lbl">Алфавит</span>
          <span className="title">Выучил {letterDone} из {ARABIC_LETTERS.length}</span>
          <div className="memo-progress" style={{ marginTop: 8, width: 200 }}>
            <div style={{ width: `${letterPct}%` }} />
          </div>
        </div>
      </div>
      <div className="kid-streak-card">
        <div className="kid-streak-num">{streak}</div>
        <div className="kid-streak-info">
          <span className="lbl">Дни подряд</span>
          <span className="title">{streak > 0 ? `Занимаешься ${streak} дней подряд` : "Начни первый день"}</span>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {WEEKDAY_LABELS.map((d, i) => {
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
