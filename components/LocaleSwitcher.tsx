"use client";

import { useLocale } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Build the target URL ourselves and ship it as a plain <a href>. Soft
// nav via Next would be ideal but next-intl's router.replace threw in
// some RTL renders; plain anchors always work.
const DEFAULT_LOCALE = routing.defaultLocale;
function buildLocaleHref(targetLocale: Locale, currentPath: string): string {
  const clean = currentPath === "/" ? "" : currentPath;
  if (targetLocale === DEFAULT_LOCALE) return clean || "/";
  return `/${targetLocale}${clean}`;
}

const LANG_META: Record<Locale, { native: string; short: string }> = {
  ru: { native: "Русский", short: "РУС" },
  en: { native: "English", short: "EN" },
  ar: { native: "العربية", short: "AR" },
  fa: { native: "فارسی", short: "FA" },
  tg: { native: "Тоҷикӣ", short: "ТҶК" },
  uz: { native: "Oʻzbek", short: "UZB" },
  kk: { native: "Қазақ", short: "ҚАЗ" },
  ky: { native: "Кыргыз", short: "КЫР" },
  ur: { native: "اردو", short: "UR" },
  ms: { native: "Melayu", short: "MS" },
  hi: { native: "हिन्दी", short: "HI" },
  id: { native: "Indonesia", short: "ID" },
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  // Clean exit: before we hard-nav to the new locale, manually close
  // out Radix's scroll-lock side-effects. Otherwise the lock attribute
  // + pointer-events:none get inherited by the next page document and
  // every interactive element looks dead.
  const cleanUpAndNav = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const body = document.body;
    body.removeAttribute("data-scroll-locked");
    body.style.removeProperty("pointer-events");
    body.style.removeProperty("overflow");
    body.style.removeProperty("position");
    body.style.removeProperty("padding-right");
    // Defer one tick so Radix's own teardown gets to run first; then nav.
    requestAnimationFrame(() => { window.location.assign(href); });
  };

  return (
    <DropdownMenu.Root dir="ltr">
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Язык / Language"
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 font-mono text-[11px] tracking-[0.08em] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
        >
          <Globe className="h-3 w-3 text-accent" />
          <span>{LANG_META[locale].short}</span>
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[70] min-w-[12rem] overflow-hidden rounded-xl border border-border-strong bg-surface p-1.5 shadow-lg"
        >
          {routing.locales.map((lang) => {
            const href = buildLocaleHref(lang, pathname);
            return (
              <DropdownMenu.Item asChild key={lang}>
                <a
                  href={href}
                  onClick={cleanUpAndNav(href)}
                  className={cn(
                    "flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors no-underline",
                    "data-[highlighted]:bg-surface-2",
                    lang === locale ? "bg-accent/14 text-accent" : "text-fg",
                  )}
                >
                  <span>{LANG_META[lang].native}</span>
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[0.08em]",
                      lang === locale ? "text-accent" : "text-fg-dim",
                    )}
                  >
                    {LANG_META[lang].short}
                  </span>
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
