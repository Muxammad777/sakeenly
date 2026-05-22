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

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const indexRef = useRef(0);

  const [current, setCurrent] = useState<QueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create the <audio> element once on mount.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => {
      const next = indexRef.current + 1;
      if (next < queueRef.current.length) {
        indexRef.current = next;
        loadAndPlay(queueRef.current[next]);
      } else {
        setIsPlaying(false);
        setCurrent(null);
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, []);

  function loadAndPlay(item: QueueItem) {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(item);
    setIsLoading(true);
    audio.src = item.url;
    audio.play().catch(() => setIsLoading(false));
  }

  const playOne = useCallback((item: QueueItem) => {
    queueRef.current = [item];
    indexRef.current = 0;
    loadAndPlay(item);
  }, []);

  const playQueue = useCallback((items: QueueItem[], startIndex = 0) => {
    if (items.length === 0) return;
    queueRef.current = items;
    indexRef.current = Math.max(0, Math.min(startIndex, items.length - 1));
    loadAndPlay(items[indexRef.current]);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
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
