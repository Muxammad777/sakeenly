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

const STORAGE_KEY = "sakeenly.translation";

export function useActiveTranslation(): [TranslationKey, (next: TranslationKey) => void] {
  const locale = useLocale();
  const localeDefault = DEFAULT_TRANSLATION_BY_LOCALE[locale] ?? DEFAULT_TRANSLATION_KEY;
  const [active, setActive] = useState<TranslationKey>(localeDefault);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as TranslationKey | null;
      if (stored && TRANSLATIONS.some((t) => t.key === stored)) setActive(stored);
      else setActive(localeDefault);
    } catch {
      /* ignore */
    }
  }, [localeDefault]);

  const update = (next: TranslationKey) => {
    setActive(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
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
