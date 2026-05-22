import type { Config } from "tailwindcss";

/**
 * Tailwind tokens map onto the OKLCH design-system variables defined in
 * app/globals.css.  Use `bg-accent`, `text-fg`, `border-border`, etc. across
 * the codebase — the four-theme switcher in components/ThemeProvider toggles
 * `data-theme="dark|light|sepia|mushaf"` on `<html>` to swap the values.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:               "oklch(var(--bg) / <alpha-value>)",
        "bg-deep":        "oklch(var(--bg-deep) / <alpha-value>)",
        surface:          "oklch(var(--surface) / <alpha-value>)",
        "surface-2":      "oklch(var(--surface-2) / <alpha-value>)",
        "bg-elevated":    "oklch(var(--surface) / <alpha-value>)", // legacy alias
        border:           "oklch(var(--border) / <alpha-value>)",
        "border-strong":  "oklch(var(--border-strong) / <alpha-value>)",
        fg:               "oklch(var(--text) / <alpha-value>)",
        "fg-muted":       "oklch(var(--text-2) / <alpha-value>)",
        "fg-dim":         "oklch(var(--text-3) / <alpha-value>)",
        accent:           "oklch(var(--accent) / <alpha-value>)",
        "accent-2":       "oklch(var(--accent-2) / <alpha-value>)",
        "accent-fg":      "oklch(var(--accent-fg) / <alpha-value>)",
        ring:             "oklch(var(--accent) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Spectral", "Georgia", "serif"],
        body:    ["var(--font-body)", "Golos Text", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        arabic:  ["KFGQPC-Hafs", "Amiri", "Scheherazade New", "Noto Naskh Arabic", "serif"],
      },
      maxWidth: { prose: "65ch" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.5s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
