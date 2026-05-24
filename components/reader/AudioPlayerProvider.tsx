"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface QueueItem {
  url: string;
  /** "1:1" — used to expose currently playing verse to the rest of the UI */
  ayahKey: string;
  label?: string;
}

interface AudioPlayerCtx {
  current: QueueItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  playOne: (item: QueueItem) => void;
  playQueue: (items: QueueItem[], startIndex?: number) => void;
  toggle: () => void;
  stop: () => void;
}

const Ctx = createContext<AudioPlayerCtx | null>(null);

/**
 * Dual-element gapless audio engine.
 *
 * Two <audio> elements (A, B) are kept ready at all times. The "active"
 * one plays the current item; the "standby" one is preloaded with the
 * next item's src. When `ended` fires on the active element, we
 * instantly call `standby.play()` and swap roles — no time is lost to
 * `audio.src = ...` + the browser fetching/parsing the next MP3.
 *
 * The only remaining inter-ayah gap is the natural silence baked into
 * each per-ayah Quran.com MP3 (reciter's breath/pause as adab). That
 * is content, not a bug.
 */
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeKey = useRef<"A" | "B">("A");
  const queueRef = useRef<QueueItem[]>([]);
  const indexRef = useRef(0);

  const [current, setCurrent] = useState<QueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getActive = () => activeKey.current === "A" ? audioARef.current : audioBRef.current;
  const getStandby = () => activeKey.current === "A" ? audioBRef.current : audioARef.current;

  // Preload an item's src into the standby element so it's ready the
  // instant the active element fires `ended`.
  const preloadStandby = (item: QueueItem | undefined) => {
    const standby = getStandby();
    if (!standby || !item?.url) return;
    if (standby.src !== item.url) {
      standby.src = item.url;
      // load() ensures the browser starts buffering immediately rather
      // than waiting until the element is asked to play.
      standby.load();
    }
  };

  useEffect(() => {
    const a = new Audio();
    const b = new Audio();
    a.preload = "auto";
    b.preload = "auto";
    audioARef.current = a;
    audioBRef.current = b;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      // Only consider the player paused when the ACTIVE element pauses.
      if (getActive()?.paused) setIsPlaying(false);
    };
    const onWaiting = (e: Event) => {
      if (e.currentTarget === getActive()) setIsLoading(true);
    };
    const onCanPlay = (e: Event) => {
      if (e.currentTarget === getActive()) setIsLoading(false);
    };

    // Gapless handoff: when the active element ends, the standby (if it
    // has the right next-item src) plays immediately, and we swap roles.
    const onEnded = (e: Event) => {
      const ended = e.currentTarget as HTMLAudioElement;
      if (ended !== getActive()) return;
      const nextIdx = indexRef.current + 1;
      const next = queueRef.current[nextIdx];
      if (!next) {
        setIsPlaying(false);
        setCurrent(null);
        return;
      }
      // Swap which element is active. Standby already has next.url.
      activeKey.current = activeKey.current === "A" ? "B" : "A";
      indexRef.current = nextIdx;
      setCurrent(next);
      const newActive = getActive();
      if (newActive) {
        // Reset to 0 in case it had been partially auto-buffered past start.
        try { newActive.currentTime = 0; } catch {}
        void newActive.play().catch(() => setIsLoading(false));
      }
      // Preload N+2 into the freshly-free standby element.
      preloadStandby(queueRef.current[nextIdx + 1]);
      // The old "active" element keeps its src for now; standby will be
      // overwritten on the next handoff cycle.
    };

    for (const el of [a, b]) {
      el.addEventListener("play", onPlay);
      el.addEventListener("pause", onPause);
      el.addEventListener("waiting", onWaiting);
      el.addEventListener("canplay", onCanPlay);
      el.addEventListener("ended", onEnded);
    }

    return () => {
      for (const el of [a, b]) {
        el.pause();
        el.removeEventListener("play", onPlay);
        el.removeEventListener("pause", onPause);
        el.removeEventListener("waiting", onWaiting);
        el.removeEventListener("canplay", onCanPlay);
        el.removeEventListener("ended", onEnded);
      }
      audioARef.current = null;
      audioBRef.current = null;
    };
  }, []);

  function loadAndPlay(item: QueueItem, indexInQueue: number) {
    const active = getActive();
    if (!active) return;
    setCurrent(item);
    setIsLoading(true);
    // Avoid reloading the same src (could already have been preloaded as
    // the standby — but we're starting fresh so just set + play).
    if (active.src !== item.url) active.src = item.url;
    try { active.currentTime = 0; } catch {}
    void active.play().catch(() => setIsLoading(false));
    // Prime the standby with the NEXT item so the handoff is gapless.
    preloadStandby(queueRef.current[indexInQueue + 1]);
  }

  const playOne = useCallback((item: QueueItem) => {
    queueRef.current = [item];
    indexRef.current = 0;
    loadAndPlay(item, 0);
  }, []);

  const playQueue = useCallback((items: QueueItem[], startIndex = 0) => {
    if (items.length === 0) return;
    queueRef.current = items;
    const start = Math.max(0, Math.min(startIndex, items.length - 1));
    indexRef.current = start;
    loadAndPlay(items[start], start);
  }, []);

  const toggle = useCallback(() => {
    const active = getActive();
    if (!active || !current) return;
    if (active.paused) void active.play().catch(() => {});
    else active.pause();
  }, [current]);

  const stop = useCallback(() => {
    const a = audioARef.current;
    const b = audioBRef.current;
    if (a) { a.pause(); try { a.currentTime = 0; } catch {} }
    if (b) { b.pause(); try { b.currentTime = 0; } catch {} }
    queueRef.current = [];
    indexRef.current = 0;
    setCurrent(null);
    setIsPlaying(false);
  }, []);

  return (
    <Ctx.Provider value={{ current, isPlaying, isLoading, playOne, playQueue, toggle, stop }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
  return ctx;
}
