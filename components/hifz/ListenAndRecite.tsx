"use client";

// Listen-then-recite for hifz.
//
// Flow:
//   1. user clicks "Слушать" → reciter plays the ayah
//   2. on audio end → ASR starts listening for ~12s (ar-SA)
//   3. user recites the ayah from memory
//   4. ASR transcript is compared to the expected text via compareRecitation
//   5. each word lights up green (matched) or red (missed)
//   6. similarity score displayed; user can retry
//
// Web Speech API is webkit-only in Safari and not in Firefox; we degrade
// gracefully with a "браузер не поддерживает" message rather than fail.

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compareRecitation, normalizeArabic, type CompareResult } from "@/lib/hifz/arabic-compare";

interface Props {
  ayahKey: string;
  textUthmani: string;
  audioUrl: string | null;
}

type Phase = "idle" | "listening_to_audio" | "listening_for_voice" | "done";

// Minimal subset of the Web Speech API surface we use. The full DOM
// types aren't shipped in lib.dom yet for SpeechRecognition.
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
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function ListenAndRecite({ ayahKey, textUthmani, audioUrl }: Props) {
  const t = useTranslations("hf");
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => { setSupported(getRecognitionCtor() !== null); }, []);
  useEffect(() => { setResult(null); setTranscript(""); setPhase("idle"); }, [ayahKey]);
  useEffect(() => () => {
    audioRef.current?.pause();
    try { recognitionRef.current?.abort(); } catch {}
  }, []);

  const start = () => {
    if (!supported || phase !== "idle") return;
    setResult(null);
    setTranscript("");
    if (audioUrl) {
      const url = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;
      const audio = new Audio(url);
      audioRef.current = audio;
      setPhase("listening_to_audio");
      audio.addEventListener("ended", () => beginListening(), { once: true });
      void audio.play();
    } else {
      beginListening();
    }
  };

  const beginListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "ar-SA";
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
    rec.onerror = () => { setPhase("done"); };
    rec.onend = () => {
      setPhase("done");
      const cmp = compareRecitation(textUthmani, captured.trim());
      setResult(cmp);
    };
    recognitionRef.current = rec;
    setPhase("listening_for_voice");
    try { rec.start(); } catch { setPhase("done"); }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
  };

  if (!supported) {
    return (
      <div className="hifz-lr-unsupported">
        {t("learn_listen_recite")}: browser ASR unsupported (try Chrome).
      </div>
    );
  }

  return (
    <div className="hifz-lr">
      <div className="hifz-lr-bar">
        <button
          type="button"
          className="hifz-control-btn hifz-control-primary"
          onClick={phase === "listening_for_voice" ? stopListening : start}
          disabled={phase === "listening_to_audio"}
        >
          {phase === "idle" ? t("learn_listen_recite") :
           phase === "listening_to_audio" ? "♪" :
           phase === "listening_for_voice" ? "● stop" :
           "↻"}
        </button>
        {result && (
          <span className="hifz-lr-score" data-good={result.similarity >= 0.8}>
            {Math.round(result.similarity * 100)}%
          </span>
        )}
      </div>
      {result && (
        <div className="hifz-lr-words" dir="rtl">
          {result.expectedTokens.map((tok, i) => (
            <span
              key={i}
              className={"hifz-lr-tok " + (result.matched[i] ? "is-hit" : "is-miss")}
            >{tok}</span>
          ))}
        </div>
      )}
      {transcript && !result && (
        <div className="hifz-lr-tx" dir="rtl">{normalizeArabic(transcript)}</div>
      )}
    </div>
  );
}
