"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toLocaleDigits } from "@/lib/quran/format";
import { isShortSurah, getNameArabic } from "@/lib/quran/chapter-meta";

type MatchKind = "exact_phrase" | "tokens" | "stem";

interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  translator: string | null;
  matched: "arabic" | "translation" | "both";
  matchKind: MatchKind;
  score: number;
}

interface ApiResponse {
  query?: string;
  count?: number;
  results: SearchResult[];
  note?: string;
}

interface SearchClientProps {
  initialQuery: string;
}

const PAGE_SIZE = 20;

// Split text into bracket-aware segments so we can highlight matches
// OUTSIDE translator-commentary regions only. Translators wrap their
// inserts in (), [], [[]], or {} — those are not Qur'an text.
function splitByBrackets(text: string): Array<{ inside: boolean; text: string }> {
  const segs: Array<{ inside: boolean; text: string }> = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "[" || c === "{") {
      if (depth === 0 && buf) {
        segs.push({ inside: false, text: buf });
        buf = "";
      }
      buf += c;
      depth++;
    } else if (c === ")" || c === "]" || c === "}") {
      buf += c;
      depth--;
      if (depth <= 0) {
        depth = 0;
        segs.push({ inside: true, text: buf });
        buf = "";
      }
    } else {
      buf += c;
    }
  }
  if (buf) segs.push({ inside: depth > 0, text: buf });
  return segs;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(text: string, query: string, isArabic: boolean): string {
  if (!text || !query) return text;
  const tokens = query
    .split(/[\s.,;:!?()«»"'\-—–]+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (tokens.length === 0) return escapeHtml(text);
  let re: RegExp;
  try {
    re = new RegExp(`(${tokens.join("|")})`, isArabic ? "g" : "gi");
  } catch {
    return escapeHtml(text);
  }
  return splitByBrackets(text)
    .map((seg) =>
      seg.inside
        ? escapeHtml(seg.text)
        : escapeHtml(seg.text).replace(re, "<mark>$1</mark>"),
    )
    .join("");
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const locale = useLocale();
  const t = useTranslations("sr");
  const tSn = useTranslations("sn");
  const fmt = (n: number | string) => toLocaleDigits(n, locale);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [surahFilter, setSurahFilter] = useState<number | "all">("all");
  const [shortOnly, setShortOnly] = useState(false);
  const [exactMode, setExactMode] = useState(false);     // true = drop stem bucket
  const [surahsCollapsed, setSurahsCollapsed] = useState(true);
  const [visibleCount, setVisibleCountState] = useState(PAGE_SIZE);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setError(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState(null, "", url.toString());
      return;
    }
    const ac = new AbortController();
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      setSurahFilter("all");
      setShortOnly(false);
      setVisibleCountState(PAGE_SIZE);
      const exactParam = exactMode ? "&exact=1" : "";
      fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}${exactParam}`, { signal: ac.signal, cache: "no-store" })
        .then((r) => r.json() as Promise<ApiResponse>)
        .then((data) => {
          setResults(data.results ?? []);
          const url = new URL(window.location.href);
          url.searchParams.set("q", q);
          window.history.replaceState(null, "", url.toString());
        })
        .catch((e: unknown) => {
          if (e instanceof Error && e.name === "AbortError") return;
          setError(String(e instanceof Error ? e.message : e));
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(handle);
      ac.abort();
    };
  }, [query, locale, exactMode]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Per-surah counts on the FULL result set (independent of active filter)
  // — this drives the chip list with totals.
  const perSurahCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of results ?? []) {
      map.set(r.surah, (map.get(r.surah) ?? 0) + 1);
    }
    return map;
  }, [results]);

  // Apply filters → ordered result list (results come pre-sorted from API:
  // exact_phrase first, then tokens, then stem).
  const filtered = useMemo(() => {
    if (!results) return [] as SearchResult[];
    return results.filter((r) => {
      if (surahFilter !== "all" && surahFilter !== r.surah) return false;
      if (shortOnly && !isShortSurah(r.surah)) return false;
      return true;
    });
  }, [results, surahFilter, shortOnly]);

  // Counts by matchKind to drive the "точное / однокоренные" badge row.
  const kindCounts = useMemo(() => {
    let exact = 0, tokens = 0, stem = 0;
    for (const r of results ?? []) {
      if (r.matchKind === "exact_phrase") exact++;
      else if (r.matchKind === "tokens") tokens++;
      else stem++;
    }
    return { exact, tokens, stem };
  }, [results]);

  // Reset visible count when filter changes.
  useEffect(() => {
    setVisibleCountState(PAGE_SIZE);
  }, [surahFilter, shortOnly]);

  const visibleSlice = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Group the *visible* slice by surah, preserving the API's ranked order
  // — so the topmost exact-phrase hits cluster at the top.
  const groupedVisible = useMemo(() => {
    const map = new Map<number, SearchResult[]>();
    for (const r of visibleSlice) {
      let bucket = map.get(r.surah);
      if (!bucket) { bucket = []; map.set(r.surah, bucket); }
      bucket.push(r);
    }
    return map;
  }, [visibleSlice]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((q) => q);
  };

  const isArabicQuery = /[؀-ۿ]/.test(query);
  const showEmpty = query.trim().length >= 2 && results !== null && results.length === 0 && !loading;
  const showHint = query.trim().length < 2 && !loading;

  // Ordered list of (surahId, totalCount) for the chip palette — sorted
  // by mushaf number for a predictable layout. Collapsed view shows only
  // the top 8 chips by count; "show all" expands the rest.
  const surahChips = useMemo(() => {
    const arr = Array.from(perSurahCounts.entries())
      .map(([id, n]) => ({ id, n }))
      .sort((a, b) => a.id - b.id);
    return arr;
  }, [perSurahCounts]);
  const surahChipsCollapsedSlice = useMemo(() => {
    if (!surahsCollapsed) return surahChips;
    return [...surahChips].sort((a, b) => b.n - a.n).slice(0, 8).sort((a, b) => a.id - b.id);
  }, [surahChips, surahsCollapsed]);

  return (
    <div className="search-shell">
      <form onSubmit={onSubmit} className="search-form">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
        />
        <button type="submit" className="search-submit" disabled={query.trim().length < 2}>
          {t("submit")}
        </button>
      </form>

      {/* Mode toggle row — sits directly under the search bar, always visible.
          Lets the user constrain results to whole-word matches (exact /
          tokens) and drop the stem (substring) bucket entirely. */}
      <div className="search-mode-row" role="radiogroup" aria-label={t("mode_aria")}>
        <button
          type="button"
          role="radio"
          aria-checked={!exactMode}
          className={"search-mode-chip" + (!exactMode ? " active" : "")}
          onClick={() => setExactMode(false)}
        >
          {t("mode_all")}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={exactMode}
          className={"search-mode-chip" + (exactMode ? " active" : "")}
          onClick={() => setExactMode(true)}
        >
          {t("mode_exact")}
        </button>
      </div>

      {loading && <div className="search-status">{t("loading")}</div>}
      {error && <div className="search-status search-status-error">{error}</div>}
      {showHint && <div className="search-status">{t("hint")}</div>}
      {showEmpty && <div className="search-status">{t("no_results", { q: query })}</div>}

      {results && results.length > 0 && (
        <>
          {/* Match-kind summary — quick at-a-glance counts of the three
              ranking buckets so the user sees what we have. */}
          <div className="search-kinds">
            {kindCounts.exact > 0 && (
              <span className="search-kind search-kind-exact">
                {t("kind_exact")} <b>{fmt(kindCounts.exact)}</b>
              </span>
            )}
            {kindCounts.tokens > 0 && (
              <span className="search-kind search-kind-tokens">
                {t("kind_tokens")} <b>{fmt(kindCounts.tokens)}</b>
              </span>
            )}
            {kindCounts.stem > 0 && !exactMode && (
              <span className="search-kind search-kind-stem">
                {t("kind_stem")} <b>{fmt(kindCounts.stem)}</b>
              </span>
            )}
          </div>

          {/* FILTERS — surah chips (with per-surah counts) + short toggle.
              The full list of 50+ surahs collapses by default. */}
          <div className="search-filters-head">
            <span className="search-filters-title">{t("filters_title")}</span>
            <button
              type="button"
              className="search-filters-toggle"
              onClick={() => setSurahsCollapsed((v) => !v)}
              aria-expanded={!surahsCollapsed}
            >
              {surahsCollapsed
                ? t("filters_show", { n: fmt(surahChips.length) })
                : t("filters_hide")}
            </button>
          </div>
          <div className="search-filters" role="toolbar" aria-label={t("filters_aria")}>
            <button
              type="button"
              className={"search-chip" + (surahFilter === "all" ? " active" : "")}
              onClick={() => setSurahFilter("all")}
            >
              {t("filter_all")} <span className="search-chip-n">{fmt(results.length)}</span>
            </button>
            {surahChipsCollapsedSlice.map(({ id, n }) => (
              <button
                key={id}
                type="button"
                className={"search-chip" + (surahFilter === id ? " active" : "")}
                onClick={() => setSurahFilter((cur) => cur === id ? "all" : id)}
              >
                {tSn(String(id))} <span className="search-chip-n">{fmt(n)}</span>
              </button>
            ))}
            <button
              type="button"
              className={"search-chip search-chip-toggle" + (shortOnly ? " active" : "")}
              onClick={() => setShortOnly((v) => !v)}
              title={t("filter_short_hint")}
            >
              {t("filter_short")}
            </button>
          </div>

          <div className="search-meta">
            {filtered.length === results.length
              ? t("found_count", { n: fmt(results.length), q: query })
              : t("filtered_count", { n: fmt(filtered.length), total: fmt(results.length), q: query })}
            {filtered.length > 0 && (
              <> · {t("showing", { shown: fmt(Math.min(visibleCount, filtered.length)), total: fmt(filtered.length) })}</>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="search-status">{t("filter_empty")}</div>
          ) : (
            <>
              <div className="search-groups">
                {Array.from(groupedVisible.entries()).map(([surahId, items]) => (
                  <section key={surahId} className="search-group">
                    <header className="search-group-head">
                      <Link href={`/reader/${surahId}/1`} className="search-group-title">
                        <span className="search-group-num">{fmt(surahId)}</span>
                        <span>{tSn(String(surahId))}</span>
                        <span className="search-group-ar arabic" dir="rtl">{getNameArabic(surahId)}</span>
                      </Link>
                      <span className="search-group-count">{fmt(items.length)}</span>
                    </header>
                    <ol className="search-results">
                      {items.map((r) => (
                        <li key={r.verseKey} className="search-result">
                          <Link href={`/reader/${r.surah}/${r.ayah}`} className="search-result-link">
                            <div className="search-result-key">
                              {fmt(r.surah)}:{fmt(r.ayah)}
                              <span className={"search-result-kind search-result-kind-" + r.matchKind}>
                                {r.matchKind === "exact_phrase"
                                  ? t("kind_exact_tag")
                                  : r.matchKind === "tokens"
                                  ? t("kind_tokens_tag")
                                  : t("kind_stem_tag")}
                              </span>
                            </div>
                            <div
                              className="search-result-arabic arabic"
                              dir="rtl"
                              dangerouslySetInnerHTML={{ __html: highlight(r.arabic, query, true) }}
                            />
                            {r.translation && (
                              <>
                                <div
                                  className="search-result-trans"
                                  dangerouslySetInnerHTML={{ __html: highlight(r.translation, query, isArabicQuery) }}
                                />
                                {r.translator && (
                                  <div className="search-result-tr-tag">
                                    {t("translator_label")}: {t(`tr_${r.translator}` as Parameters<typeof t>[0])}
                                  </div>
                                )}
                              </>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>

              {visibleCount < filtered.length && (
                <div className="search-load-more-wrap">
                  <button
                    type="button"
                    className="search-load-more"
                    onClick={() => setVisibleCountState((n) => n + PAGE_SIZE)}
                  >
                    {t("load_more", {
                      n: fmt(Math.min(PAGE_SIZE, filtered.length - visibleCount)),
                      remaining: fmt(filtered.length - visibleCount),
                    })}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
