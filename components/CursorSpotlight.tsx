"use client";

import { useEffect } from "react";

/**
 * Global cursor spotlight — a soft golden glow that tracks the pointer
 * across the whole viewport. Renders one absolute layer pinned to the
 * <body> and updates a single CSS variable (--cur-x / --cur-y) via rAF.
 *
 * Cheap (rAF-coalesced pointermove, no React re-renders) and accessibility-
 * safe (disabled on `prefers-reduced-motion` and on coarse-pointer
 * devices i.e. touch).
 *
 * The actual glow is painted by CSS in shared.css using `.app-spotlight`
 * — see that selector for the visual.
 */
export function CursorSpotlight() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    let raf = 0;
    let nx = 50;
    let ny = 50;

    const apply = () => {
      raf = 0;
      root.style.setProperty("--cur-x", nx.toFixed(2) + "%");
      root.style.setProperty("--cur-y", ny.toFixed(2) + "%");
    };

    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 100;
      ny = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.body.classList.add("has-cursor-spotlight");

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.body.classList.remove("has-cursor-spotlight");
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
