"use client";

import { Pause, Play, X, Loader2 } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerProvider";

export function AudioPlayer() {
  const { current, isPlaying, isLoading, toggle, stop } = useAudioPlayer();
  if (!current) return null;

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
          className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90"
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

        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-bg hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
