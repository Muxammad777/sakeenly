"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface Letter {
  glyph: string;
  tr: string;
}

interface AlphabetGridProps {
  letters: Letter[];
}

export function AlphabetGrid({ letters }: AlphabetGridProps) {
  const t = useTranslations("ka");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [arVoice, setArVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Saudi or Egyptian Arabic, fall back to any ar-*
      const preferred =
        voices.find((v) => v.lang === "ar-SA") ??
        voices.find((v) => v.lang === "ar-EG") ??
        voices.find((v) => v.lang.startsWith("ar")) ??
        null;
      setArVoice(preferred);
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (idx: number, glyph: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(glyph);
    u.lang = arVoice?.lang ?? "ar-SA";
    if (arVoice) u.voice = arVoice;
    u.rate = 0.7;
    u.pitch = 1;
    u.onend = () => setPlayingIdx((curr) => (curr === idx ? null : curr));
    u.onerror = () => setPlayingIdx((curr) => (curr === idx ? null : curr));
    utteranceRef.current = u;
    setPlayingIdx(idx);
    window.speechSynthesis.speak(u);
  };

  return (
    <>
      {supported && !arVoice ? (
        <div
          style={{
            margin: "0 0 18px",
            padding: "10px 14px",
            borderRadius: 12,
            background: "color-mix(in oklab, oklch(var(--accent)) 8%, transparent)",
            border: "1px solid color-mix(in oklab, oklch(var(--accent)) 30%, oklch(var(--border)))",
            color: "oklch(var(--text-2))",
            fontSize: 13,
          }}
        >
          {t("voice_missing")}
        </div>
      ) : null}
      <div className="iqra-grid">
        {letters.map((l, i) => (
          <button
            key={i}
            type="button"
            className={"letter" + (playingIdx === i ? " playing" : "")}
            onClick={() => speak(i, l.glyph)}
            aria-label={`${t(`l${i + 1}` as `l1`)} — ${l.glyph}`}
            disabled={!supported}
          >
            <div className="letter-glyph">{l.glyph}</div>
            <div className="letter-name">{t(`l${i + 1}` as `l1`)}</div>
            <div className="letter-tr">{l.tr}</div>
          </button>
        ))}
      </div>
    </>
  );
}
