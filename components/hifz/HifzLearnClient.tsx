"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ListenAndRecite } from "./ListenAndRecite";

interface WbwWord {
  position: number;
  type: string;
  arabic: string;
  imlaei: string | null;
  translation: string | null;
  transliteration: string | null;
}
interface WbwData { verseKey: string; words: WbwWord[]; }

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
  const [stage, setStage] = useState<HideStage>(0);
  const [current, setCurrent] = useState(0);     // index into ayat[]
  const [playing, setPlaying] = useState(false);
  const [loopCount, setLoopCount] = useState(7); // default 7 reps per ayah
  // Counter is mutated via the functional setter only — destructure
  // without the read slot so eslint's no-unused-vars doesn't fire.
  const [, setLoopsDone] = useState(0);
  const [speed, setSpeed] = useState(0.85);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [marked, setMarked] = useState(false);
  const [marking, setMarking] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  // If the URL has a `#aN` hash (set by the reader's "В хифз" button),
  // scroll the matching ayah to the top of the viewport on mount and
  // also focus it as the current ayah. Otherwise leaves the natural
  // top-of-page scroll alone.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = /^#a(\d+)$/.exec(window.location.hash);
    if (!m) return;
    const targetAyah = Number(m[1]);
    const idx = ayat.findIndex((a) => a.ayah === targetAyah);
    if (idx < 0) return;
    setCurrent(idx);
    const el = document.getElementById(`a${targetAyah}`);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
  }, [ayat]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Word-by-word panel — lazily fetched per ayah on first reveal.
  const [wbwOpen, setWbwOpen] = useState<Set<string>>(new Set());
  const [wbwData, setWbwData] = useState<Record<string, WbwData>>({});
  const [wbwLoading, setWbwLoading] = useState<Set<string>>(new Set());

  const toggleWbw = async (ayahKey: string) => {
    setWbwOpen((prev) => {
      const next = new Set(prev);
      if (next.has(ayahKey)) next.delete(ayahKey); else next.add(ayahKey);
      return next;
    });
    if (wbwData[ayahKey] || wbwLoading.has(ayahKey)) return;
    setWbwLoading((s) => new Set(s).add(ayahKey));
    const [su, ay] = ayahKey.split(":");
    try {
      const res = await fetch(`/api/quran/wbw/${su}/${ay}?lang=${locale}`);
      if (res.ok) {
        const data = (await res.json()) as WbwData;
        setWbwData((d) => ({ ...d, [ayahKey]: data }));
      }
    } finally {
      setWbwLoading((s) => {
        const n = new Set(s); n.delete(ayahKey); return n;
      });
    }
  };

  // Initialize/replace audio element when current ayah changes.
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = ayat[current]?.audioUrl;
    if (!url) {
      // Surfaced once per missing-audio click attempt; helps diagnose
      // server-side fetch issues (e.g. quranApi reciter param dropped).
      console.warn("[hifz] no audio for", ayat[current]?.ayahKey);
      return;
    }
    const fullUrl = url.startsWith("//") ? `https:${url}` : url;
    const audio = new Audio(fullUrl);
    audio.playbackRate = speed;
    audioRef.current = audio;
    setLoopsDone(0);
    const onEnded = () => {
      setLoopsDone((prev) => {
        const next = prev + 1;
        if (loopCount === 0 || next < loopCount) {
          audio.currentTime = 0;
          void audio.play().catch((err) => console.error("[hifz] loop replay failed", err));
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
    audio.addEventListener("error", () => {
      console.error("[hifz] audio failed to load", fullUrl, audio.error);
    });
    // Carry the playing state through to the freshly-created audio
    // element — otherwise switching ayah/loopCount/speed while playing
    // leaves a paused element and the user hears nothing.
    if (playing) {
      void audio.play().catch((err) => console.error("[hifz] auto-resume failed", err));
    }
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
    // playing intentionally excluded from deps — handled by the
    // dedicated [playing] effect below; we only re-init audio when
    // the source url, loop policy, or playback rate changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setNeedsAuth(false);
    try {
      const res = await fetch("/api/hifz/mark", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ayahKeys: ayat.map((a) => a.ayahKey) }),
      });
      if (res.ok) setMarked(true);
      else if (res.status === 401) setNeedsAuth(true);
    } finally {
      setMarking(false);
    }
  };

  return (
    <section className="hifz-learn-wrap">
      <div className="hifz-learn-bg" aria-hidden="true" />
      <header className="hifz-learn-head">
        <Link href="/hifz" className="hifz-learn-back">← {t("learn_back")}</Link>
        <div className="hifz-learn-title">
          {surahName} <span className="hifz-learn-title-ar" dir="rtl">{surahNameArabic}</span>
        </div>
        <div className="hifz-learn-counter">
          <span className="hifz-learn-counter-cur">{current + 1}</span>
          <span className="hifz-learn-counter-sep">/</span>
          <span className="hifz-learn-counter-tot">{ayat.length}</span>
        </div>
      </header>

      <div className="hifz-learn-divider" aria-hidden="true">
        <span className="hifz-divider-line" />
        <svg className="hifz-divider-star" viewBox="0 0 40 40">
          <path d="M20 3 L24 17 L38 20 L24 23 L20 37 L16 23 L2 20 L16 17 Z" />
          <path d="M20 9 L22 18 L31 20 L22 22 L20 31 L18 22 L9 20 L18 18 Z" opacity="0.6" />
          <circle cx="20" cy="20" r="1.5" fill="oklch(var(--accent))" stroke="none" />
        </svg>
        <span className="hifz-divider-line" />
      </div>

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
          const wbwIsOpen = wbwOpen.has(a.ayahKey);
          const wbw = wbwData[a.ayahKey];
          const wbwIsLoading = wbwLoading.has(a.ayahKey);
          return (
            <article
              key={a.ayahKey}
              id={`a${a.ayah}`}
              className={"hifz-ayah" + (isCurrent ? " is-current" : "")}
              onClick={() => { if (i !== current) setCurrent(i); }}
              style={{ cursor: i === current ? "default" : "pointer" }}
            >
              <div className="hifz-ayah-key">
                {a.ayahKey}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleWbw(a.ayahKey); }}
                  className="hifz-wbw-toggle"
                  aria-expanded={wbwIsOpen}
                >
                  {wbwIsOpen ? "✕ слова" : "слова"}
                </button>
              </div>
              <div
                className="hifz-ayah-ar"
                onClick={(e) => { e.stopPropagation(); toggleReveal(i); }}
                title="нажми, чтобы открыть/скрыть"
                style={isRevealed ? { filter: "none" } : undefined}
              >
                {isRevealed ? a.textUthmani : renderHidden(a.textUthmani, stage)}
              </div>
              {wbwIsOpen && (
                <div className="hifz-wbw">
                  {wbwIsLoading && <div className="hifz-wbw-loading">…</div>}
                  {wbw && (
                    <div className="hifz-wbw-grid" dir="rtl">
                      {wbw.words.filter((w) => w.type === "word").map((w) => (
                        <div key={w.position} className="hifz-wbw-cell">
                          <div className="hifz-wbw-ar">{w.arabic}</div>
                          {w.transliteration && (
                            <div className="hifz-wbw-translit" dir="ltr">{w.transliteration}</div>
                          )}
                          {w.translation && (
                            <div className="hifz-wbw-tr" dir="ltr">{w.translation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isCurrent && (
                <div onClick={(e) => e.stopPropagation()}>
                  <ListenAndRecite
                    ayahKey={a.ayahKey}
                    textUthmani={a.textUthmani}
                    audioUrl={a.audioUrl}
                  />
                </div>
              )}
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
        {needsAuth ? (
          <Link
            href={`/signin?callbackUrl=${typeof window !== "undefined" ? encodeURIComponent(window.location.pathname) : ""}`}
            className="hifz-control-btn hifz-control-primary"
          >
            {t("auth_required")}
          </Link>
        ) : (
          <button
            type="button"
            className="hifz-control-btn hifz-control-primary"
            onClick={markDone}
            disabled={marking || marked}
          >
            {marked ? "✓ " + t("learn_marked") : t("learn_mark_done")}
          </button>
        )}
      </div>
    </section>
  );
}
