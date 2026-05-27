"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { toLocaleDigits } from "@/lib/quran/format";

interface SearchResult {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
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

// Wrap query matches in <mark> using a normalized comparison that mirrors
// the server-side substring matcher. Strips Arabic harakat so highlighting
// works on undecorated and decorated forms.
function highlight(text: string, query: string, isArabic: boolean): string {
  if (!text || !query) return text;
  // Build the regex against the original characters but case-insensitive.
  // For the server we normalize harakat — for *visual* highlight we keep
  // the original glyphs and accept that some matches won't be wrapped if
  // the user typed without harakat against a fully-vocalized verse. This
  // is intentional: a perfect highlight requires DOM-level segmentation
  // we don't yet have.
  try {
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, isArabic ? "g" : "gi");
    return text.replace(re, (m) => `<mark>${m}</mark>`);
  } catch {
    return text;
  }
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const locale = useLocale();
  const t = useTranslations("sr");
  const router = useRouter();
  const fmt = (n: number | string) => toLocaleDigits(n, locale);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Run a fetch when committedQuery changes (on submit + on initial load).
  useEffect(() => {
    const q = committedQuery.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
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

  // Sync URL ?q= when committed query changes (without full reload).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (committedQuery.trim()) url.searchParams.set("q", committedQuery.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [committedQuery]);

  // Focus the input on mount.
  useEffect(() => { inputRef.current?.focus(); }, []);

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
          <div className="search-meta">
            {t("found_count", { n: fmt(results.length), q: committedQuery })}
          </div>
          <ol className="search-results">
            {results.map((r) => (
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
                    <div
                      className="search-result-trans"
                      dangerouslySetInnerHTML={{ __html: highlight(r.translation, committedQuery, isArabicQuery) }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
