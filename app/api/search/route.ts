import { NextResponse } from "next/server";
import { searchQuran } from "@/lib/quran/search-corpus";
import { routing, type Locale } from "@/i18n/routing";

export const runtime = "nodejs"; // we read JSON from disk via require()

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const rawLocale = url.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : routing.defaultLocale;
  const limit = Math.min(80, Number(url.searchParams.get("limit") ?? 40));

  if (q.length < 2) {
    return NextResponse.json({ results: [], note: "min_length" }, { status: 200 });
  }

  const results = searchQuran(q, locale, limit);
  return NextResponse.json({
    query: q,
    locale,
    count: results.length,
    results,
  });
}
