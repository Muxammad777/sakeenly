"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, Headphones, Loader2, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArabicText } from "@/components/reader/ArabicText";

interface VerseCardProps {
  verseKey: string;
  surah: number;
  ayah: number;
  arabic: string;
  translationHtml: string;
  translationAuthor: string;
  audioUrl?: string;
  emphasis?: string;
  surahName?: string;
}

export function VerseCard({
  verseKey,
  surah,
  ayah,
  arabic,
  translationHtml,
  translationAuthor,
  audioUrl,
  emphasis,
  surahName,
}: VerseCardProps) {
  const t = useTranslations("rd");
  const tAem = useTranslations("aem");
  const tSn = useTranslations("sn");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    if (!audioUrl) return;
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.addEventListener("playing", () => setState("playing"));
      audio.addEventListener("waiting", () => setState("loading"));
      audio.addEventListener("ended", () => setState("idle"));
      audio.addEventListener("pause", () => {
        if (!audio!.ended) setState("idle");
      });
    }
    if (audio.paused) {
      setState("loading");
      audio.play().catch(() => setState("idle"));
    } else {
      audio.pause();
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-bg-elevated/30 p-6 sm:p-8">
      <header className="mb-3 flex items-center justify-between gap-2 text-xs text-fg-muted">
        <span className="font-mono">{verseKey}</span>
        <span className="truncate">{surahName ?? `${t("surah_prefix")} ${tSn(String(surah))}`}</span>
      </header>

      {emphasis ? (
        <p className="mb-4 font-display text-xl leading-snug text-fg sm:text-2xl">{emphasis}</p>
      ) : null}

      <ArabicText text={arabic} ayahNumber={ayah} />

      <div
        className="mt-5 max-w-prose text-pretty leading-relaxed text-fg-muted"
        dangerouslySetInnerHTML={{ __html: translationHtml }}
      />
      <p className="mt-2 text-xs uppercase tracking-wider text-fg-muted/70">
        {translationAuthor}
      </p>

      <footer className="mt-6 flex flex-wrap items-center gap-3">
        {audioUrl ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={state === "playing" ? t("pop_pause") : t("pop_listen")}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-bg px-4 text-sm text-fg transition-colors hover:bg-bg-elevated"
          >
            {state === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : state === "playing" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
            {state === "playing" ? t("pop_pause") : t("pop_listen")}
          </button>
        ) : null}
        <Link
          href={`/reader/${surah}/${ayah}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          {tAem("cta_btn_primary")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </article>
  );
}
