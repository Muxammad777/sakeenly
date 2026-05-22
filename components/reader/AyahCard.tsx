"use client";

import { Headphones } from "lucide-react";
import { ArabicText } from "./ArabicText";
import { AyahMenu } from "./AyahMenu";
import { useAudioPlayer } from "./AudioPlayerProvider";
import {
  TRANSLATIONS,
  type TranslationKey,
  findTranslation,
} from "@/lib/quran/constants";
import { cn } from "@/lib/utils";

export interface AyahCardData {
  ayahKey: string;
  verseNumber: number;
  textUthmani: string;
  audioUrl?: string;
  /** Keyed by TranslationKey for fast lookup. */
  translationsByKey: Partial<Record<TranslationKey, string>>;
  isBookmarked: boolean;
  bookmarkNote: string | null;
}

interface AyahCardProps {
  data: AyahCardData;
  activeTranslation: TranslationKey;
  isAuthenticated: boolean;
  /** True when the global player is currently emitting THIS ayah's audio. */
  isActive: boolean;
}

export function AyahCard({ data, activeTranslation, isAuthenticated, isActive }: AyahCardProps) {
  const { playOne } = useAudioPlayer();
  const translation = findTranslation(activeTranslation);
  const translationText = data.translationsByKey[activeTranslation];

  return (
    <article
      id={`ayah-${data.verseNumber}`}
      data-ayah-key={data.ayahKey}
      className={cn(
        "scroll-mt-24 rounded-2xl border p-6 transition-colors sm:p-8",
        isActive
          ? "border-accent/60 bg-accent/5"
          : "border-border bg-bg-elevated/30 hover:border-border",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2 text-xs text-fg-muted">
        <span className="font-mono">{data.ayahKey}</span>
        <div className="flex items-center gap-1">
          {data.audioUrl ? (
            <button
              type="button"
              onClick={() => playOne({ url: data.audioUrl!, ayahKey: data.ayahKey })}
              aria-label={`Слушать аят ${data.ayahKey}`}
              className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-bg hover:text-fg"
            >
              <Headphones className="h-4 w-4" />
            </button>
          ) : null}
          <AyahMenu
            ayahKey={data.ayahKey}
            audioUrl={data.audioUrl}
            isBookmarked={data.isBookmarked}
            initialNote={data.bookmarkNote}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </header>

      <ArabicText text={data.textUthmani} ayahNumber={data.verseNumber} />

      {translationText ? (
        <div
          className="mt-5 max-w-prose text-pretty leading-relaxed text-fg-muted"
          // Quran.com returns HTML with footnote markers; render verbatim, no
          // user data is interpolated here.
          dangerouslySetInnerHTML={{ __html: translationText }}
        />
      ) : (
        <p className="mt-5 text-sm italic text-fg-muted">
          Перевод недоступен — выберите другой ({TRANSLATIONS.find((t) => t.key !== activeTranslation)?.short}).
        </p>
      )}
      <p className="mt-2 text-xs uppercase tracking-wider text-fg-muted/70">
        {translation.author}
      </p>
    </article>
  );
}
