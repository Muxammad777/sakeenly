"use client";

import { useEffect } from "react";

/**
 * Pushes the resolved locale's `lang`/`dir` onto the document root.
 *
 * Why a client component:
 *   `app/layout.tsx` (the file that owns <html>) is a SERVER component
 *   shared across every route — it can't read the dynamic [locale] param.
 *   So we ship neutral defaults (lang="ru" dir="ltr") in the root layout
 *   and have each locale layout hydrate the real values here.
 *
 * Safe with `suppressHydrationWarning` already set on <html>.
 */
export function LocaleDirSync({ locale, dir }: { locale: string; dir: "ltr" | "rtl" }) {
  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("lang") !== locale) html.setAttribute("lang", locale);
    if (html.getAttribute("dir") !== dir) html.setAttribute("dir", dir);

    // Radix's react-remove-scroll occasionally leaves data-scroll-locked
    // and inline lock styles on <body> after every popper has been
    // removed from the DOM (known issue with hard nav / RTL). Triple
    // defence:
    //   1. Unconditional unlock on mount — if a menu IS actually open,
    //      Radix will reapply on its next paint; a moment of "no lock"
    //      is harmless. Hard navigation cases always benefit.
    //   2. MutationObserver — re-checks after each future body mutation
    //      and clears the lock if no popper/menu/dialog is actually open.
    //   3. Polling fallback (1.5s interval) — same check, used as a last
    //      line of defence if a mutation slipped past the observer.
    const body = document.body;
    const hardClear = () => {
      body.removeAttribute("data-scroll-locked");
      body.style.removeProperty("pointer-events");
      body.style.removeProperty("overflow");
      body.style.removeProperty("position");
      body.style.removeProperty("padding-right");
    };
    const conditionalClear = () => {
      const hasOpen = !!document.querySelector(
        "[data-radix-popper-content-wrapper]," +
        "[data-state='open'][role='menu']," +
        "[data-state='open'][role='dialog']," +
        "[data-state='open'][role='listbox']",
      );
      if (!hasOpen) hardClear();
    };
    hardClear();
    const obs = new MutationObserver(conditionalClear);
    obs.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked", "style"] });
    const id = window.setInterval(conditionalClear, 1500);
    return () => { obs.disconnect(); window.clearInterval(id); };
  }, [locale, dir]);
  return null;
}
