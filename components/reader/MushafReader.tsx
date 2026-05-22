"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  TRANSLATIONS,
  type TranslationKey,
  type TranslationMeta,
  RECITERS,
} from "@/lib/quran/constants";
import { useActiveTranslation } from "./TranslationToggle";
import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerProvider";

export interface MushafAyah {
  ayahKey: string;
  verseNumber: number;
  textUthmani: string;
  audioUrl?: string;
  translationsByKey: Partial<Record<TranslationKey, string>>;
  isBookmarked: boolean;
  bookmarkNote: string | null;
}

export interface MushafSurahMeta {
  number: number;
  nameSimple: string;
  nameArabic: string;
  nameTranslit: string;
  revelationPlace: "makkah" | "madinah";
  revelationOrder: number;
  versesCount: number;
}

export interface ChapterListItem {
  id: number;
  nameSimple: string;
  nameArabic: string;
  versesCount: number;
}

interface MushafReaderProps {
  surah: MushafSurahMeta;
  ayat: MushafAyah[];
  chapters: ChapterListItem[];
  initialAyah: number;
  isAuthenticated: boolean;
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? ARABIC_DIGITS[Number(c)] : c))
    .join("");
}

export function MushafReader(props: MushafReaderProps) {
  return (
    <AudioPlayerProvider>
      <MushafReaderInner {...props} />
    </AudioPlayerProvider>
  );
}

function MushafReaderInner(props: MushafReaderProps) {
  const { surah, ayat, chapters, initialAyah, isAuthenticated } = props;
  const t = useTranslations("rd");
  const [activeKey, setActiveKey] = useActiveTranslation();
  const player = useAudioPlayer();

  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [popover, setPopover] = useState<{ top: number; left: number } | null>(null);
  const [reciterSlug, setReciterSlug] = useState(RECITERS[0].slug);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranslations, setShowTranslations] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const playableQueue = useMemo(
    () =>
      ayat
        .filter((a): a is MushafAyah & { audioUrl: string } => Boolean(a.audioUrl))
        .map((a) => ({ url: a.audioUrl, ayahKey: a.ayahKey, label: `${surah.nameSimple} · ${a.verseNumber}` })),
    [ayat, surah.nameSimple],
  );

  const playingVerseNumber = useMemo(() => {
    if (!player.current) return null;
    const [s, n] = player.current.ayahKey.split(":").map(Number);
    if (s !== surah.number) return null;
    return n;
  }, [player.current, surah.number]);

  // Sync progress bar with the global audio element via its label updates.
  useEffect(() => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
    };
  }, [player.current?.ayahKey]);

  // Scroll the requested initial ayah into view on mount.
  useEffect(() => {
    if (initialAyah <= 1) return;
    const el = document.getElementById(`ayah-${initialAyah}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialAyah]);

  // Pin the active surah to the top of the sidebar whenever the surah
  // changes — otherwise the list keeps its previous scroll offset and the
  // user has to hunt for where they landed.
  useEffect(() => {
    // The scrollable container is .reader-side (has overflow-y:auto).
    // .surah-list is just a flex column inside it without its own scroll.
    const sidebar = document.querySelector<HTMLElement>(".reader-side");
    if (!sidebar) return;
    const active = sidebar.querySelector<HTMLAnchorElement>(".surah-item.active");
    if (!active) return;
    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta = activeRect.top - sidebarRect.top + sidebar.scrollTop;
    sidebar.scrollTo({ top: Math.max(0, delta - 8), behavior: "smooth" });
  }, [surah.number]);

  // Close popover on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const tgt = e.target as HTMLElement;
      if (tgt.closest(".ayah-popover")) return;
      if (tgt.closest(".ayah-span")) return;
      if (tgt.closest(".ayah-block")) return;
      if (tgt.closest(".trans-row")) return;
      setPopover(null);
      setActiveAyah(null);
    }
    document.addEventListener("click", onDown);
    return () => document.removeEventListener("click", onDown);
  }, []);

  // Keyboard shortcuts: j/k step, Space play/pause, b bookmark.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (player.current) player.toggle();
        else if (playableQueue.length) player.playQueue(playableQueue, 0);
      } else if (e.key === "j") {
        if (!player.current) return;
        const i = playableQueue.findIndex((q) => q.ayahKey === player.current!.ayahKey);
        if (i >= 0 && i < playableQueue.length - 1) player.playQueue(playableQueue, i + 1);
      } else if (e.key === "k") {
        if (!player.current) return;
        const i = playableQueue.findIndex((q) => q.ayahKey === player.current!.ayahKey);
        if (i > 0) player.playQueue(playableQueue, i - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, playableQueue]);

  function openPopover(e: React.MouseEvent<HTMLElement>, ayahNumber: number) {
    e.stopPropagation();
    const root = rootRef.current?.getBoundingClientRect();
    if (!root) return;
    // Anchor the popover at the click point itself (transform in CSS moves it
    // above the cursor via translate(-50%, -100%)). Using the bounding rect
    // of the whole ayah card pinned the popover to the top of the card —
    // far from where the user actually clicked when the card is tall.
    setPopover({
      top: e.clientY - root.top,
      left: e.clientX - root.left,
    });
    setActiveAyah(ayahNumber);
  }

  function playFrom(ayahNumber: number) {
    const idx = playableQueue.findIndex((q) => q.ayahKey === `${surah.number}:${ayahNumber}`);
    if (idx >= 0) player.playQueue(playableQueue, idx);
    setPopover(null);
    setActiveAyah(null);
  }

  async function toggleBookmark(ayahKey: string) {
    if (!isAuthenticated) {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const target = ayat.find((a) => a.ayahKey === ayahKey);
    if (!target) return;
    if (target.isBookmarked) {
      await fetch(`/api/bookmarks?ayahKey=${encodeURIComponent(ayahKey)}`, { method: "DELETE" });
    } else {
      await fetch(`/api/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ayahKey }),
      });
    }
    window.location.reload();
  }

  async function shareAyah(ayahKey: string) {
    const url = `${window.location.origin}/reader/${surah.number}/${ayahKey.split(":")[1]}`;
    try {
      if (navigator.share) await navigator.share({ url, title: surah.nameSimple });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled or permission denied */
    }
  }

  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.nameSimple.toLowerCase().includes(q) ||
        String(c.id).includes(q) ||
        c.nameArabic.includes(q),
    );
  }, [chapters, search]);

  const bookmarkedAyat = ayat.filter((a) => a.isBookmarked);
  const activeAyahData = activeAyah
    ? ayat.find((a) => a.verseNumber === activeAyah)
    : null;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div className="reader-shell">
        {/* ============ SIDEBAR ============ */}
        <aside className="reader-side">
          <div style={{ position: "relative", marginBottom: 18 }}>
            <input
              type="search"
              placeholder={t("search_ph")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 32px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: "absolute", left: 11, top: 12, color: "var(--text-3)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="side-label">{t("side_all")}</div>
          <div className="surah-list">
            {filteredChapters.map((c) => (
              <Link
                key={c.id}
                href={`/reader/${c.id}/1`}
                className={"surah-item" + (c.id === surah.number ? " active" : "")}
              >
                <span className="surah-num">{c.id}</span>
                <span className="surah-name">
                  <b>{c.nameSimple}</b>
                  <span className="ar arabic" dir="rtl">
                    {c.nameArabic}
                  </span>
                </span>
                <span className="surah-meta">{c.versesCount}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="reader-main">
          <div className="surah-header">
            <div
              className="mihrab-top"
              dangerouslySetInnerHTML={{
                __html: `<svg viewBox="0 0 80 36" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 36 L4 22 Q4 4 40 4 Q76 4 76 22 L76 36" stroke-opacity="0.5"/><path d="M14 36 L14 24 Q14 12 40 12 Q66 12 66 24 L66 36" stroke-opacity="0.3"/><circle cx="40" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>`,
              }}
            />
            <div className="ar arabic">{surah.nameArabic}</div>
            <h1>{surah.nameSimple}</h1>
            <div className="meta">
              {t("surah_prefix")} №{surah.number} ·{" "}
              {surah.revelationPlace === "makkah" ? t("place_makkah") : t("place_madinah")} ·{" "}
              {surah.versesCount} {t("ayat_count")}
            </div>
          </div>

          {/* TRANSLATION TOGGLE + STRIP */}
          <div className="trans-bar">
            <button
              type="button"
              className={"trans-toggle" + (showTranslations ? " on" : "")}
              onClick={() => setShowTranslations((v) => !v)}
              aria-pressed={showTranslations}
              title={showTranslations ? "Скрыть перевод" : "Показать перевод"}
            >
              <span className="trans-toggle-track">
                <span className="trans-toggle-thumb" />
              </span>
              <span className="trans-toggle-label">
                {showTranslations ? "Перевод включён" : "Только арабский"}
              </span>
            </button>
            {showTranslations && (
              <>
                <span className="lbl">{t("lbl_translation")}</span>
                {TRANSLATIONS.map((tr) => (
                  <button
                    key={tr.key}
                    className={"trans-pill" + (activeKey === tr.key ? " active" : "")}
                    onClick={() => setActiveKey(tr.key)}
                    type="button"
                  >
                    {tr.short}
                  </button>
                ))}
              </>
            )}
          </div>

          {showTranslations ? (
            /* INTERLEAVED MODE — each ayah as a card: arabic on top, translation below */
            <div className="ayah-stack">
              {surah.number !== 1 && surah.number !== 9 && (
                <div className="basmala arabic" dir="rtl">
                  <span className="basmala-frame">﷽</span>
                </div>
              )}
              {ayat.map((a) => {
                const text = a.translationsByKey[activeKey];
                const meta: TranslationMeta | undefined = TRANSLATIONS.find((t) => t.key === activeKey);
                return (
                  <article
                    key={a.ayahKey}
                    id={`ayah-${a.verseNumber}`}
                    className={
                      "ayah-block" +
                      (activeAyah === a.verseNumber ? " active" : "") +
                      (playingVerseNumber === a.verseNumber ? " playing" : "")
                    }
                    onClick={(e) => openPopover(e, a.verseNumber)}
                  >
                    <header className="ayah-block-head">
                      <span className="ayah-block-num">{toArabicNum(a.verseNumber)} · {a.verseNumber}</span>
                      <span className="ayah-block-cite">{meta?.author}</span>
                      {a.isBookmarked && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)" style={{ marginLeft: "auto" }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </header>
                    <div className="ayah-block-arabic arabic" dir="rtl">
                      {a.textUthmani}
                      <span className="ayah-mark" aria-hidden="true"> ﴿{toArabicNum(a.verseNumber)}﴾</span>
                    </div>
                    <p
                      className="ayah-block-trans"
                      dangerouslySetInnerHTML={{ __html: text ?? "—" }}
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            /* MUSHAF MODE — flowing arabic block, no translations */
            <div className="mushaf mushaf-ornament">
              {surah.number !== 1 && surah.number !== 9 && (
                <div className="basmala arabic" dir="rtl">
                  <span className="basmala-frame">﷽</span>
                </div>
              )}
              <div className="mushaf-inner arabic" dir="rtl">
                {ayat.map((a, i) => (
                  <Fragment key={a.ayahKey}>
                    <span
                      id={`ayah-${a.verseNumber}`}
                      className={
                        "ayah-span" +
                        (activeAyah === a.verseNumber ? " active" : "") +
                        (playingVerseNumber === a.verseNumber ? " playing" : "")
                      }
                      data-ayah={a.verseNumber}
                      onClick={(e) => openPopover(e, a.verseNumber)}
                    >
                      {a.textUthmani}
                    </span>
                    <span className="ayah-mark" aria-hidden="true">
                      ﴿{toArabicNum(a.verseNumber)}﴾
                    </span>
                    {i < ayat.length - 1 && " "}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ============ RIGHT PANE ============ */}
        <aside className="reader-right">
          <div className="info-card">
            <h4>{t("about_h")}</h4>
            <div className="info-row">
              <span>{t("about_name")}</span>
              <span>{surah.nameSimple}</span>
            </div>
            <div className="info-row">
              <span>{t("about_rev")}</span>
              <span>{surah.revelationPlace === "makkah" ? "Мекка" : "Медина"}</span>
            </div>
            <div className="info-row">
              <span>{t("about_order")}</span>
              <span>{surah.revelationOrder}</span>
            </div>
            <div className="info-row">
              <span>{t("ayat_count")}</span>
              <span>{surah.versesCount}</span>
            </div>
          </div>

          <div className="info-card">
            <h4>{t("reciter_h")}</h4>
            <select
              value={reciterSlug}
              onChange={(e) => setReciterSlug(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {RECITERS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                  {r.style ? ` · ${r.style}` : ""}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 12 }}>
              <Link href="/listen" style={{ color: "var(--accent)", fontSize: 13 }}>
                {t("reciter_all")}
              </Link>
            </div>
          </div>

          <div className="info-card">
            <h4>{t("bm_h")}</h4>
            {bookmarkedAyat.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>{t("bm_empty")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bookmarkedAyat.map((a) => (
                  <a
                    key={a.ayahKey}
                    href={`#ayah-${a.verseNumber}`}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                  >
                    <span>{t("ayah")} {a.verseNumber}</span>
                    <span style={{ color: "var(--text-3)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>
                      {a.ayahKey}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="info-card">
            <h4>{t("hk_h")}</h4>
            <div className="info-row">
              <span>{t("hk_next")}</span>
              <span className="kbd" style={{ padding: "2px 6px" }}>J</span>
            </div>
            <div className="info-row">
              <span>{t("hk_prev")}</span>
              <span className="kbd" style={{ padding: "2px 6px" }}>K</span>
            </div>
            <div className="info-row">
              <span>{t("hk_play")}</span>
              <span className="kbd" style={{ padding: "2px 6px" }}>Space</span>
            </div>
            <div className="info-row">
              <span>{t("hk_bm")}</span>
              <span className="kbd" style={{ padding: "2px 6px" }}>B</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ============ AYAH POPOVER ============ */}
      {popover && activeAyah && activeAyahData && (
        <div
          className="ayah-popover"
          style={{ top: popover.top, left: popover.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="pop-btn" onClick={() => playFrom(activeAyah)} type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {t("pop_listen")}
          </button>
          <button
            className={"pop-btn" + (activeAyahData.isBookmarked ? " bookmarked" : "")}
            onClick={() => toggleBookmark(activeAyahData.ayahKey)}
            type="button"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={activeAyahData.isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {activeAyahData.isBookmarked ? t("pop_saved") : t("pop_bookmark")}
          </button>
          <button className="pop-btn" onClick={() => shareAyah(activeAyahData.ayahKey)} type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
            {t("pop_share")}
          </button>
          <span style={{ width: 1, background: "var(--border)", margin: "4px 4px" }} />
          <button
            className="pop-btn"
            onClick={() => {
              setPopover(null);
              setActiveAyah(null);
            }}
            type="button"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ============ PLAYER ============ */}
      {player.current && (
        <div className="player">
          <button
            className="player-pp"
            onClick={() => player.toggle()}
            type="button"
            aria-label={player.isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {player.isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="player-info">
            <div className="t1">{player.current.label}</div>
            <div className="t2">{RECITERS.find((r) => r.slug === reciterSlug)?.name}</div>
          </div>
          <div className="player-progress">
            <span className="t">{fmtTime(currentTime)}</span>
            <div
              className="bar"
              onClick={(e) => {
                const audio = document.querySelector("audio") as HTMLAudioElement | null;
                if (!audio || !audio.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                audio.currentTime = audio.duration * Math.max(0, Math.min(1, pct));
              }}
            >
              <div style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="t">{fmtTime(duration)}</span>
          </div>
          <div className="player-controls">
            <button
              className="pic-btn"
              type="button"
              onClick={() => {
                const i = playableQueue.findIndex((q) => q.ayahKey === player.current!.ayahKey);
                if (i > 0) player.playQueue(playableQueue, i - 1);
              }}
              aria-label="Предыдущий"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 20 9 12l10-8zM5 4h2v16H5z" />
              </svg>
            </button>
            <button
              className="pic-btn"
              type="button"
              onClick={() => {
                const i = playableQueue.findIndex((q) => q.ayahKey === player.current!.ayahKey);
                if (i >= 0 && i < playableQueue.length - 1) player.playQueue(playableQueue, i + 1);
              }}
              aria-label="Следующий"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4 15 12 5 20zM17 4h2v16h-2z" />
              </svg>
            </button>
            <button className="pic-btn" type="button" onClick={() => player.stop()} aria-label="Стоп">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}
