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
type ErrorKind =
  | null
  | "not-allowed"            // user denied or never granted mic permission
  | "no-speech"              // ASR finished without picking up anything
  | "audio-capture"          // no mic / mic broken
  | "network"                // ASR cloud unreachable
  | "language-not-supported" // browser can't ASR Arabic
  | "audio-load"             // reciter mp3 wouldn't play (CORS / 404)
  | "other";

// Fallback chain for Arabic locale codes — different browsers/OS
// accept different ones. Try the most specific first.
const ARABIC_LANGS = ["ar-SA", "ar-EG", "ar-AE", "ar"];

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
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => { setSupported(getRecognitionCtor() !== null); }, []);
  useEffect(() => {
    setResult(null); setTranscript(""); setPhase("idle"); setErrorKind(null);
  }, [ayahKey]);
  useEffect(() => () => {
    audioRef.current?.pause();
    try { recognitionRef.current?.abort(); } catch {}
  }, []);

  // Pre-flight mic permission probe — quick non-blocking check so we
  // can render a helpful CTA before the user even hits Play if they've
  // previously denied. Permissions API: present in Chrome/Edge; Safari
  // throws on the 'microphone' name, so swallow.
  const probeMicrophone = async (): Promise<"granted" | "prompt" | "denied" | "unknown"> => {
    if (typeof navigator === "undefined" || !navigator.permissions) return "unknown";
    try {
      const res = await navigator.permissions.query({ name: "microphone" as PermissionName });
      return res.state as "granted" | "prompt" | "denied";
    } catch {
      return "unknown";
    }
  };

  const start = async () => {
    if (!supported) return;
    // Allow restart from 'done' (the "↻ ещё раз" path). Block only when
    // we're actively in the middle of audio playback or live ASR.
    if (phase === "listening_to_audio" || phase === "listening_for_voice") return;
    setResult(null);
    setTranscript("");
    setErrorKind(null);
    // Make sure any prior recognition is fully released before we
    // construct a new one — Chrome occasionally rejects rec.start()
    // with InvalidStateError when an old instance is still tearing down.
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;

    // If we already know the user denied, skip the audio playback —
    // the ASR step would just fail again. Surface the CTA immediately.
    const perm = await probeMicrophone();
    if (perm === "denied") { setErrorKind("not-allowed"); setPhase("done"); return; }

    if (audioUrl) {
      const url = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;
      const audio = new Audio(url);
      audioRef.current = audio;
      setPhase("listening_to_audio");
      audio.addEventListener("ended", () => beginListening(), { once: true });
      // Surface audio errors instead of hanging forever in 'listening_to_audio'.
      audio.addEventListener("error", () => {
        console.error("[hifz] audio failed to play:", url, audio.error);
        setErrorKind("audio-load");
        setPhase("done");
      }, { once: true });
      try {
        await audio.play();
      } catch (err) {
        console.error("[hifz] audio.play() rejected:", err);
        // Most likely autoplay-blocked or CORS. Skip straight to ASR
        // — the user can still recite without hearing first.
        beginListening();
      }
    } else {
      beginListening();
    }
  };

  // langIndex lets us retry with a different Arabic locale code if the
  // browser rejected the first one (some Chrome installs don't ship
  // ar-SA but accept plain 'ar').
  const beginListening = (langIndex = 0) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = ARABIC_LANGS[langIndex] ?? "ar";
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
      // Log everything so we can debug from a user's console.
      console.error("[hifz] speech-recognition error:", e.error, "lang=", rec.lang);
      switch (e.error) {
        case "not-allowed":
        case "service-not-allowed":
          setErrorKind("not-allowed"); break;
        case "no-speech":
          setErrorKind("no-speech"); break;
        case "audio-capture":
          setErrorKind("audio-capture"); break;
        case "network":
          setErrorKind("network"); break;
        case "language-not-supported":
        case "bad-grammar":
          // Try the next fallback Arabic code if any remain.
          if (langIndex + 1 < ARABIC_LANGS.length) {
            setTimeout(() => beginListening(langIndex + 1), 0);
            return;
          }
          setErrorKind("language-not-supported");
          break;
        case "aborted":
          // User stopped manually — leave error null.
          break;
        default:
          setErrorKind("other");
      }
    };
    rec.onend = () => {
      setPhase("done");
      const finalText = captured.trim();
      if (finalText) {
        const cmp = compareRecitation(textUthmani, finalText);
        setResult(cmp);
      } else if (!errorKind) {
        // Recognition ended cleanly but heard nothing — show the same
        // "no speech" hint we'd show on the explicit error code.
        setErrorKind("no-speech");
      }
    };
    recognitionRef.current = rec;
    setPhase("listening_for_voice");
    try { rec.start(); }
    catch (err) {
      console.error("[hifz] rec.start() threw:", err);
      setErrorKind("other");
      setPhase("done");
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
  };

  if (!supported) {
    return (
      <div className="hifz-lr-unsupported">
        {t("learn_listen_recite")}: браузер не поддерживает распознавание речи. Попробуй Chrome или Edge.
      </div>
    );
  }

  const errorMessage = (() => {
    switch (errorKind) {
      case "not-allowed":
        return "🎙 Микрофон выключен. Разреши доступ в иконке слева от адреса браузера, потом попробуй снова.";
      case "audio-capture":
        return "🎙 Микрофон не найден. Проверь подключение.";
      case "no-speech":
        return "Я ничего не услышал — попробуй снова, говори громче.";
      case "network":
        return "Сеть недоступна — распознавание речи требует интернета.";
      case "language-not-supported":
        return "Этот браузер не умеет распознавать арабский. Попробуй Chrome последней версии на macOS/Windows или Android Chrome.";
      case "audio-load":
        return "Не удалось загрузить аудио чтеца. Пропусти проигрывание — нажми ещё раз, я сразу начну слушать.";
      case "other":
        return "Не удалось запустить распознавание. Открой консоль (F12) — там увидишь, что именно браузер вернул, и пришли мне.";
      default:
        return null;
    }
  })();

  return (
    <div className="hifz-lr">
      <div className="hifz-lr-bar">
        <button
          type="button"
          className={"hifz-control-btn hifz-control-primary" + (phase === "listening_for_voice" ? " is-recording" : "")}
          onClick={phase === "listening_for_voice" ? stopListening : () => void start()}
          disabled={phase === "listening_to_audio"}
        >
          {phase === "idle" && t("learn_listen_recite")}
          {phase === "listening_to_audio" && <>♪ <span className="hifz-lr-hint">чтец читает…</span></>}
          {phase === "listening_for_voice" && <><span className="hifz-lr-rec-dot" /> говори · нажми чтобы остановить</>}
          {phase === "done" && "↻ ещё раз"}
        </button>
        {result && (
          <span className="hifz-lr-score" data-good={result.similarity >= 0.8}>
            {Math.round(result.similarity * 100)}%
          </span>
        )}
      </div>
      {errorMessage && (
        <div className="hifz-lr-error">{errorMessage}</div>
      )}
      {result && result.actualTokens.length > 0 && (
        <div className="hifz-lr-words" dir="rtl">
          {result.expectedTokens.map((tok, i) => (
            <span
              key={i}
              className={"hifz-lr-tok " + (result.matched[i] ? "is-hit" : "is-miss")}
              title={result.expectedNorm[i]}
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
