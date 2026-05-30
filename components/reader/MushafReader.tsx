"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  TRANSLATIONS,
  type TranslationKey,
  type TranslationMeta,
  RECITERS,
} from "@/lib/quran/constants";
import { toLocaleDigits } from "@/lib/quran/format";
import { useActiveTranslation } from "./TranslationToggle";
import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerProvider";
import { SideTab } from "./SideTab";
import { getMushafPage, pagesOfSurah } from "@/lib/quran/mushaf-pages";
import { getTajweedAnnotations, splitByTajweed } from "@/lib/quran/tajweed";

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
  /** Slug of the reciter whose audio URLs are baked into ayat[].audioUrl
   *  on the server. Surfaced to the bottom player so users can switch. */
  currentReciterSlug: string;
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
      {/* No separate <AudioPlayer /> here — MushafReaderInner renders its
          own richer player bar (with progress + prev/next/stop) further
          down in the JSX. Mounting both would duplicate the control. */}
    </AudioPlayerProvider>
  );
}

function MushafReaderInner(props: MushafReaderProps) {
  const { surah, ayat, chapters, initialAyah, isAuthenticated, currentReciterSlug } = props;
  const t = useTranslations("rd");
  const tSn = useTranslations("sn");
  const uiLocale = useLocale();
  const fmt = (n: number | string) => toLocaleDigits(n, uiLocale);
  const surahName = tSn(String(surah.number));
  const [activeKey, setActiveKey] = useActiveTranslation();
  const player = useAudioPlayer();

  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [popover, setPopover] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // After the popover renders, measure it and nudge it horizontally so
  // it stays inside the viewport regardless of where the user tapped or
  // how wide the popover ended up (localized button labels can swing
  // total width by 80px+). Uses CSS custom property so we never trigger
  // a React re-render here.
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!popover || !el) return;
    el.style.setProperty("--popover-shift", "0px");
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const SAFE = 8;
    let shift = 0;
    if (r.right > vw - SAFE) shift = vw - SAFE - r.right;
    if (r.left < SAFE) shift = SAFE - r.left;
    if (shift !== 0) el.style.setProperty("--popover-shift", shift + "px");
  }, [popover]);
  // Real reciter — driven by the ?reciter URL param resolved on the server
  // and passed down as a prop. The sidebar <select> below navigates with
  // ?reciter=slug to actually change which audio URLs we render.
  const reciterSlug = currentReciterSlug;
  function setReciterSlug(slug: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("reciter", slug);
    window.location.assign(url.toString());
  }
  const [search, setSearch] = useState("");
  // Progress is derived from currentTime/duration exposed by the
  // AudioPlayerProvider context (the actual <audio> elements are
  // detached, so DOM querySelector won't see them).
  const { currentTime, duration, seek: seekAudio } = player;
  const progress = duration > 0 ? currentTime / duration : 0;
  // Default off — the reader opens on the pure mushaf text. Users
  // who want a translation tap the toggle in the trans-bar.
  const [showTranslations, setShowTranslations] = useState(false);
  // Mushaf-mode pagination: when on, the verse stream is sliced into
  // the same physical pages a printed Madani Mushaf uses (1..604).
  // pageIdx is an index into pagesInSurah; the displayed value is the
  // real Mushaf page number.
  const [pageMode, setPageMode] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const pagesInSurah = useMemo(
    () => pagesOfSurah(surah.number, surah.versesCount),
    [surah.number, surah.versesCount],
  );
  const pageCount = pagesInSurah.length;
  const currentMushafPage = pagesInSurah[pageIdx] ?? pagesInSurah[0] ?? 1;
  useEffect(() => { setPageIdx(0); }, [surah.number]);
  const pageAyat = pageMode
    ? ayat.filter((a) => getMushafPage(surah.number, a.verseNumber) === currentMushafPage)
    : ayat;
  const [transPickerOpen, setTransPickerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tajweed mode — colors letters by recitation rules (Dar al-Maarifah
  // palette). Off by default. Stacks under the trans-bar toggles.
  const [tajweedMode, setTajweedMode] = useState(false);

  // In-page (this surah only) search. Live highlight + match counter.
  const [pageSearchOpen, setPageSearchOpen] = useState(false);
  const [pageQuery, setPageQuery] = useState("");
  useEffect(() => { setPageQuery(""); setPageSearchOpen(false); }, [surah.number]);
  const pageQueryNorm = pageQuery.trim();
  // Pre-compile a regex of query tokens, matching the SearchClient
  // behavior: ≥2-char tokens, OR-joined, case-insensitive on Latin.
  const pageSearchRegex = useMemo(() => {
    if (pageQueryNorm.length < 2) return null;
    const tokens = pageQueryNorm
      .split(/[\s.,;:!?()«»"'\-—–]+/)
      .filter((tok) => tok.length >= 2)
      .map((tok) => tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (tokens.length === 0) return null;
    const isArabic = /[؀-ۿ]/.test(pageQueryNorm);
    try { return new RegExp(`(${tokens.join("|")})`, isArabic ? "g" : "gi"); }
    catch { return null; }
  }, [pageQueryNorm]);

  // Count matches across all currently-rendered ayat (arabic + active
  // translation). Used for the live "N совпадений" counter.
  const pageSearchMatchCount = useMemo(() => {
    if (!pageSearchRegex) return 0;
    let n = 0;
    for (const a of ayat) {
      n += (a.textUthmani.match(pageSearchRegex) ?? []).length;
      const tr = a.translationsByKey[activeKey];
      if (tr) {
        // Strip HTML tags from the translation so we don't count <span> etc.
        const plain = tr.replace(/<[^>]+>/g, "");
        n += (plain.match(pageSearchRegex) ?? []).length;
      }
    }
    return n;
  }, [pageSearchRegex, ayat, activeKey]);

  // Helper: render arabic text with optional tajweed coloring AND
  // optional in-surah search highlight. Tajweed wins if both on;
  // search highlight is skipped in tajweed mode to keep the color
  // semantics clean (tajweed uses spans, search uses <mark>).
  const renderArabic = (text: string, ayahNumber: number): React.ReactNode => {
    if (tajweedMode) {
      const ann = getTajweedAnnotations(surah.number, ayahNumber);
      const segments = splitByTajweed(text, ann);
      return segments.map((s, i) =>
        s.rule
          ? <span key={i} className={`tj tj-${s.rule}`}>{s.text}</span>
          : s.text,
      );
    }
    if (!pageSearchRegex) return text;
    const parts = text.split(pageSearchRegex);
    return parts.map((p, i) =>
      i % 2 === 1
        ? <mark key={i} className="page-search-hit">{p}</mark>
        : p,
    );
  };

  // Helper for translation text that's already HTML (citations, spans).
  // Wraps matches in <mark> via regex.replace on the HTML string; safe
  // because the matched tokens have regex special chars escaped above.
  const highlightHtml = (html: string): string => {
    if (!pageSearchRegex) return html;
    return html.replace(pageSearchRegex, "<mark class=\"page-search-hit\">$1</mark>");
  };

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

  // Anchor scroll: when the user flips the translation toggle, the
  // currently-selected (or currently-playing) ayah should jump to the
  // top of the viewport so they don't lose their reading position. The
  // CSS `scroll-margin-top` on .ayah-block / .ayah-span carries the
  // sticky-header offset so scrollIntoView lands them where expected.
  const prevShowTranslations = useRef(showTranslations);
  useEffect(() => {
    if (prevShowTranslations.current === showTranslations) {
      prevShowTranslations.current = showTranslations;
      return;
    }
    prevShowTranslations.current = showTranslations;
    const anchor = activeAyah ?? playingVerseNumber;
    if (!anchor) return;
    // Two rAFs — the first lets React commit the re-render, the second
    // lets the browser apply layout for the freshly-shown ayah blocks.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`ayah-${anchor}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [showTranslations, activeAyah, playingVerseNumber]);

  // (Progress sync used to live here via document.querySelector("audio").
  // That never resolved — AudioPlayerProvider mounts its <audio> off-DOM.
  // The provider now exposes currentTime/duration directly through the
  // context, so we just read them above.)

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
    // .side-search is sticky at the top of the sidebar — measure its
    // real height so the active surah lands *below* it, not behind.
    const search = sidebar.querySelector<HTMLElement>(".side-search");
    const offset = (search?.offsetHeight ?? 0) + 8;
    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta = activeRect.top - sidebarRect.top + sidebar.scrollTop;
    sidebar.scrollTo({ top: Math.max(0, delta - offset), behavior: "smooth" });
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
    // The popover is centered on the anchor point via translate(-50%, -100%)
    // in CSS. On a narrow phone, tapping an ayah near either edge of the
    // screen would push the popover off-viewport (3 action buttons clip
    // out of sight). Clamp the anchor X so the centered popover always
    // fits inside the viewport with a small safe-area on both sides.
    const HALF_POPOVER = 140; // half of ≈280px (3 .pop-btn @ ~80–95px)
    const SAFE = 10;
    const vw = window.innerWidth;
    const clampedClientX = Math.min(
      Math.max(e.clientX, SAFE + HALF_POPOVER),
      vw - SAFE - HALF_POPOVER,
    );
    // Vertical: if the tap is near the top (sticky header + popover height
    // would overlap), flip the popover to render below the anchor.
    const POPOVER_H = 56;
    const HEADER = 70;
    const flipBelow = e.clientY - POPOVER_H - 12 < HEADER;
    setPopover({
      top: e.clientY - root.top,
      left: clampedClientX - root.left,
      below: flipBelow,
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

  // Precompute the localized surah name for each chapter so the
  // sidebar filter actually matches the wording the user sees ("Юсуф"
  // on RU, "هود" on FA). Without this, "юсуф" missed Yusuf because
  // the API ships only the Latin transliteration ("name_simple").
  const localizedSurahNames = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of chapters) m.set(c.id, tSn(String(c.id)).toLowerCase());
    return m;
  }, [chapters, tSn]);

  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter((c) => {
      const localized = localizedSurahNames.get(c.id) ?? "";
      return (
        localized.includes(q) ||
        c.nameSimple.toLowerCase().includes(q) ||
        String(c.id).includes(q) ||
        c.nameArabic.includes(q)
      );
    });
  }, [chapters, search, localizedSurahNames]);

  const bookmarkedAyat = ayat.filter((a) => a.isBookmarked);
  const activeAyahData = activeAyah
    ? ayat.find((a) => a.verseNumber === activeAyah)
    : null;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {/* Back-to-list pill — visible only on mobile (CSS .reader-back) so
          users can return to the sura picker. Desktop has the left
          sidebar with all 114 suras and doesn't need it. */}
      <div className="wrap">
        <Link href="/reader" className="reader-back">{t("back_to_list")}</Link>
      </div>
      <div className="reader-shell">
        {/* ============ SIDEBAR ============ */}
        <aside className="reader-side">
          <div className="side-search">
            <input
              type="search"
              placeholder={t("search_ph")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
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
                <span className="surah-num">{fmt(c.id)}</span>
                <span className="surah-name">
                  <b>{tSn(String(c.id))}</b>
                  <span className="ar arabic" dir="rtl">
                    {c.nameArabic}
                  </span>
                </span>
                <span className="surah-meta">{fmt(c.versesCount)}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="reader-main">
          <div className="surah-header">
            <div className="geo-stars-fade" aria-hidden />
            <div
              className="mihrab-top"
              dangerouslySetInnerHTML={{
                __html: `<svg viewBox="0 0 80 36" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 36 L4 22 Q4 4 40 4 Q76 4 76 22 L76 36" stroke-opacity="0.5"/><path d="M14 36 L14 24 Q14 12 40 12 Q66 12 66 24 L66 36" stroke-opacity="0.3"/><circle cx="40" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>`,
              }}
            />
            <div className="ar arabic">{surah.nameArabic}</div>
            <h1>{surahName}</h1>
            <div className="meta">
              {t("surah_prefix")} №{fmt(surah.number)} ·{" "}
              {surah.revelationPlace === "makkah" ? t("place_makkah") : t("place_madinah")} ·{" "}
              {fmt(surah.versesCount)} {t("ayat_count")}
            </div>
          </div>

          {/* IN-SURAH SEARCH — collapsible bar that highlights live as
              the user types. The trigger (FAB) lives outside .reader-main
              so it's pinned to the viewport corner. */}
          {pageSearchOpen && (
            <div className="page-search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                value={pageQuery}
                onChange={(e) => setPageQuery(e.target.value)}
                placeholder={t("fp_placeholder")}
                aria-label={t("fp_placeholder")}
                autoFocus
              />
              <span className="page-search-count">
                {pageQueryNorm.length < 2
                  ? ""
                  : pageSearchMatchCount > 0
                    ? t("fp_count", { n: fmt(pageSearchMatchCount) })
                    : t("fp_count_zero")}
              </span>
              <button
                type="button"
                onClick={() => { setPageQuery(""); setPageSearchOpen(false); }}
                aria-label={t("fp_close")}
                className="page-search-close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}

          {/* TRANSLATION TOGGLE + STRIP — wrapped in a single sticky
              container so the trigger row and the expanded translator
              pills scroll together (they used to detach: bar stuck at
              top, pills scrolled off above it). */}
          <div className="trans-controls">
          <div className="trans-bar">
            <button
              type="button"
              className={"trans-toggle" + (showTranslations ? " on" : "")}
              onClick={() => setShowTranslations((v) => !v)}
              aria-pressed={showTranslations}
              title={showTranslations ? t("trans_title_hide") : t("trans_title_show")}
            >
              <span className="trans-toggle-track">
                <span className="trans-toggle-thumb" />
              </span>
              <span className="trans-toggle-label">
                {showTranslations ? t("trans_on") : t("trans_off")}
              </span>
            </button>
            {/* Page-mode toggle — only relevant when translations are off
                (i.e. mushaf reading mode). Switches between continuous
                scroll and book-like paginated reading. */}
            {!showTranslations && (
              <button
                type="button"
                className={"mode-toggle" + (pageMode ? " on" : "")}
                onClick={() => { setPageMode((v) => !v); setPageIdx(0); }}
                aria-pressed={pageMode}
                title={pageMode ? t("mode_continuous") : t("mode_pages")}
              >
                {pageMode ? (
                  // Book icon (currently on)
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>
                  </svg>
                ) : (
                  // Scroll/lines icon (currently on continuous)
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h16M4 17h10"/>
                  </svg>
                )}
                <span className="trans-toggle-label">
                  {pageMode ? t("mode_pages") : t("mode_continuous")}
                </span>
              </button>
            )}
            {showTranslations && (
              <>
                {/* Current-translator button (visible everywhere now —
                    desktop too — to keep the trans-bar one compact row.
                    Tapping toggles the pill list below. */}
                <button
                  type="button"
                  className={"trans-current" + (transPickerOpen ? " open" : "")}
                  onClick={() => setTransPickerOpen((v) => !v)}
                  aria-expanded={transPickerOpen}
                  aria-controls="trans-pills"
                  title={t("lbl_translation")}
                >
                  <span>{TRANSLATIONS.find((tr) => tr.key === activeKey)?.short ?? activeKey}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </>
            )}
            {/* In-surah search trigger — inline with the other toggles
                instead of a floating FAB, so all reader controls live on
                one row. */}
            <button
              type="button"
              className={"mode-toggle" + (pageSearchOpen ? " on" : "")}
              onClick={() => setPageSearchOpen((v) => !v)}
              aria-pressed={pageSearchOpen}
              title={t("fp_open")}
              aria-label={t("fp_open")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="trans-toggle-label">{t("fp_open_label")}</span>
            </button>
            {/* Tajweed mode toggle — colors arabic letters by recitation
                rule (Dar al-Maarifah palette). Useful for tarteel
                students; off by default. */}
            <button
              type="button"
              className={"mode-toggle" + (tajweedMode ? " on" : "")}
              onClick={() => setTajweedMode((v) => !v)}
              aria-pressed={tajweedMode}
              title={t("tj_toggle")}
              aria-label={t("tj_toggle")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12a9 9 0 0 1 18 0" stroke="currentColor" />
                <circle cx="8" cy="11" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="16" cy="11" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="trans-toggle-label">{t("tj_label")}</span>
            </button>
          </div>
          {showTranslations && (
            <div
              id="trans-pills"
              className={"trans-pills" + (transPickerOpen ? " open" : "")}
              hidden={!transPickerOpen}
            >
              {TRANSLATIONS.map((tr) => (
                <button
                  key={tr.key}
                  className={"trans-pill" + (activeKey === tr.key ? " active" : "")}
                  onClick={() => { setActiveKey(tr.key); setTransPickerOpen(false); }}
                  type="button"
                >
                  {tr.short}
                </button>
              ))}
            </div>
          )}
          </div>{/* /.trans-controls */}

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
                    onClick={(e) => {
                      // Ignore clicks that originated inside action buttons.
                      if ((e.target as HTMLElement).closest("button, a")) return;
                      setActiveAyah(a.verseNumber);
                    }}
                  >
                    <header className="ayah-block-head">
                      <span className="ayah-block-num">{toArabicNum(a.verseNumber)} · {fmt(a.verseNumber)}</span>
                      <span className="ayah-block-cite">{meta?.author}</span>
                      <div className="ayah-block-actions">
                        <button
                          type="button"
                          className="ayah-block-action"
                          onClick={(e) => { e.stopPropagation(); playFrom(a.verseNumber); }}
                          title={t("pop_listen")}
                          aria-label={t("pop_listen")}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button
                          type="button"
                          className={"ayah-block-action" + (a.isBookmarked ? " active" : "")}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(a.ayahKey); }}
                          title={a.isBookmarked ? t("pop_saved") : t("pop_bookmark")}
                          aria-label={a.isBookmarked ? t("pop_saved") : t("pop_bookmark")}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={a.isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="ayah-block-action"
                          onClick={(e) => { e.stopPropagation(); shareAyah(a.ayahKey); }}
                          title={t("pop_share")}
                          aria-label={t("pop_share")}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
                          </svg>
                        </button>
                      </div>
                    </header>
                    <div className="ayah-block-arabic arabic" dir="rtl">
                      {renderArabic(a.textUthmani, a.verseNumber)}
                      <span className="ayah-mark" aria-hidden="true"> ﴿{toArabicNum(a.verseNumber)}﴾</span>
                    </div>
                    <p
                      className="ayah-block-trans"
                      dangerouslySetInnerHTML={{ __html: text ? highlightHtml(text) : "—" }}
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            /* MUSHAF MODE — flowing arabic block, no translations.
               If pageMode is on, slice to one book-like page at a time. */
            <>
              <div className="mushaf mushaf-ornament">
                {/* Basmala only on page 1 in pageMode, or always in continuous mode */}
                {surah.number !== 1 && surah.number !== 9 && (!pageMode || pageIdx === 0) && (
                  <div className="basmala arabic" dir="rtl">
                    <span className="basmala-frame">﷽</span>
                  </div>
                )}
                <div className="mushaf-inner arabic" dir="rtl">
                  {pageAyat.map((a, i) => (
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
                        {renderArabic(a.textUthmani, a.verseNumber)}
                      </span>
                      <span className="ayah-mark" aria-hidden="true">
                        ﴿{toArabicNum(a.verseNumber)}﴾
                      </span>
                      {i < pageAyat.length - 1 && " "}
                    </Fragment>
                  ))}
                </div>
              </div>
              {pageMode && (
                <div className="mushaf-pager" aria-label="Pagination">
                  <button
                    type="button"
                    className="pager-btn"
                    disabled={pageIdx === 0}
                    onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                    aria-label={t("prev_page")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M15 6l-6 6 6 6"/>
                    </svg>
                  </button>
                  <span className="pager-indicator">
                    {t("page_of", { n: fmt(currentMushafPage), total: fmt(604) })}
                  </span>
                  <button
                    type="button"
                    className="pager-btn"
                    disabled={pageIdx >= pageCount - 1}
                    onClick={() => setPageIdx((p) => Math.min(pageCount - 1, p + 1))}
                    aria-label={t("next_page")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M9 6l6 6-6 6"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* ============ RIGHT PANE ============ */}
        <aside className="reader-right">
          {/* "About this surah" card was removed — it duplicated the hero
              block at the top of .reader-main. When tajweed is on, the
              same slot is reused for a tajweed-rule color legend. */}
          {tajweedMode && (
            <div className="info-card tajweed-legend">
              <h4>{t("tj_legend_h")}</h4>
              {[
                { rules: ["madd_2"],                            label: t("tj_rule_madd_2") },
                { rules: ["madd_246"],                          label: t("tj_rule_madd_246") },
                { rules: ["madd_6"],                            label: t("tj_rule_madd_6") },
                { rules: ["madd_munfasil", "madd_muttasil"],    label: t("tj_rule_madd_obligatory") },
                { rules: ["qalqalah"],                          label: t("tj_rule_qalqalah") },
                { rules: ["ghunnah"],                           label: t("tj_rule_ghunnah") },
                { rules: ["ikhfa", "ikhfa_shafawi"],            label: t("tj_rule_ikhfa") },
                { rules: ["idghaam_ghunnah",
                          "idghaam_no_ghunnah",
                          "idghaam_shafawi"],                   label: t("tj_rule_idghaam") },
                { rules: ["idghaam_mutajanisayn",
                          "idghaam_mutaqaribayn"],              label: t("tj_rule_idghaam_mut") },
                { rules: ["iqlab"],                             label: t("tj_rule_iqlab") },
                { rules: ["hamzat_wasl",
                          "lam_shamsiyyah",
                          "silent"],                            label: t("tj_rule_silent") },
              ].map((row, i) => (
                <div key={i} className="tj-legend-row">
                  <span className={`tj-legend-swatch tj-${row.rules[0]}`}>ن</span>
                  <span className="tj-legend-label">{row.label}</span>
                </div>
              ))}
            </div>
          )}

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
                    <span>{t("ayah")} {fmt(a.verseNumber)}</span>
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
          ref={popoverRef}
          className={"ayah-popover" + (popover.below ? " below" : "")}
          style={{ top: popover.top, left: popover.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="pop-btn" onClick={() => playFrom(activeAyah)} type="button" aria-label={t("pop_listen")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="pop-btn-label">{t("pop_listen")}</span>
          </button>
          <button
            className={"pop-btn" + (activeAyahData.isBookmarked ? " bookmarked" : "")}
            onClick={() => toggleBookmark(activeAyahData.ayahKey)}
            type="button"
            aria-label={activeAyahData.isBookmarked ? t("pop_saved") : t("pop_bookmark")}
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
            <span className="pop-btn-label">{activeAyahData.isBookmarked ? t("pop_saved") : t("pop_bookmark")}</span>
          </button>
          <button className="pop-btn" onClick={() => shareAyah(activeAyahData.ayahKey)} type="button" aria-label={t("pop_share")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
            <span className="pop-btn-label">{t("pop_share")}</span>
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
            aria-label={player.isPlaying ? t("pop_pause") : t("pop_listen")}
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
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seekAudio(duration * Math.max(0, Math.min(1, pct)));
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
              aria-label={t("pop_prev")}
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
              aria-label={t("pop_next")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4 15 12 5 20zM17 4h2v16h-2z" />
              </svg>
            </button>
            <button className="pic-btn" type="button" onClick={() => player.stop()} aria-label={t("pop_stop")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ============ MOBILE-ONLY SIDE TABS ============ */}
      {/* Left tab — translation picker. Replaces the inline trans-bar on
          phones (CSS hides .trans-bar at ≤720px). */}
      <SideTab side="left" label={t("side_translation")} ariaLabel={t("side_pick_translation")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            type="button"
            className={"trans-toggle" + (showTranslations ? " on" : "")}
            onClick={() => setShowTranslations((v) => !v)}
            aria-pressed={showTranslations}
            style={{ marginBottom: 14 }}
          >
            <span className="trans-toggle-track">
              <span className="trans-toggle-thumb" />
            </span>
            <span className="trans-toggle-label">
              {showTranslations ? t("trans_on") : t("trans_off")}
            </span>
          </button>
          {!showTranslations && (
            <button
              type="button"
              className={"mode-toggle" + (pageMode ? " on" : "")}
              onClick={() => { setPageMode((v) => !v); setPageIdx(0); }}
              aria-pressed={pageMode}
              style={{ marginBottom: 14 }}
            >
              {pageMode ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h10"/>
                </svg>
              )}
              <span className="trans-toggle-label">
                {pageMode ? t("mode_pages") : t("mode_continuous")}
              </span>
            </button>
          )}
          {showTranslations && TRANSLATIONS.map((tr) => (
            <button
              key={tr.key}
              type="button"
              onClick={() => setActiveKey(tr.key)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                textAlign: "left",
                background: activeKey === tr.key ? "var(--accent-soft)" : "transparent",
                color: activeKey === tr.key ? "oklch(var(--accent))" : "oklch(var(--text))",
                fontFamily: "'Spectral', serif",
                fontSize: 15,
              }}
            >
              {tr.short}
            </button>
          ))}
        </div>
      </SideTab>

      {/* Reciter picker is reachable via the bottom AudioPlayer's reciter
          chip — no need for a second side-tab. Removed per user request
          (it was overlapping the verse text on phones). */}
    </div>
  );
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}
