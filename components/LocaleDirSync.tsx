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
  }, [locale, dir]);
  return null;
}
