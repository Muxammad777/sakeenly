"use client";

// ActivityTicker — premium marquee strip pinned to the bottom of the
// hero. Pulls 3 live metrics from /api/stats (cached 60s) and scrolls
// them right-to-left in one seamless loop. Pauses on hover so a reader
// can finish the line. Honours prefers-reduced-motion (renders the
// three messages as a static centred row, no animation).

import { useEffect, useState } from "react";

interface Stats {
  readers: number;
  hifzMastered: number;
  bookmarks: number;
  lastSurahRead: number | null;
}

interface Props {
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

  // Exactly the three messages requested — no extras, no fillers.
  const messages = [
    applyTpl(labels.readers, Math.max(1, stats.readers)),
    applyTpl(labels.hifz, stats.hifzMastered),
    applyTpl(labels.bookmarks, stats.bookmarks),
  ];

  // The marquee track has to render TWO copies of the message list back-
  // to-back so the translateX(-50%) loop is seamless (when the first copy
  // has scrolled fully off-screen the second copy is exactly in the spot
  // the first copy started). The user perceives a single continuous strip
  // because the loop point is mid-message, never at a visible "reset".
  const copies = [messages, messages];

  return (
    <div className="activity-ticker" aria-live="polite" aria-label="Sakeenly activity">
      <span className="activity-dot" aria-hidden="true" />
      <div className="activity-track">
        <div className="activity-track-inner">
          {copies.map((set, copyIdx) => (
            <div className="activity-set" key={copyIdx} aria-hidden={copyIdx === 1 ? "true" : undefined}>
              {set.map((m, i) => (
                <span key={i} className="activity-item">
                  <span className="activity-text">{m}</span>
                  {i < set.length - 1 && <span className="activity-sep" aria-hidden="true">✦</span>}
                </span>
              ))}
              {/* trailing separator joins this set to the next copy so the
                  pattern never breaks at the loop boundary */}
              <span className="activity-sep" aria-hidden="true">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
