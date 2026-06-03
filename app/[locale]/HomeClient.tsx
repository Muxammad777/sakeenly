"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// Aят дня is hard-wired here for now: 2:286 — "Аллах не возлагает на душу
// ничего сверх её возможностей". Source ayah text + audio come from the
// Quran.com CDN (verses/recitations/{reciter}/{verse_key}.mp3).
const VOTD_VERSE = { surah: 2, ayah: 286 } as const;
const VOTD_AUDIO_URL =
  "https://verses.quran.com/AbdulBaset/Mujawwad/mp3/002286.mp3";

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
