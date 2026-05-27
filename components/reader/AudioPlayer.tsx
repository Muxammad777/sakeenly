"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play, X, Loader2, ChevronDown } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { RECITERS, DEFAULT_RECITER_SLUG } from "@/lib/quran/constants";

export function AudioPlayer() {
  const t = useTranslations("rd");
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
  const currentReciter = RECITERS.find((r) => r.slug === currentSlug) ?? RECITERS[0];

  const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set("reciter", e.target.value);
    window.location.assign(url.toString());
  };

  return (
    <div
      role="region"
      aria-label={t("audio_player")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-bg-elevated/80"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? t("pop_pause") : t("pop_listen")}
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
            {current.label ?? `${t("ayah")} ${current.ayahKey}`}
          </p>
          {isReader ? (
            // Reciter chip — visible label + chevron. Tapping opens the
            // OS-native select via the overlaid invisible <select>. This
            // gives users a clear "swipe through 30 reciters" affordance
            // without redesigning the whole player into a bottom sheet.
            <label className="relative inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 mt-1 text-[11px] text-fg-muted cursor-pointer hover:border-accent">
              <span className="truncate max-w-[160px] sm:max-w-[280px]">
                {currentReciter.name}{currentReciter.style ? ` · ${currentReciter.style}` : ""}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
              <select
                value={currentSlug}
                onChange={handleReciterChange}
                aria-label={t("reciter_h")}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ fontSize: 16 /* prevent iOS zoom */ }}
              >
                {RECITERS.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}{r.style ? ` · ${r.style}` : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-xs text-fg-muted">Sakeenly · {current.ayahKey}</p>
          )}
        </div>

        <button
          type="button"
          onClick={stop}
          aria-label={t("pop_stop")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-muted transition-colors hover:bg-bg hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
