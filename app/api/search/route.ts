import { NextResponse } from "next/server";
import { searchQuran } from "@/lib/quran/search-corpus";
import { routing, type Locale } from "@/i18n/routing";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const rawLocale = url.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : routing.defaultLocale;
  const limit = Math.min(3000, Number(url.searchParams.get("limit") ?? 2000));
  const exactOnly = url.searchParams.get("exact") === "1";

  if (q.length < 2) {
    return NextResponse.json({ results: [], note: "min_length" }, { status: 200 });
  }

  const results = searchQuran(q, locale, { limit, exactOnly });
  return NextResponse.json({
    query: q,
    locale,
    exactOnly,
    count: results.length,
    results,
  });
}
