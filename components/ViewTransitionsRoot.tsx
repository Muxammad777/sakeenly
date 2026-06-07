"use client";

// Browser-native View Transitions API bridge for Next.js client-side navs.
//
// We monkey-patch history.pushState / replaceState — Next's router calls
// these on every soft navigation — and wrap them in document.startViewTransition.
// The browser plays a cross-fade between the old and new DOM. Falls back to
// plain navigation in browsers without the API (Firefox < 130, Safari < 18).
//
// Honours prefers-reduced-motion (skips the wrap entirely).

import { useEffect } from "react";

declare global {
  interface Document {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  }
}

export function ViewTransitionsRoot() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.startViewTransition) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = function (...args) {
      const apply = () => origPush(...args);
      try {
        document.startViewTransition!(() => { apply(); });
      } catch {
        apply();
      }
    } as typeof history.pushState;

    history.replaceState = function (...args) {
      const apply = () => origReplace(...args);
      try {
        document.startViewTransition!(() => { apply(); });
      } catch {
        apply();
      }
    } as typeof history.replaceState;

    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return null;
}
