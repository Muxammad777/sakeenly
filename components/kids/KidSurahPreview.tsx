"use client";

// Surah cards on /kids hub with REAL progress bars. Each card links to the
// dedicated /kids/surahs/[slug] learn page where the kid can listen + repeat.

import Link from "next/link";
import { KID_SURAHS } from "@/lib/kids/letters";
import { useKids } from "./KidsProvider";

export function KidSurahPreview() {
  const { surahs } = useKids();
  return (
    <div className="surah-cards">
      {KID_SURAHS.slice(0, 4).map((s) => {
        const row = surahs.get(String(s.num));
        const learned = row?.status === "learned";
        const recite = row?.reciteScore ?? 0;
        // If the kid finished the surah we show 100%; otherwise progress
        // = best recite score so far (mirrors what they actually achieved).
        const pct = learned ? 100 : recite;
        return (
          <Link key={s.num} className="surah-card" href={`/kids/surahs/${s.num}`}>
            <span className="num">№{s.num} · {s.ayahs}</span>
            <span className="ru">{s.name}</span>
            <div className="ar arabic" dir="rtl">{s.ar}</div>
            <div className="meta">{learned ? "Выучена" : recite > 0 ? `Лучший результат — ${recite}%` : "Готов начать"}</div>
            <div className="memo-progress" style={{ marginTop: 6 }}>
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="surah-card-cta">
              <button type="button">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                Учить
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
