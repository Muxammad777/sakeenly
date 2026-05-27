import type { MetadataRoute } from "next";
import { EMOTIONS } from "@/lib/data/emotions";
import { PROPHET_STORIES } from "@/lib/data/prophet-stories";
import { routing } from "@/i18n/routing";

const BASE = "https://sakeenly.com";

/**
 * Build a URL for a given path under a given locale.
 *
 * Honours `localePrefix: "as-needed"` — the default locale (`ru`) ships
 * naked URLs (`/ayat`), every other locale gets a prefix (`/en/ayat`).
 * Keeps the canonical RU SEO surface untouched while exposing the new
 * languages to crawlers.
 */
function loc(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${BASE}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];

  const staticPaths: Array<{ path: string; freq: "weekly" | "monthly" | "yearly"; priority: number }> = [
    { path: "/",                freq: "weekly",  priority: 1.0 },
    { path: "/ayat",            freq: "weekly",  priority: 0.9 },
    { path: "/listen",          freq: "monthly", priority: 0.8 },
    { path: "/ask",             freq: "monthly", priority: 0.8 },
    { path: "/kids",            freq: "monthly", priority: 0.7 },
    { path: "/kids/alphabet",   freq: "monthly", priority: 0.6 },
    { path: "/kids/surahs",     freq: "monthly", priority: 0.6 },
    { path: "/kids/stories",    freq: "monthly", priority: 0.6 },
    { path: "/about",           freq: "yearly",  priority: 0.5 },
    { path: "/privacy",         freq: "yearly",  priority: 0.4 },
  ];

  for (const { path, freq, priority } of staticPaths) {
    for (const locale of routing.locales) {
      out.push({
        url: loc(locale, path),
        lastModified: now,
        changeFrequency: freq,
        priority: locale === routing.defaultLocale ? priority : Math.max(0.3, priority - 0.1),
      });
    }
  }

  for (const e of EMOTIONS) {
    for (const locale of routing.locales) {
      out.push({
        url: loc(locale, `/ayat/${e.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: locale === routing.defaultLocale ? 0.7 : 0.6,
      });
    }
  }

  for (const p of PROPHET_STORIES) {
    for (const locale of routing.locales) {
      out.push({
        url: loc(locale, `/kids/stories/${p.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: locale === routing.defaultLocale ? 0.6 : 0.5,
      });
    }
  }

  // First 5 surahs as canonical reader entry points for SEO, per locale.
  for (const surahId of [1, 108, 112, 113, 114]) {
    for (const locale of routing.locales) {
      out.push({
        url: loc(locale, `/reader/${surahId}/1`),
        lastModified: now,
        changeFrequency: "yearly",
        priority: locale === routing.defaultLocale ? 0.6 : 0.5,
      });
    }
  }

  return out;
}
