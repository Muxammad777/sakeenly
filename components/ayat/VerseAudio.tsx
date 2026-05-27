"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface VerseAudioProps {
  url: string;
}

/** Audio play button styled as `.btn .btn-soft .btn-sm` — matches design preview ayat-cards. */
export function VerseAudio({ url }: VerseAudioProps) {
  const t = useTranslations("rd");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const toggle = () => {
    let a = audioRef.current;
    if (!a) {
      a = new Audio(url);
      audioRef.current = a;
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("playing", () => setPlaying(true));
    }
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  return (
    <button type="button" className="btn btn-soft btn-sm" onClick={toggle}>
      {playing ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      )}
      {playing ? t("pop_pause") : t("pop_listen")}
    </button>
  );
}
