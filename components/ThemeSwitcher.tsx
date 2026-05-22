"use client";

import { THEMES, useTheme, type Theme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const TITLES: Record<Theme, string> = {
  light:  "Светлая",
  sepia:  "Сепия",
  mushaf: "Мусхаф",
  dark:   "Ночь",
};

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" };
  switch (theme) {
    case "light":
      return (
        <svg {...common} strokeWidth={1.8}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "sepia":
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" />
          <path d="M8 7h7M8 11h7M8 15h5" />
        </svg>
      );
    case "mushaf":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M12 3 L13.5 10 L20 12 L13.5 14 L12 21 L10.5 14 L4 12 L10.5 10 Z" />
        </svg>
      );
    case "dark":
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      );
  }
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Тема"
      className="inline-flex items-center rounded-full border border-border bg-surface p-[3px]"
    >
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          title={TITLES[t]}
          aria-pressed={theme === t}
          onClick={() => setTheme(t)}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full transition-colors",
            theme === t
              ? "bg-bg text-accent shadow-[var(--shadow-1)]"
              : "text-fg-dim hover:text-fg",
          )}
        >
          <ThemeIcon theme={t} />
        </button>
      ))}
    </div>
  );
}
