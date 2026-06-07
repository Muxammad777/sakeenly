"use client";

// ActivityTicker — a marquee strip pinned to the bottom of the hero
// section that scrolls a single continuous string of live platform
// metrics right-to-left, forever. Pulls from /api/stats which is
// cached server-side for 60s. Pauses on hover so a reader can finish
// the line they're looking at. Honours prefers-reduced-motion (renders
// the messages stacked, no animation).

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
    readers: string;
    hifz: string;
    bookmarks: string;
  };
}

function applyTpl(tpl: string, n: number, locale?: string) {
  return tpl.replace(/\{n\}/g, n.toLocaleString(locale ?? undefined));
}

export function ActivityTicker({ labels }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Stats | null) => { if (!cancelled && j) setStats(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!stats) return null;

  const messages = [
    applyTpl(labels.readers, Math.max(1, stats.readers)),
    applyTpl(labels.hifz, stats.hifzMastered),
    applyTpl(labels.bookmarks, stats.bookmarks),
  ];

  // Duplicate the message list so the marquee loop is seamless: as the
  // first copy translates off the left edge, the second copy is already
  // in view filling the space.
  const items = [...messages, ...messages];

  return (
    <div className="activity-ticker" aria-live="polite" aria-label="Sakeenly activity">
      <span className="activity-dot" aria-hidden="true" />
      <div className="activity-track">
        <div className="activity-track-inner">
          {items.map((m, i) => (
            <span key={i} className="activity-item">
              <span>{m}</span>
              <span className="activity-sep" aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
