"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface HifzLearnAyah {
  ayahKey: string;
  surah: number;
  ayah: number;
  textUthmani: string;
  audioUrl: string | null;
}

interface Props {
  ayat: HifzLearnAyah[];
  surahName: string;
  surahNameArabic: string;
}

type HideStage = 0 | 1 | 2 | 3;

// Render the ayah text per current hide stage. Stage 0 = full text,
// 1 = hide last word, 2 = first letters only, 3 = full blur.
function renderHidden(text: string, stage: HideStage): React.ReactNode {
  if (stage === 0) return text;
  if (stage === 3) {
    return <span className="hifz-ayah-blind">{text}</span>;
  }
  // Token-level split. Arabic words separated by whitespace.
  const tokens = text.split(/\s+/);
  if (stage === 1) {
    // Hide every 4th word + the trailing tail (rough proxy for "last words").
    return tokens.map((tok, i) => {
      const hide = i >= Math.max(0, tokens.length - Math.ceil(tokens.length / 4));
      return (
        <span key={i}>
          {hide ? <span className="hifz-ayah-blind">{tok}</span> : tok}
          {i < tokens.length - 1 ? " " : ""}
        </span>
      );
    });
  }
  // Stage 2 — show only the first letter of each token.
  return tokens.map((tok, i) => {
    const first = Array.from(tok)[0] ?? "";
    return (
      <span key={i}>
        <span>{first}</span>
        <span className="hifz-ayah-blind">{tok.slice(first.length)}</span>
        {i < tokens.length - 1 ? " " : ""}
      </span>
    );
  });
}

export function HifzLearnClient({ ayat, surahName, surahNameArabic }: Props) {
  const t = useTranslations("hf");
  const locale = useLocale();
  void locale;
  const [stage, setStage] = useState<HideStage>(0);
  const [current, setCurrent] = useState(0);     // index into ayat[]
  const [playing, setPlaying] = useState(false);
  const [loopCount, setLoopCount] = useState(7); // default 7 reps per ayah
  const [loopsDone, setLoopsDone] = useState(0);
  const [speed, setSpeed] = useState(0.85);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [marked, setMarked] = useState(false);
  const [marking, setMarking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize/replace audio element when current ayah changes.
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = ayat[current]?.audioUrl;
    if (!url) return;
    const audio = new Audio(url.startsWith("//") ? `https:${url}` : url);
    audio.playbackRate = speed;
    audioRef.current = audio;
    setLoopsDone(0);
    const onEnded = () => {
      setLoopsDone((prev) => {
        const next = prev + 1;
        if (loopCount === 0 || next < loopCount) {
          audio.currentTime = 0;
          void audio.play();
          return next;
        }
        // Move to next ayah automatically.
        if (current < ayat.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          setPlaying(false);
        }
        return 0;
      });
    };
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [current, ayat, loopCount, speed]);

  // Sync play/pause with state.
  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) void audioRef.current.play();
    else audioRef.current.pause();
  }, [playing]);

  // Update playback rate on the fly.
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  const toggleReveal = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const markDone = async () => {
    if (marking) return;
    setMarking(true);
    try {
      const res = await fetch("/api/hifz/mark", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ayahKeys: ayat.map((a) => a.ayahKey) }),
      });
      if (res.ok) setMarked(true);
    } finally {
      setMarking(false);
    }
  };

  const playingClass = useMemo(() => (playing ? " is-playing" : ""), [playing]);
  void playingClass;

  return (
    <section className="hifz-learn-wrap">
      <header className="hifz-learn-head">
        <Link href="/hifz" className="hifz-learn-back">← {t("learn_back")}</Link>
        <div className="hifz-learn-title">
          {surahName} <span style={{ color: "var(--text-3)", fontFamily: "'Scheherazade New', serif" }} dir="rtl">{surahNameArabic}</span>
        </div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--text-3)" }}>
          {ayat[current]?.ayahKey ?? ""}
        </div>
      </header>

      <div className="hifz-stage-row" role="radiogroup">
        {([0, 1, 2, 3] as HideStage[]).map((st) => {
          const labels = [t("learn_hide_full"), t("learn_hide_last"), t("learn_hide_first"), t("learn_hide_blind")];
          return (
            <button
              key={st}
              type="button"
              role="radio"
              aria-checked={stage === st}
              className={"hifz-stage-chip" + (stage === st ? " active" : "")}
              onClick={() => setStage(st)}
            >{labels[st]}</button>
          );
        })}
      </div>

      <div>
        {ayat.map((a, i) => {
          const isCurrent = i === current;
          const isRevealed = revealed.has(i);
          return (
            <article
              key={a.ayahKey}
              className={"hifz-ayah" + (isCurrent ? " is-current" : "")}
              onClick={() => { if (i !== current) setCurrent(i); }}
              style={{ cursor: i === current ? "default" : "pointer" }}
            >
              <div className="hifz-ayah-key">{a.ayahKey}</div>
              <div
                className="hifz-ayah-ar"
                onClick={(e) => { e.stopPropagation(); toggleReveal(i); }}
                title="нажми, чтобы открыть/скрыть"
                style={isRevealed ? { filter: "none" } : undefined}
              >
                {isRevealed ? a.textUthmani : renderHidden(a.textUthmani, stage)}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hifz-controls">
        <button
          type="button"
          className="hifz-control-btn hifz-control-primary"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? t("learn_pause") : t("learn_play")}
        </button>
        <label className="hifz-control-btn">
          {t("learn_loop_label")}:
          <select
            value={loopCount}
            onChange={(e) => setLoopCount(Number(e.target.value))}
            style={{ border: 0, background: "transparent", color: "inherit", marginLeft: 4 }}
          >
            <option value={1}>1×</option>
            <option value={3}>3×</option>
            <option value={5}>5×</option>
            <option value={7}>7×</option>
            <option value={10}>10×</option>
            <option value={0}>∞</option>
          </select>
        </label>
        <label className="hifz-control-btn">
          {t("learn_speed_label")}:
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ border: 0, background: "transparent", color: "inherit", marginLeft: 4 }}
          >
            <option value={0.5}>0.5×</option>
            <option value={0.7}>0.7×</option>
            <option value={0.85}>0.85×</option>
            <option value={1}>1.0×</option>
          </select>
        </label>
        <button
          type="button"
          className="hifz-control-btn"
          onClick={() => setCurrent((c) => Math.min(c + 1, ayat.length - 1))}
          disabled={current >= ayat.length - 1}
        >{t("learn_next")} →</button>
        <button
          type="button"
          className="hifz-control-btn hifz-control-primary"
          onClick={markDone}
          disabled={marking || marked}
        >
          {marked ? "✓ " + t("learn_marked") : t("learn_mark_done")}
        </button>
      </div>
    </section>
  );
}
