import type { MetadataRoute } from "next";
import { EMOTIONS } from "@/lib/data/emotions";
import { PROPHET_STORIES } from "@/lib/data/prophet-stories";

const BASE = "https://sakeenly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/ayat`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/listen`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ask`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/kids`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/kids/alphabet`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/kids/surahs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/kids/stories`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const emotionRoutes: MetadataRoute.Sitemap = EMOTIONS.map((e) => ({
    url: `${BASE}/ayat/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const prophetRoutes: MetadataRoute.Sitemap = PROPHET_STORIES.map((p) => ({
    url: `${BASE}/kids/stories/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // First 5 surahs as canonical reader entry points for SEO.
  const readerRoutes: MetadataRoute.Sitemap = [1, 108, 112, 113, 114].map((s) => ({
    url: `${BASE}/reader/${s}/1`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...emotionRoutes, ...prophetRoutes, ...readerRoutes];
}
