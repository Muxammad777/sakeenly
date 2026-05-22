"use client";

import { useState, useEffect } from "react";

/** VOTD play/bookmark + extra controls — interactive bits at the bottom of the VOTD card. */
export function HomeVotd() {
  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <div className="votd-controls">
      <button
        className={`ic-btn ${playing ? "active" : ""}`}
        title="Слушать"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <button className={`ic-btn ${bookmarked ? "active" : ""}`} title="Закладка" onClick={() => setBookmarked((b) => !b)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
      <button className="ic-btn" title="Перевод">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h7M9 3v2c0 4-2 7-7 8M5 9c0 4 4 8 9 9M14 22l4-9 4 9M15 19h6"/></svg>
      </button>
      <button className="ic-btn" title="Поделиться">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
      </button>
      <button className="ic-btn" title="Открыть в ридере">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z"/></svg>
      </button>
    </div>
  );
}

/** Animated streak number — counts up from 0 to 17 on mount. */
export function HomeStreak() {
  const target = 17;
  const [n, setN] = useState(0);
  useEffect(() => {
    const step = Math.max(1, Math.round(target / 24));
    const id = setInterval(() => {
      setN((cur) => {
        const next = cur + step;
        if (next >= target) { clearInterval(id); return target; }
        return next;
      });
    }, 32);
    return () => clearInterval(id);
  }, []);
  return <div className="streak-num">{n}</div>;
}
