"use client";

// ActivityTicker — narrow strip under the hero showing live platform
// activity: number of readers, ayat memorised, saved verses. Pulls from
// /api/stats which is cached server-side for 60s.
//
// Three labels rotate one at a time, fading between every 4s.
// Honours prefers-reduced-motion (just shows the first one statically).

import { useEffect, useState } from "react";

interface Stats {
  readers: number;
  hifzMastered: number;
  bookmarks: number;
  lastSurahRead: number | null;
}

interface Props {
  /** Localised label templates with {n} placeholder. */
  labels: {
    readers: string;     // "Сейчас читают: {n} человек"
    hifz: string;        // "Выучено аятов: {n}"
    bookmarks: string;   // "Сохранённых аятов: {n}"
  };
}

function applyTpl(tpl: string, n: number, locale?: string) {
  return tpl.replace(/\{n\}/g, n.toLocaleString(locale ?? undefined));
}

export function ActivityTicker({ labels }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Stats | null) => { if (!cancelled && j) setStats(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % 3), 4000);
    return () => clearInterval(id);
  }, []);

  if (!stats) return null;

  const messages = [
    applyTpl(labels.readers, Math.max(1, stats.readers)),
    applyTpl(labels.hifz, stats.hifzMastered),
    applyTpl(labels.bookmarks, stats.bookmarks),
  ];

  return (
    <div className="activity-ticker" aria-live="polite">
      <span className="activity-dot" aria-hidden="true" />
      <span key={idx} className="activity-text">{messages[idx]}</span>
    </div>
  );
}
