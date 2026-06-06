"use client";

// LetterTrace — finger-drawing canvas with a ghosted target glyph
// behind it. Renders a "Готово" button that scores the trace and (if
// passing) marks the letter as learned. Audio of the letter plays when
// the modal opens so the kid hears it first.

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArabicLetter } from "@/lib/kids/letters";
import { buildLetterMask, scoreTracing, TRACING_PASS_SCORE } from "@/lib/kids/tracing";
import { useKids } from "./KidsProvider";

interface Props {
  letter: ArabicLetter;
  onClose: () => void;
}

const CANVAS_SIZE = 320;

export function LetterTrace({ letter, onClose }: Props) {
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const kidRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [played, setPlayed] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const { mark } = useKids();

  // Build the mask once we have the canvas.
  useEffect(() => {
    const mask = maskRef.current;
    const kid = kidRef.current;
    if (!mask || !kid) return;
    mask.width = CANVAS_SIZE;
    mask.height = CANVAS_SIZE;
    kid.width = CANVAS_SIZE;
    kid.height = CANVAS_SIZE;
    buildLetterMask(mask, letter.ar);
  }, [letter.ar]);

  const playAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    const a = new Audio(`/audio/alphabet/${letter.audio}.mp3`);
    audioRef.current = a;
    setPlayed(true);
    a.play().catch(() => {});
  }, [letter.audio]);

  // Auto-play once when modal opens.
  useEffect(() => {
    playAudio();
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, [playAudio]);

  const clearKidCanvas = useCallback(() => {
    const c = kidRef.current; if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    setResult(null);
  }, []);

  const drawAt = (e: React.PointerEvent<HTMLCanvasElement>, start: boolean) => {
    const c = kidRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (c.width / rect.width);
    const y = (e.clientY - rect.top) * (c.height / rect.height);
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(244, 122, 91, 0.92)";
    if (start) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setHasInk(true);
  };

  const submit = async () => {
    const mask = maskRef.current; const kid = kidRef.current;
    if (!mask || !kid || busy) return;
    setBusy(true);
    const built = buildLetterMask(mask, letter.ar);
    const res = scoreTracing(built, kid);
    const passed = res.score >= TRACING_PASS_SCORE && res.kidPixels > 200;
    setResult({ score: res.score, passed });
    if (passed) {
      try {
        await mark({
          type: "letter",
          key: letter.slug,
          status: "learned",
          traceScore: res.score,
        });
      } catch {/* swallow — UI already shows passed */}
    }
    setBusy(false);
  };

  return (
    <div className="kid-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kid-modal-card">
        <header className="kid-modal-head">
          <div>
            <div className="kid-modal-eyebrow">Обведи букву</div>
            <h3 className="kid-modal-title">{letter.name} <span className="kid-modal-ar" lang="ar">{letter.ar}</span></h3>
          </div>
          <button type="button" className="kid-modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>

        <div className="kid-trace-stage">
          <canvas ref={maskRef} className="kid-trace-mask" aria-hidden="true" />
          <canvas
            ref={kidRef}
            className="kid-trace-ink"
            onPointerDown={(e) => { drawing.current = true; (e.target as Element).setPointerCapture(e.pointerId); drawAt(e, true); }}
            onPointerMove={(e) => { if (drawing.current) drawAt(e, false); }}
            onPointerUp={() => { drawing.current = false; }}
            onPointerCancel={() => { drawing.current = false; }}
          />
        </div>

        <div className="kid-modal-actions">
          <button type="button" className="kid-btn kid-btn-ghost" onClick={playAudio}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 9v6h4l5 4V5L9 9H5z"/><path d="M16 8a5 5 0 010 8" strokeLinecap="round"/></svg>
            <span>{played ? "Повторить" : "Послушать"}</span>
          </button>
          <button type="button" className="kid-btn kid-btn-ghost" onClick={clearKidCanvas} disabled={!hasInk}>Стереть</button>
          <button type="button" className="kid-btn kid-btn-primary" onClick={submit} disabled={!hasInk || busy}>
            {busy ? "…" : result?.passed ? "Молодец!" : "Готово"}
          </button>
        </div>

        {result && (
          <div className={"kid-trace-feedback" + (result.passed ? " ok" : " retry")}>
            {result.passed
              ? <>МашаАллах! {result.score}/100 — буква выучена.</>
              : <>Почти получилось — {result.score}/100. Попробуй ещё раз, пройдись точно по буковке.</>
            }
          </div>
        )}
      </div>
    </div>
  );
}
