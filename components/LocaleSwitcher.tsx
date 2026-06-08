"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Build the URL for a target locale ourselves instead of relying on the
// next-intl router. The router-based version was throwing in some RTL
// browser-renders when switching out of /ar — a hard <a href> nav has
// none of those moving parts and always works.
const DEFAULT_LOCALE = routing.defaultLocale;
function buildLocaleHref(targetLocale: Locale, currentPath: string): string {
  // usePathname() from @/i18n/navigation strips the locale prefix, so
  // currentPath looks like "/" or "/reader/2/255". For the default
  // locale we render the path bare (localePrefix: "as-needed").
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
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
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
          className="z-[70] min-w-[12rem] overflow-hidden rounded-xl border border-border-strong bg-surface p-1.5 shadow-lg"
        >
          {routing.locales.map((lang) => (
            <DropdownMenu.Item asChild key={lang}>
              <a
                href={buildLocaleHref(lang, pathname)}
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
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
