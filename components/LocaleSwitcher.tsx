"use client";

// Locale switcher — plain useState dropdown.
//
// Previously used Radix DropdownMenu, but the Portal-based render
// interacted badly with other client trees (e.g. KidsProvider on
// /kids/muallim) and the language links became unresponsive in some
// browsers. A plain controlled <button>/<ul> dropdown is bulletproof
// here — no portals, no scroll-locks, no asChild forwarding gotchas.

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const DEFAULT_LOCALE = routing.defaultLocale;
function buildLocaleHref(targetLocale: Locale, currentPath: string): string {
  const clean = currentPath === "/" ? "" : currentPath;
  if (targetLocale === DEFAULT_LOCALE) return clean || "/";
  return `/${targetLocale}${clean}`;
}

const LANG_META: Record<Locale, { native: string; short: string }> = {
  ru: { native: "Русский",   short: "РУС" },
  en: { native: "English",   short: "EN" },
  ar: { native: "العربية",   short: "AR" },
  fa: { native: "فارسی",     short: "FA" },
  tg: { native: "Тоҷикӣ",    short: "ТҶК" },
  uz: { native: "Oʻzbek",    short: "UZB" },
  kk: { native: "Қазақ",     short: "ҚАЗ" },
  ky: { native: "Кыргыз",    short: "КЫР" },
  ur: { native: "اردو",      short: "UR" },
  ms: { native: "Melayu",    short: "MS" },
  hi: { native: "हिन्दी",     short: "HI" },
  id: { native: "Indonesia", short: "ID" },
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block" dir="ltr">
      <button
        type="button"
        aria-label="Язык / Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 font-mono text-[11px] tracking-[0.08em] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
      >
        <Globe className="h-3 w-3 text-accent" />
        <span>{LANG_META[locale].short}</span>
        <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] flex min-w-[12rem] flex-col overflow-hidden rounded-xl border border-border-strong bg-surface p-1.5 shadow-lg"
        >
          {routing.locales.map((lang) => {
            const href = buildLocaleHref(lang, pathname);
            const isCurrent = lang === locale;
            const onSelect = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              // Write the locale cookie BEFORE navigating so the
              // next-intl middleware honours the new choice. Without this
              // the cookie still holds the previous locale and the
              // "as-needed" middleware can route the bare /path back to
              // the old language (notably when switching TO the default
              // Russian, whose URL has no /ru prefix).
              document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
              window.location.assign(href);
            };
            return (
              <li key={lang}>
                <a
                  href={href}
                  role="option"
                  aria-selected={isCurrent}
                  onClick={onSelect}
                  className={cn(
                    "flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm no-underline transition-colors hover:bg-surface-2",
                    isCurrent ? "bg-accent/14 text-accent" : "text-fg",
                  )}
                >
                  <span>{LANG_META[lang].native}</span>
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[0.08em]",
                      isCurrent ? "text-accent" : "text-fg-dim",
                    )}
                  >
                    {LANG_META[lang].short}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
