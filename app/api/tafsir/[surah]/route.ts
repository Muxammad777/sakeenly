// GET /api/tafsir/[surah]?author=ibn-kathir|saddi&locale=ru&ayahs=1,2,3
//
// Returns the verse-level commentary for every requested ayah in one
// call so the reader doesn't fire 286 requests for Al-Baqarah. The
// commentary comes from local JSON in lib/knowledge/tafsir/* — no
// external API.

import { NextResponse } from "next/server";
import { getTafsirRange, type TafsirAuthor } from "@/lib/knowledge/tafsir";

export const runtime = "nodejs";

const ALLOWED_AUTHORS = new Set<TafsirAuthor>(["ibn-kathir", "saddi", "jalalayn", "muyassar"]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ surah: string }> },
) {
  const { surah: surahStr } = await params;
  const surah = Number(surahStr);
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "invalid_surah" }, { status: 400 });
  }
  const url = new URL(req.url);
  const author = url.searchParams.get("author") as TafsirAuthor | null;
  const locale = url.searchParams.get("locale") ?? "ru";
  const ayahsParam = url.searchParams.get("ayahs") ?? "";
  if (!author || !ALLOWED_AUTHORS.has(author)) {
    return NextResponse.json({ error: "invalid_author" }, { status: 400 });
  }
  const ayahs = ayahsParam
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 300);
  if (!ayahs.length) return NextResponse.json({ items: [] });

  const items = await getTafsirRange(surah, ayahs, author, locale);
  return NextResponse.json({
    surah,
    author,
    items: items.map((it, i) => it ? { ayah: ayahs[i], text: it.text, lang: it.lang } : { ayah: ayahs[i], text: null, lang: null }),
  });
}
