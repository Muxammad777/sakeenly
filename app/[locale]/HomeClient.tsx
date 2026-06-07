"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FAMOUS_VERSES } from "@/lib/data/famous-verses";
import type { Locale } from "@/i18n/routing";

// Kept for parity with the older single-verse card. The home page now
// renders HomeVotdCarousel and the static markup is gone, but the symbol
// is exported in case anyone still imports it directly.
const VOTD_VERSE = { surah: 2, ayah: 286 } as const;
const VOTD_AUDIO_URL =
  "https://verses.quran.com/AbdulBaset/Mujawwad/mp3/002286.mp3";

/**
 * Carousel of famous verses (2:286, 94:5, 13:28, 2:152, 65:3, 39:53).
 * Auto-advances every 14s; pauses as soon as the user interacts with the
 * card. Play / bookmark / share / translate / open-in-reader all act on
 * the currently visible verse.
 */
export function HomeVotdCarousel() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const tVotd = useTranslations("votd");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const verse = FAMOUS_VERSES[idx];
  const content = verse.byLocale[locale] ?? verse.byLocale.en;
  const ayahKey = `${verse.surah}:${verse.ayah}`;

  // Cleanup audio when component unmounts.
  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  // Switching verses: kill any playing audio, reset transient state.
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    setBookmarked(false);
    setShared(false);
  }, [idx]);

  // Re-check bookmark state for the now-visible verse.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bookmarks?ayahKey=${ayahKey}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!cancelled && j?.exists) setBookmarked(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ayahKey]);

  // Auto-advance unless the user has interacted with the card.
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setIdx((i) => (i + 1) % FAMOUS_VERSES.length), 14000);
    return () => clearTimeout(id);
  }, [idx, paused]);

  const pause = () => setPaused(true);

  const next = () => { pause(); setIdx((i) => (i + 1) % FAMOUS_VERSES.length); };
  const prev = () => { pause(); setIdx((i) => (i - 1 + FAMOUS_VERSES.length) % FAMOUS_VERSES.length); };
  const goTo = (i: number) => { pause(); setIdx(i); };

  const togglePlay = () => {
    pause();
    if (!audioRef.current) {
      const a = new Audio(verse.audioUrl);
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("play", () => setPlaying(true));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const toggleBookmark = async () => {
    if (bookmarkBusy) return;
    pause();
    setBookmarkBusy(true);
    try {
      if (bookmarked) {
        const r = await fetch(`/api/bookmarks?ayahKey=${encodeURIComponent(ayahKey)}`, { method: "DELETE" });
        if (r.ok || r.status === 404) setBookmarked(false);
        else if (r.status === 401) window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      } else {
        const r = await fetch(`/api/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ayahKey }),
        });
        if (r.ok) setBookmarked(true);
        else if (r.status === 401) window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    } finally {
      setBookmarkBusy(false);
    }
  };

  const share = async () => {
    pause();
    const url = `${window.location.origin}/reader/${verse.surah}/${verse.ayah}`;
    const text = `«${content.translation}» — Quran ${ayahKey}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `Sakeenly · ${ayahKey}`, text, url }); return; }
      catch { /* user cancelled — fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch { /* clipboard blocked — silent */ }
  };

  const openInReader = () => { pause(); router.push(`/reader/${verse.surah}/${verse.ayah}`); };
  const openTranslate = () => { pause(); router.push(`/reader/${verse.surah}/${verse.ayah}?translate=1`); };

  const corners = ["tl", "tr", "bl", "br"] as const;

  return (
    <div className="votd geo-frame" onMouseEnter={pause} onTouchStart={pause}>
      {corners.map((p) => (
        <span key={p} className={`corner ${p}`}>
          <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="0.9">
            <path d="M2 18 Q2 2 18 2" />
            <path d="M8 2 Q8 8 2 8" opacity="0.7" />
            <circle cx="18" cy="18" r="3" />
            <path d="M18 14 L19 17 L22 18 L19 19 L18 22 L17 19 L14 18 L17 17 Z" fill="currentColor" opacity="0.8" stroke="none" />
          </svg>
        </span>
      ))}

      <div className="votd-top">
        <span className="eyebrow">{tVotd("label")}</span>
        <span className="tag">
          <span className="tag-dot"></span>
          <span>{tVotd("surah_word")} «{content.surah}» · {ayahKey}</span>
        </span>
      </div>

      <div className="arabic votd-arabic" lang="ar" dir="rtl">{verse.arabic}</div>
      <p className="votd-translation">«{content.translation}»</p>
      <p className="votd-cite">{content.cite} · {ayahKey}</p>

      <div className="votd-controls">
        <button
          type="button"
          className={`ic-btn ${playing ? "active" : ""}`}
          title={tVotd("play")}
          aria-label={tVotd("play")}
          onClick={togglePlay}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button
          type="button"
          className={`ic-btn ${bookmarked ? "active" : ""}`}
          title={bookmarked ? tVotd("bookmarked") : tVotd("bookmark")}
          aria-label={tVotd("bookmark")}
          onClick={toggleBookmark}
          disabled={bookmarkBusy}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button
          type="button"
          className="ic-btn"
          title={tVotd("translate")}
          aria-label={tVotd("translate")}
          onClick={openTranslate}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h7M9 3v2c0 4-2 7-7 8M5 9c0 4 4 8 9 9M14 22l4-9 4 9M15 19h6"/></svg>
        </button>
        <button
          type="button"
          className={`ic-btn ${shared ? "active" : ""}`}
          title={shared ? tVotd("copied") : tVotd("share")}
          aria-label={tVotd("share")}
          onClick={share}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
        </button>
        <button
          type="button"
          className="ic-btn"
          title={tVotd("open_reader")}
          aria-label={tVotd("open_reader")}
          onClick={openInReader}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z"/></svg>
        </button>
      </div>

      <div className="votd-carousel">
        <button type="button" className="votd-carousel-arrow" onClick={prev} aria-label={tVotd("prev")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="votd-dots" role="tablist">
          {FAMOUS_VERSES.map((v, i) => (
            <button
              key={`${v.surah}:${v.ayah}`}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`${tVotd("surah_word")} ${v.surah}:${v.ayah}`}
              className={`votd-dot ${i === idx ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="votd-carousel-arrow" onClick={next} aria-label={tVotd("next")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

/** VOTD play/bookmark + extra controls — interactive bits at the bottom of the VOTD card. */
export function HomeVotd() {
  const router = useRouter();
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Pull current bookmark status for this verse on mount (no-op if signed out).
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bookmarks?ayahKey=${VOTD_VERSE.surah}:${VOTD_VERSE.ayah}`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => { if (!cancelled && j?.exists) setBookmarked(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      const a = new Audio(VOTD_AUDIO_URL);
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("play", () => setPlaying(true));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const toggleBookmark = async () => {
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    const ayahKey = `${VOTD_VERSE.surah}:${VOTD_VERSE.ayah}`;
    try {
      if (bookmarked) {
        const r = await fetch(`/api/bookmarks?ayahKey=${encodeURIComponent(ayahKey)}`, { method: "DELETE" });
        if (r.ok || r.status === 404) setBookmarked(false);
        else if (r.status === 401) window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      } else {
        const r = await fetch(`/api/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ayahKey }),
        });
        if (r.ok) setBookmarked(true);
        else if (r.status === 401) window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    } finally {
      setBookmarkBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/reader/${VOTD_VERSE.surah}/${VOTD_VERSE.ayah}`;
    const text = "«Аллах не возлагает на душу ничего сверх её возможностей.» — Quran 2:286";
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "Аят дня · Sakeenly", text, url }); return; }
      catch { /* user cancelled — fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch { /* clipboard blocked — silent */ }
  };

  const openInReader = () => {
    router.push(`/reader/${VOTD_VERSE.surah}/${VOTD_VERSE.ayah}`);
  };

  const openTranslate = () => {
    // Translation toggle = open reader on this ayah with translation enabled.
    router.push(`/reader/${VOTD_VERSE.surah}/${VOTD_VERSE.ayah}?translate=1`);
  };

  return (
    <div className="votd-controls">
      <button
        type="button"
        className={`ic-btn ${playing ? "active" : ""}`}
        title="Слушать"
        aria-label="Слушать аят"
        onClick={togglePlay}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <button
        type="button"
        className={`ic-btn ${bookmarked ? "active" : ""}`}
        title={bookmarked ? "В закладках" : "Сохранить"}
        aria-label="Закладка"
        onClick={toggleBookmark}
        disabled={bookmarkBusy}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
      <button
        type="button"
        className="ic-btn"
        title="Открыть с переводом"
        aria-label="Открыть с переводом"
        onClick={openTranslate}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h7M9 3v2c0 4-2 7-7 8M5 9c0 4 4 8 9 9M14 22l4-9 4 9M15 19h6"/></svg>
      </button>
      <button
        type="button"
        className={`ic-btn ${shared ? "active" : ""}`}
        title={shared ? "Скопировано" : "Поделиться"}
        aria-label="Поделиться"
        onClick={share}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
      </button>
      <button
        type="button"
        className="ic-btn"
        title="Открыть в ридере"
        aria-label="Открыть в ридере"
        onClick={openInReader}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z"/></svg>
      </button>
    </div>
  );
}

/** Animated streak number — counts up from 0 to 17 on mount. */
export function HomeStreak() {
  const target = 17;
  const [n, setN] = useState(0);
  useEffect(() => {
    const step = Math.max(1, Math.round(target / 24));
    const id = setInterval(() => {
      setN((cur) => {
        const next = cur + step;
        if (next >= target) { clearInterval(id); return target; }
        return next;
      });
    }, 32);
    return () => clearInterval(id);
  }, []);
  return <div className="streak-num">{n}</div>;
}
