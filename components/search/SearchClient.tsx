"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toLocaleDigits } from "@/lib/quran/format";
import { isShortSurah, getNameArabic } from "@/lib/quran/chapter-meta";

interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  translator: string | null;
  matched: "arabic" | "translation" | "both";
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

// Wrap query tokens (each >=2 chars) in <mark>. The server-side matcher
// is AND-over-tokens, so the highlight has to mirror that and not insist
// on the whole phrase being a contiguous substring.
function highlight(text: string, query: string, isArabic: boolean): string {
  if (!text || !query) return text;
  const tokens = query
    .split(/[\s.,;:!?()«»"'\-—–]+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (tokens.length === 0) return text;
  try {
    const re = new RegExp(`(${tokens.join("|")})`, isArabic ? "g" : "gi");
    return text.replace(re, "<mark>$1</mark>");
  } catch {
    return text;
  }
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const locale = useLocale();
  const t = useTranslations("sr");
  const tSn = useTranslations("sn");
  const fmt = (n: number | string) => toLocaleDigits(n, locale);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side filters applied on top of the API response.
  const [surahFilter, setSurahFilter] = useState<number | "all">("all");
  const [shortOnly, setShortOnly] = useState(false);

  useEffect(() => {
    const q = committedQuery.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSurahFilter("all");
    setShortOnly(false);
    fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`)
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        setResults(data.results ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [committedQuery, locale]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (committedQuery.trim()) url.searchParams.set("q", committedQuery.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [committedQuery]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Bucket results per surah and keep insertion order (= original
  // verse order from the API, which sorts by surah:ayah).
  const grouped = useMemo(() => {
    const map = new Map<number, SearchResult[]>();
    for (const r of results ?? []) {
      let bucket = map.get(r.surah);
      if (!bucket) { bucket = []; map.set(r.surah, bucket); }
      bucket.push(r);
    }
    return map;
  }, [results]);

  // Active filter set after surah + short-only checks.
  const visibleGrouped = useMemo(() => {
    if (!results) return new Map<number, SearchResult[]>();
    const out = new Map<number, SearchResult[]>();
    for (const [surahId, items] of grouped) {
      if (surahFilter !== "all" && surahFilter !== surahId) continue;
      if (shortOnly && !isShortSurah(surahId)) continue;
      out.set(surahId, items);
    }
    return out;
  }, [grouped, surahFilter, shortOnly]);

  const visibleCount = useMemo(() => {
    let n = 0;
    for (const items of visibleGrouped.values()) n += items.length;
    return n;
  }, [visibleGrouped]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommittedQuery(query);
  };

  const isArabicQuery = /[؀-ۿ]/.test(committedQuery);
  const showEmpty = committedQuery.trim().length >= 2 && results !== null && results.length === 0 && !loading;
  const showHint = committedQuery.trim().length < 2 && !loading;

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

      {loading && <div className="search-status">{t("loading")}</div>}
      {error && <div className="search-status search-status-error">{error}</div>}
      {showHint && <div className="search-status">{t("hint")}</div>}
      {showEmpty && <div className="search-status">{t("no_results", { q: committedQuery })}</div>}

      {results && results.length > 0 && (
        <>
          {/* FILTERS — surah chips with per-surah counts, plus short-only toggle */}
          <div className="search-filters" role="toolbar" aria-label={t("filters_aria")}>
            <button
              type="button"
              className={"search-chip" + (surahFilter === "all" ? " active" : "")}
              onClick={() => setSurahFilter("all")}
            >
              {t("filter_all")} <span className="search-chip-n">{fmt(results.length)}</span>
            </button>
            {Array.from(grouped.entries()).map(([surahId, items]) => (
              <button
                key={surahId}
                type="button"
                className={"search-chip" + (surahFilter === surahId ? " active" : "")}
                onClick={() => setSurahFilter((cur) => cur === surahId ? "all" : surahId)}
              >
                {tSn(String(surahId))} <span className="search-chip-n">{fmt(items.length)}</span>
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
            {visibleCount === results.length
              ? t("found_count", { n: fmt(results.length), q: committedQuery })
              : t("filtered_count", { n: fmt(visibleCount), total: fmt(results.length), q: committedQuery })}
          </div>

          {visibleCount === 0 ? (
            <div className="search-status">{t("filter_empty")}</div>
          ) : (
            <div className="search-groups">
              {Array.from(visibleGrouped.entries()).map(([surahId, items]) => (
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
                          </div>
                          <div
                            className="search-result-arabic arabic"
                            dir="rtl"
                            dangerouslySetInnerHTML={{ __html: highlight(r.arabic, committedQuery, true) }}
                          />
                          {r.translation && (
                            <>
                              <div
                                className="search-result-trans"
                                dangerouslySetInnerHTML={{ __html: highlight(r.translation, committedQuery, isArabicQuery) }}
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
          )}
        </>
      )}
    </div>
  );
}
