"use client";

// Daily challenge card on /kids. Shows 5 items (3 new + 2 review by default)
// for today, deterministic per UTC day. Each item links to the right learning
// surface (alphabet board with letter pre-selected, or surah learn page).

import Link from "next/link";
import { useEffect, useState } from "react";
import { useKids } from "./KidsProvider";

interface DailyItem {
  type: "letter" | "surah";
  key: string;
  label: string;
  ar: string;
  mode: "new" | "review";
}

export function KidDailyChallenge() {
  const { profile } = useKids();
  const [items, setItems] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/kids/daily?profileId=${profile.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (!profile || loading) {
    return (
      <div className="kid-daily kid-daily-skeleton" aria-hidden="true">
        <div className="kid-daily-head">
          <div className="kid-daily-eyebrow">Задание на сегодня</div>
          <div className="kid-daily-title">Готовим…</div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="kid-daily kid-daily-done">
        <div className="kid-daily-head">
          <div className="kid-daily-eyebrow">Задание на сегодня</div>
          <div className="kid-daily-title">МашаАллах — всё сделано!</div>
          <p className="kid-daily-sub">Возвращайся завтра за новым заданием.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kid-daily">
      <div className="kid-daily-head">
        <div className="kid-daily-eyebrow">Задание на сегодня</div>
        <h3 className="kid-daily-title">5 шагов до новой звёздочки</h3>
        <p className="kid-daily-sub">{items.filter(i => i.mode === "new").length} новых · {items.filter(i => i.mode === "review").length} на повторение</p>
      </div>
      <ul className="kid-daily-list">
        {items.map((it, idx) => {
          const href = it.type === "letter"
            ? `/kids/alphabet#${it.key}`
            : `/kids/surahs/${it.key}`;
          return (
            <li key={`${it.type}-${it.key}-${idx}`} className={"kid-daily-item " + it.mode}>
              <Link href={href} className="kid-daily-link">
                <span className="kid-daily-ar" lang="ar">{it.ar}</span>
                <span className="kid-daily-text">
                  <span className="kid-daily-label">{it.label}</span>
                  <span className="kid-daily-mode">{it.mode === "new" ? "новое" : "повтори"}</span>
                </span>
                <svg className="kid-daily-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
