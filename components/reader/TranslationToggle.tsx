"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  TRANSLATIONS,
  type TranslationKey,
  DEFAULT_TRANSLATION_KEY,
  DEFAULT_TRANSLATION_BY_LOCALE,
} from "@/lib/quran/constants";
import { cn } from "@/lib/utils";

// Per-locale storage so a user reading on /ru can keep Kuliev while reading
// on /kk keeps Altay, etc. Without this, the last picked translation would
// leak across locales and Ayati (tg) could appear on the Kazakh page.
const storageKeyFor = (locale: string) => `sakeenly.translation.${locale}`;

export function useActiveTranslation(): [TranslationKey, (next: TranslationKey) => void] {
  const locale = useLocale();
  const localeDefault = DEFAULT_TRANSLATION_BY_LOCALE[locale] ?? DEFAULT_TRANSLATION_KEY;
  const [active, setActive] = useState<TranslationKey>(localeDefault);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKeyFor(locale)) as TranslationKey | null;
      if (stored && TRANSLATIONS.some((t) => t.key === stored)) setActive(stored);
      else setActive(localeDefault);
    } catch {
      /* ignore */
    }
  }, [locale, localeDefault]);

  const update = (next: TranslationKey) => {
    setActive(next);
    try {
      window.localStorage.setItem(storageKeyFor(locale), next);
    } catch {
      /* ignore */
    }
  };

  return [active, update];
}

export function TranslationToggle({
  active,
  onChange,
  className,
}: {
  active: TranslationKey;
  onChange: (next: TranslationKey) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Translation"
      className={cn(
        "flex flex-wrap gap-1 rounded-full border border-border bg-bg-elevated/40 p-1",
        className,
      )}
    >
      {TRANSLATIONS.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            active === t.key
              ? "bg-accent text-accent-fg"
              : "text-fg-muted hover:bg-bg hover:text-fg",
          )}
        >
          {t.short}
          <span className="ml-1 text-[10px] uppercase opacity-60">{t.language}</span>
        </button>
      ))}
    </div>
  );
}
