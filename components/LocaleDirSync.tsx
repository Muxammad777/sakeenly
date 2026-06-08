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
    // and pointer-events:none on <body> after the menu has already been
    // removed from the DOM (known issue with hard nav / RTL). Detect it
    // and clean up automatically. Runs on mount AND watches body for
    // future stale-lock states.
    const body = document.body;
    const unlock = () => {
      const hasOpenRadixPopper = !!document.querySelector(
        "[data-radix-popper-content-wrapper], [data-state='open'][role='menu'], [data-state='open'][role='dialog']",
      );
      if (hasOpenRadixPopper) return;
      if (body.hasAttribute("data-scroll-locked")) {
        body.removeAttribute("data-scroll-locked");
      }
      if (body.style.pointerEvents === "none") body.style.removeProperty("pointer-events");
      if (body.style.overflow === "hidden") body.style.removeProperty("overflow");
      if (body.style.position === "relative") body.style.removeProperty("position");
      body.style.removeProperty("padding-right");
    };
    unlock();

    const obs = new MutationObserver(unlock);
    obs.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked", "style"] });
    return () => obs.disconnect();
  }, [locale, dir]);
  return null;
}
