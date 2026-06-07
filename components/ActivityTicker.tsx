"use client";

// ActivityTicker — premium marquee strip pinned to the bottom of the
// hero. Pulls 3 live metrics from /api/stats (cached 60s) and scrolls
// them right-to-left in one seamless loop.
//
// Implementation note (this is the part that matters):
//   To get a TRUE seamless infinite loop with no gaps the track must
//   always be at least 2 × viewport wide. We measure the natural width
//   of ONE copy of the messages once on mount, then render exactly as
//   many copies as we need to comfortably exceed 2 × viewport (minimum
//   4, capped at 16). The CSS keyframes then translateX from 0 to
//   `-100% / count` — i.e. exactly one copy. When the loop resets back
//   to 0 the visual position is identical because the next copy has
//   slid into the previous copy's spot. No flash, no jump, no gap.

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

// useLayoutEffect on the client, plain useEffect during SSR — avoids the
// React warning while still measuring before paint where possible.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ActivityTicker({ labels }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [copyCount, setCopyCount] = useState(4);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Stats | null) => { if (!cancelled && j) setStats(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Measure one copy of the messages and decide how many to render so
  // the total track is comfortably wider than 2× viewport.
  useIsoLayoutEffect(() => {
    if (!stats) return;
    const recompute = () => {
      const oneCopyWidth = measureRef.current?.scrollWidth ?? 0;
      const viewport = window.innerWidth;
      if (oneCopyWidth <= 0) return;
      // We want total width ≥ 2× viewport so the -100%/N translate is
      // always seamless. Add 1 extra copy as a safety margin.
      const needed = Math.ceil((viewport * 2) / oneCopyWidth) + 1;
      setCopyCount(Math.max(4, Math.min(16, needed)));
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [stats]);

  if (!stats) {
    return <div className="activity-ticker activity-ticker-skeleton" aria-hidden="true" />;
  }

  // Exactly the three messages requested — no extras, no fillers.
  const messages = [
    applyTpl(labels.readers, Math.max(1, stats.readers)),
    applyTpl(labels.hifz, stats.hifzMastered),
    applyTpl(labels.bookmarks, stats.bookmarks),
  ];

  // One "copy" = these three messages with a trailing separator that
  // bridges into the next copy.
  const renderCopy = (key: string | number, hidden = false) => (
    <div className="activity-set" key={key} aria-hidden={hidden || undefined}>
      {messages.map((m, i) => (
        <span key={i} className="activity-item">
          <span className="activity-text">{m}</span>
          {i < messages.length - 1 && <span className="activity-sep" aria-hidden="true">✦</span>}
        </span>
      ))}
      <span className="activity-sep" aria-hidden="true">✦</span>
    </div>
  );

  return (
    <div className="activity-ticker" aria-live="polite" aria-label="Sakeenly activity">
      <span className="activity-dot" aria-hidden="true" />
      <div className="activity-track">
        <div
          ref={trackRef}
          className="activity-track-inner"
          style={{ ["--ticker-copies" as string]: String(copyCount) }}
        >
          {/* Off-screen measurement node — invisible, just lets us read
              the natural width of one copy without affecting layout. */}
          <div
            ref={measureRef}
            aria-hidden="true"
            style={{ position: "absolute", top: 0, left: 0, visibility: "hidden", pointerEvents: "none" }}
          >
            {renderCopy("measure", true)}
          </div>
          {Array.from({ length: copyCount }, (_, i) => renderCopy(i, i > 0))}
        </div>
      </div>
    </div>
  );
}
