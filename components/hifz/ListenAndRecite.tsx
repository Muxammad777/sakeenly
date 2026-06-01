"use client";

// Listen-then-recite for hifz, browser-agnostic edition.
//
// Old approach used Web Speech API (SpeechRecognition) — that's
// Google-Cloud-Speech-only and silently fails on Yandex / Brave /
// Edge / Opera for Arabic. The new flow:
//
//   1. Reciter plays the ayah (no change).
//   2. We start MediaRecorder — works in every browser that supports
//      mic input at all (Chrome/Firefox/Safari/Edge/Yandex/Brave/Opera).
//   3. On stop we POST the webm/ogg blob to /api/hifz/asr → Whisper
//      → returns Arabic transcript.
//   4. compareRecitation aligns the transcript against the ayah text;
//      per-word green/red highlight + similarity %.

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compareRecitation, normalizeArabic, type CompareResult } from "@/lib/hifz/arabic-compare";

interface Props {
  ayahKey: string;
  textUthmani: string;
  audioUrl: string | null;
}

type Phase = "idle" | "listening_to_audio" | "recording" | "transcribing" | "done";
type ErrorKind =
  | null
  | "not-allowed"
  | "no-microphone"
  | "mediarecorder-unsupported"
  | "audio-load"
  | "asr-not-configured"
  | "asr-failed"
  | "no-speech"
  | "other";

export function ListenAndRecite({ ayahKey, textUthmani, audioUrl }: Props) {
  const t = useTranslations("hf");
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setResult(null); setTranscript(""); setPhase("idle"); setErrorKind(null);
  }, [ayahKey]);

  useEffect(() => () => {
    audioRef.current?.pause();
    cleanupRecorder();
  }, []);

  const cleanupRecorder = () => {
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    try { recorderRef.current?.stop(); } catch {}
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    chunksRef.current = [];
  };

  const start = async () => {
    if (phase !== "idle" && phase !== "done") return;
    setResult(null);
    setTranscript("");
    setErrorKind(null);

    if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
      setErrorKind("mediarecorder-unsupported");
      setPhase("done");
      return;
    }

    if (audioUrl) {
      const url = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;
      const audio = new Audio(url);
      audioRef.current = audio;
      setPhase("listening_to_audio");
      audio.addEventListener("ended", () => void beginRecording(), { once: true });
      audio.addEventListener("error", () => {
        console.error("[hifz] audio failed:", url, audio.error);
        setErrorKind("audio-load");
        setPhase("done");
      }, { once: true });
      try {
        await audio.play();
      } catch (err) {
        console.error("[hifz] audio.play rejected:", err);
        void beginRecording();
      }
    } else {
      void beginRecording();
    }
  };

  const beginRecording = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string }).name ?? "";
      console.error("[hifz] getUserMedia failed:", name, err);
      if (name === "NotAllowedError" || name === "SecurityError") setErrorKind("not-allowed");
      else if (name === "NotFoundError" || name === "OverconstrainedError") setErrorKind("no-microphone");
      else setErrorKind("other");
      setPhase("done");
      return;
    }
    streamRef.current = stream;

    // Pick a MIME type the browser supports. Chrome → webm/opus,
    // Safari → mp4. Whisper accepts both.
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    const mime = candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? "";
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    recorderRef.current = rec;
    chunksRef.current = [];

    rec.addEventListener("dataavailable", (e: BlobEvent) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    });
    rec.addEventListener("stop", () => void onRecordingStopped(mime));
    rec.start();
    setPhase("recording");

    // Safety cap — auto-stop after 20s so we never leak a recorder.
    stopTimerRef.current = window.setTimeout(() => {
      try { rec.stop(); } catch {}
    }, 20_000);
  };

  const onRecordingStopped = async (mime: string) => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }

    const chunks = chunksRef.current;
    chunksRef.current = [];
    if (chunks.length === 0) {
      setErrorKind("no-speech");
      setPhase("done");
      return;
    }
    const blob = new Blob(chunks, { type: mime || "audio/webm" });
    setPhase("transcribing");
    try {
      const fd = new FormData();
      const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
      fd.append("audio", blob, `recite.${ext}`);
      fd.append("lang", "ar");
      const res = await fetch("/api/hifz/asr", { method: "POST", body: fd });
      if (res.status === 501) { setErrorKind("asr-not-configured"); setPhase("done"); return; }
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[hifz] /api/hifz/asr failed:", res.status, detail);
        setErrorKind("asr-failed");
        setPhase("done");
        return;
      }
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      setTranscript(text);
      if (!text) {
        setErrorKind("no-speech");
      } else {
        setResult(compareRecitation(textUthmani, text));
      }
      setPhase("done");
    } catch (err) {
      console.error("[hifz] asr request error:", err);
      setErrorKind("asr-failed");
      setPhase("done");
    }
  };

  const stopRecording = () => {
    try { recorderRef.current?.stop(); } catch {}
  };

  const errorMessage = (() => {
    switch (errorKind) {
      case "not-allowed":
        return "🎙 Микрофон не разрешён. Нажми на иконку слева от адреса браузера → разреши микрофон.";
      case "no-microphone":
        return "🎙 Микрофон не найден. Проверь подключение.";
      case "mediarecorder-unsupported":
        return "Твой браузер не поддерживает запись звука. Обнови или попробуй другой.";
      case "audio-load":
        return "Не удалось загрузить аудио чтеца. Пропусти и сразу диктуй.";
      case "asr-not-configured":
        return "Сервер не настроен для распознавания. Добавь OPENAI_API_KEY в Railway env.";
      case "asr-failed":
        return "Не удалось распознать речь. Попробуй ещё раз — говори чётче.";
      case "no-speech":
        return "Я ничего не услышал. Попробуй снова, говори громче.";
      case "other":
        return "Не получилось. Открой консоль (F12) — там лог [hifz], пришли мне.";
      default:
        return null;
    }
  })();

  return (
    <div className="hifz-lr">
      <div className="hifz-lr-bar">
        <button
          type="button"
          className={"hifz-control-btn hifz-control-primary" + (phase === "recording" ? " is-recording" : "")}
          onClick={phase === "recording" ? stopRecording : () => void start()}
          disabled={phase === "listening_to_audio" || phase === "transcribing"}
        >
          {phase === "idle" && t("learn_listen_recite")}
          {phase === "listening_to_audio" && <>♪ <span className="hifz-lr-hint">чтец читает…</span></>}
          {phase === "recording" && <><span className="hifz-lr-rec-dot" /> говори · нажми чтобы остановить</>}
          {phase === "transcribing" && <>⏳ <span className="hifz-lr-hint">распознаю…</span></>}
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
      {transcript && !result && !errorMessage && (
        <div className="hifz-lr-tx" dir="rtl">{normalizeArabic(transcript)}</div>
      )}
    </div>
  );
}
