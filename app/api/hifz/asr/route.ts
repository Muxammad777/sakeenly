// POST /api/hifz/asr
//
// Body: multipart/form-data { audio: <Blob>, lang?: "ar" }
// Returns: { text: "..." }
//
// Proxies the audio to OpenAI Whisper (`whisper-1`). Universally
// recognizes Arabic — works around the fact that Web Speech API only
// supports Arabic in true Google Chrome (not Yandex/Brave/Edge/Opera).

import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Whisper can take a few seconds for longer clips; bump from the
// default 10s edge timeout. Vercel doesn't apply here — we're on
// Railway with no hard ceiling, but still set explicit so future hosts
// can see the intent.
export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "asr_not_configured", message: "OPENAI_API_KEY missing on server" },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "missing_audio" }, { status: 400 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: "empty_audio" }, { status: 400 });
  }
  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
  }

  const lang = (form.get("lang") as string | null) ?? "ar";

  // Forward to OpenAI as multipart. The Web Fetch FormData passes the
  // Blob through transparently — we re-wrap it with a filename so
  // Whisper picks the right decoder (webm/ogg/mp4).
  const upstream = new FormData();
  const filename = (audio as File).name || "recite.webm";
  upstream.append("file", audio, filename);
  upstream.append("model", "whisper-1");
  upstream.append("language", lang);
  upstream.append("response_format", "json");
  // Lower temperature → fewer hallucinations on short clips.
  upstream.append("temperature", "0");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[hifz/asr] whisper failed:", res.status, detail);
    return NextResponse.json(
      { error: "upstream_failed", status: res.status, detail: detail.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { text?: string };
  return NextResponse.json({ text: data.text ?? "" });
}
