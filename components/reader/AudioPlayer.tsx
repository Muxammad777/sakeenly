"use client";

import { useEffect, useState } from "react";
import { Pause, Play, X, Loader2 } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { RECITERS, DEFAULT_RECITER_SLUG } from "@/lib/quran/constants";

export function AudioPlayer() {
  const { current, isPlaying, isLoading, toggle, stop } = useAudioPlayer();
  // Read URL via window.* instead of useSearchParams() — the hook forces
  // every page rendering AudioPlayer (e.g. /listen) to bail out of static
  // rendering unless wrapped in Suspense. The player itself is purely
  // client-side anyway, so window.* is the right primitive here.
  const [pathname, setPathname] = useState("");
  const [currentSlug, setCurrentSlug] = useState(DEFAULT_RECITER_SLUG);
  useEffect(() => {
    const sync = () => {
      setPathname(window.location.pathname);
      const sp = new URLSearchParams(window.location.search);
      setCurrentSlug(sp.get("reciter") ?? DEFAULT_RECITER_SLUG);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  if (!current) return null;

  // Reciter switching is only meaningful on /reader/* pages — that's the
  // only place audio URLs are tied to a server-resolved reciter param.
  const isReader = /\/reader\//.test(pathname);

  const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set("reciter", e.target.value);
    window.location.assign(url.toString());
  };

  return (
    <div
      role="region"
      aria-label="Audio player"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-bg-elevated/80"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">
            {current.label ?? `Аят ${current.ayahKey}`}
          </p>
          <p className="text-xs text-fg-muted">Sakeenly · {current.ayahKey}</p>
        </div>

        {isReader ? (
          <select
            value={currentSlug}
            onChange={handleReciterChange}
            aria-label="Чтец"
            className="hidden sm:block rounded-full border border-border bg-surface px-3 py-2 text-xs text-fg outline-none focus:border-accent"
            style={{ fontFamily: "inherit" }}
          >
            {RECITERS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}{r.style ? ` · ${r.style}` : ""}
              </option>
            ))}
          </select>
        ) : null}

        {/* Mobile-only compact reciter button — opens native select via label. */}
        {isReader ? (
          <label className="sm:hidden relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-fg-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
            </svg>
            <select
              value={currentSlug}
              onChange={handleReciterChange}
              aria-label="Чтец"
              className="absolute inset-0 opacity-0"
              style={{ fontSize: 16 /* prevent iOS zoom */ }}
            >
              {RECITERS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}{r.style ? ` · ${r.style}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-muted transition-colors hover:bg-bg hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
