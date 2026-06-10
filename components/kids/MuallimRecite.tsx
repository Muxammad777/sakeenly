"use client";

// MuallimRecite — single-phrase recite-and-grade widget for the Muallim
// Sani lessons. Inspired by HifzListenAndRecite but stripped down: there
// is no reciter audio to play first (the lesson examples are short
// syllables/words, not full ayat), so the user goes straight from
// idle → recording → graded.
//
// The grading reuses `compareRecitation` so the same word-by-word
// red/green diff appears here as in the hifz reader.

import { useEffect, useRef, useState } from "react";
import { compareRecitation, type CompareResult } from "@/lib/hifz/arabic-compare";

interface Props {
  /** Arabic phrase the child is expected to say. */
  textUthmani: string;
  /** Optional latin transliteration shown above the mic button. */
  transliteration?: string;
  /** Optional hint string (Russian) shown next to the phrase. */
  hint?: string;
  /** Labels — every string passed in so the parent owns i18n. */
  labels: {
    btnIdle: string;        // "Произнеси сам"
    btnRecording: string;   // "Говори · нажми чтобы остановить"
    btnDone: string;        // "↻ ещё раз"
    unsupported: string;    // browser doesn't support ASR
    errNotAllowed: string;
    errNoSpeech: string;
    errAudioCapture: string;
    errNetwork: string;
    errLangUnsupported: string;
    errOther: string;
  };
}

type Phase = "idle" | "recording" | "done";
type ErrorKind = null | "not-allowed" | "no-speech" | "audio-capture" | "network" | "language-not-supported" | "other";

const ARABIC_LANGS = ["ar-SA", "ar-EG", "ar-AE", "ar"];

interface SpeechRecognitionResult { 0: { transcript: string }; isFinal: boolean }
interface SpeechRecognitionEvent { results: ArrayLike<SpeechRecognitionResult> }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function MuallimRecite({ textUthmani, transliteration, hint, labels }: Props) {
  const [supported, setSupported] = useState<boolean>(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(Boolean(W.SpeechRecognition ?? W.webkitSpeechRecognition));
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  const beginListening = (langIndex = 0) => {
    setErrorKind(null);
    setResult(null);
    setTranscript("");

    const W = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }

    const rec = new Ctor();
    rec.lang = ARABIC_LANGS[langIndex];
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    let captured = "";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) captured += " " + r[0].transcript;
      }
      setTranscript(captured.trim());
    };
    rec.onerror = (e: { error?: string }) => {
      console.error("[muallim] speech-recognition error:", e.error, "lang=", rec.lang);
      switch (e.error) {
        case "not-allowed":
        case "service-not-allowed":  setErrorKind("not-allowed"); break;
        case "no-speech":            setErrorKind("no-speech"); break;
        case "audio-capture":        setErrorKind("audio-capture"); break;
        case "network":              setErrorKind("network"); break;
        case "language-not-supported":
        case "bad-grammar":
          if (langIndex + 1 < ARABIC_LANGS.length) {
            setTimeout(() => beginListening(langIndex + 1), 0);
            return;
          }
          setErrorKind("language-not-supported");
          break;
        case "aborted":              break;
        default:                     setErrorKind("other");
      }
    };
    rec.onend = () => {
      setPhase("done");
      const finalText = captured.trim();
      if (finalText) {
        setResult(compareRecitation(textUthmani, finalText));
      } else if (!errorKind) {
        setErrorKind("no-speech");
      }
    };
    recognitionRef.current = rec;
    setPhase("recording");
    try { rec.start(); }
    catch (err) { console.error("[muallim] rec.start() threw:", err); setErrorKind("other"); setPhase("done"); }
  };

  const stop = () => { try { recognitionRef.current?.stop(); } catch { /* noop */ } };

  if (!supported) {
    return <div className="muallim-recite muallim-recite-unsupported">{labels.unsupported}</div>;
  }

  const errorMessage = (() => {
    switch (errorKind) {
      case "not-allowed":            return labels.errNotAllowed;
      case "no-speech":              return labels.errNoSpeech;
      case "audio-capture":          return labels.errAudioCapture;
      case "network":                return labels.errNetwork;
      case "language-not-supported": return labels.errLangUnsupported;
      case "other":                  return labels.errOther;
      default: return null;
    }
  })();

  return (
    <div className="muallim-recite">
      <div className="muallim-recite-phrase" lang="ar" dir="rtl">{textUthmani}</div>
      {transliteration && <div className="muallim-recite-tr">{transliteration}</div>}
      {hint && <div className="muallim-recite-hint">{hint}</div>}

      <div className="muallim-recite-bar">
        <button
          type="button"
          className={"muallim-mic-btn" + (phase === "recording" ? " is-recording" : "")}
          onClick={phase === "recording" ? stop : () => beginListening(0)}
        >
          {phase === "idle" && (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
                <path d="M12 18v3"/>
              </svg>
              <span>{labels.btnIdle}</span>
            </>
          )}
          {phase === "recording" && (
            <>
              <span className="muallim-rec-dot" />
              <span>{labels.btnRecording}</span>
            </>
          )}
          {phase === "done" && (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <path d="M21 4v5h-5"/>
              </svg>
              <span>{labels.btnDone}</span>
            </>
          )}
        </button>
        {result && (
          <span className="muallim-recite-score" data-good={result.similarity >= 0.8}>
            {Math.round(result.similarity * 100)}%
          </span>
        )}
      </div>
      {errorMessage && <div className="muallim-recite-error">{errorMessage}</div>}
      {result && (
        <div className="muallim-recite-words" dir="rtl">
          {result.expectedTokens.map((tok, i) => (
            <span key={i} className={"muallim-tok " + (result.matched[i] ? "is-hit" : "is-miss")} title={tok}>{tok}</span>
          ))}
        </div>
      )}
      {transcript && phase === "done" && (
        <div className="muallim-recite-heard">{transcript}</div>
      )}
    </div>
  );
}
