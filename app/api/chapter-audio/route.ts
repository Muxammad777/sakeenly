import { NextResponse } from "next/server";
import { quranApi } from "@/lib/api/quran";
import { RECITERS } from "@/lib/quran/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reciter = Number(url.searchParams.get("reciter"));
  const chapter = Number(url.searchParams.get("chapter"));

  if (!Number.isInteger(reciter) || !RECITERS.some((r) => r.id === reciter)) {
    return NextResponse.json({ error: "invalid_reciter" }, { status: 400 });
  }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return NextResponse.json({ error: "invalid_chapter" }, { status: 400 });
  }

  try {
    const audioUrl = await quranApi.chapterAudio(reciter, chapter);
    return NextResponse.json({ url: audioUrl });
  } catch (err) {
    console.error("[chapter-audio] failed", err);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
