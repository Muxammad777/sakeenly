"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface Letter {
  glyph: string;
  tr: string;
  slug: string; // matches /public/audio/alphabet/{slug}.mp3
}

interface AlphabetGridProps {
  letters: Letter[];
}

export function AlphabetGrid({ letters }: AlphabetGridProps) {
  const t = useTranslations("ka");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = (idx: number, slug: string) => {
    // Stop any currently playing letter first.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(`/audio/alphabet/${slug}.mp3`);
    audioRef.current = audio;
    setPlayingIdx(idx);
    const clear = () => setPlayingIdx((curr) => (curr === idx ? null : curr));
    audio.addEventListener("ended", clear);
    audio.addEventListener("error", clear);
    audio.play().catch(clear);
  };

  return (
    <div className="iqra-grid">
      {letters.map((l, i) => (
        <button
          key={l.slug}
          type="button"
          className={"letter" + (playingIdx === i ? " playing" : "")}
          onClick={() => play(i, l.slug)}
          aria-label={`${t(`l${i + 1}` as `l1`)} — ${l.glyph}`}
        >
          <div className="letter-glyph">{l.glyph}</div>
          <div className="letter-name">{t(`l${i + 1}` as `l1`)}</div>
          <div className="letter-tr">{l.tr}</div>
        </button>
      ))}
    </div>
  );
}
