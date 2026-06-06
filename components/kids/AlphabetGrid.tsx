"use client";

// AlphabetGrid — the 28-letter board on /kids/alphabet.
// Tap a letter card → plays its audio + opens the tracing modal.
// Letters the kid has mastered show a green check, the rest show a soft dot.
// Progress bar at the top reflects the real DB count, not a hardcoded number.

import { useRef, useState } from "react";
import { ARABIC_LETTERS } from "@/lib/kids/letters";
import { useKids } from "./KidsProvider";
import { LetterTrace } from "./LetterTrace";

export function AlphabetGrid() {
  const { letters, mark } = useKids();
  const [active, setActive] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [traceFor, setTraceFor] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playLetter = (idx: number) => {
    const letter = ARABIC_LETTERS[idx];
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    const a = new Audio(`/audio/alphabet/${letter.audio}.mp3`);
    audioRef.current = a;
    setPlayingIdx(idx);
    const clear = () => setPlayingIdx((curr) => (curr === idx ? null : curr));
    a.addEventListener("ended", clear);
    a.addEventListener("error", clear);
    a.play().catch(clear);
  };

  const openLetter = async (idx: number) => {
    const letter = ARABIC_LETTERS[idx];
    setActive(idx);
    playLetter(idx);
    if (!letters.get(letter.slug)) {
      void mark({ type: "letter", key: letter.slug, status: "in_progress" });
    }
  };

  const learnedCount = ARABIC_LETTERS.filter((l) => letters.get(l.slug)?.status === "learned").length;
  const pct = Math.round((learnedCount / ARABIC_LETTERS.length) * 100);

  return (
    <>
      <div className="kid-stat-bar">
        <div className="kid-stat-bar-head">
          <span className="kid-stat-bar-label">Алфавит — твой прогресс</span>
          <span className="kid-stat-bar-val">{learnedCount} / {ARABIC_LETTERS.length}</span>
        </div>
        <div className="kid-stat-bar-track"><div className="kid-stat-bar-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="iqra-grid">
        {ARABIC_LETTERS.map((l, i) => {
          const status = letters.get(l.slug)?.status;
          const isLearned = status === "learned";
          const isStarted = status === "in_progress";
          const isPlaying = playingIdx === i;
          const isActive = active === i;
          return (
            <button
              key={l.slug}
              type="button"
              className={
                "letter" +
                (isPlaying ? " playing" : "") +
                (isActive ? " active" : "") +
                (isLearned ? " learned" : isStarted ? " started" : "")
              }
              onClick={() => openLetter(i)}
              aria-label={`${l.name} — ${l.ar}`}
            >
              <div className="letter-glyph">{l.ar}</div>
              <div className="letter-name">{l.name}</div>
              <div className="letter-tr">{l.tr}</div>
              {isLearned && (
                <svg className="letter-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="kid-cta-row">
        <button
          type="button"
          className="kid-btn kid-btn-primary"
          disabled={active === null}
          onClick={() => active !== null && setTraceFor(active)}
        >
          Обвести букву
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
        <span className="kid-cta-hint">Выбери букву на доске, чтобы услышать и обвести</span>
      </div>

      {traceFor !== null && (
        <LetterTrace
          letter={ARABIC_LETTERS[traceFor]}
          onClose={() => setTraceFor(null)}
        />
      )}
    </>
  );
}
