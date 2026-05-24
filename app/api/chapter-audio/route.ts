import { NextResponse } from "next/server";
import { quranApi } from "@/lib/api/quran";
import { RECITERS, mp3quranChapterUrl } from "@/lib/quran/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reciterId = Number(url.searchParams.get("reciter"));
  const chapter = Number(url.searchParams.get("chapter"));

  const reciter = RECITERS.find((r) => r.id === reciterId);
  if (!Number.isInteger(reciterId) || !reciter) {
    return NextResponse.json({ error: "invalid_reciter" }, { status: 400 });
  }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return NextResponse.json({ error: "invalid_chapter" }, { status: 400 });
  }

  // mp3quran.net reciters: build URL directly from the server pattern,
  // no upstream API hop needed.
  const directUrl = mp3quranChapterUrl(reciter, chapter);
  if (directUrl) {
    return NextResponse.json({ url: directUrl });
  }

  // Quran.com reciters: go through the existing chapter_recitations API.
  try {
    const audioUrl = await quranApi.chapterAudio(reciterId, chapter);
    return NextResponse.json({ url: audioUrl });
  } catch (err) {
    console.error("[chapter-audio] failed", err);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
