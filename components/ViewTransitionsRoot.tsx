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

// `Document.startViewTransition` exists in lib.dom on TS 5.4+; we just
// re-grab it as `any` to stay compatible with the Next 14 TS bundle.

export function ViewTransitionsRoot() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const startVT = (document as unknown as { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (typeof startVT !== "function") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = function (...args) {
      const apply = () => origPush(...args);
      try {
        startVT(() => { apply(); });
      } catch {
        apply();
      }
    } as typeof history.pushState;

    history.replaceState = function (...args) {
      const apply = () => origReplace(...args);
      try {
        startVT(() => { apply(); });
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
