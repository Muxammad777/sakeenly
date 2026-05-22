"use client";

import { useEffect } from "react";
import { Play } from "lucide-react";
import { AyahCard, type AyahCardData } from "./AyahCard";
import { TranslationToggle, useActiveTranslation } from "./TranslationToggle";
import { AudioPlayer } from "./AudioPlayer";
import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerProvider";

interface SurahHeader {
  number: number;
  nameSimple: string;
  nameArabic: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
}

interface SurahReaderProps {
  header: SurahHeader;
  ayat: AyahCardData[];
  initialAyah?: number;
  isAuthenticated: boolean;
}

export function SurahReader(props: SurahReaderProps) {
  return (
    <AudioPlayerProvider>
      <SurahReaderInner {...props} />
      <AudioPlayer />
    </AudioPlayerProvider>
  );
}

function SurahReaderInner({ header, ayat, initialAyah = 1, isAuthenticated }: SurahReaderProps) {
  const [active, setActive] = useActiveTranslation();
  const { current, playQueue } = useAudioPlayer();

  // Scroll to the initial ayah on mount (e.g. /reader/2/255 → Ayat al-Kursi).
  useEffect(() => {
    if (initialAyah <= 1) return;
    const el = document.getElementById(`ayah-${initialAyah}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialAyah]);

  const startSurah = () => {
    const queue = ayat
      .filter((a): a is AyahCardData & { audioUrl: string } => Boolean(a.audioUrl))
      .map((a) => ({ url: a.audioUrl, ayahKey: a.ayahKey, label: `Аят ${a.ayahKey}` }));
    playQueue(queue, 0);
  };

  return (
    <>
      <header className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-fg-muted">
          Сура {header.number}
          <span className="mx-2">·</span>
          {header.revelationPlace === "makkah" ? "Меккская" : "Мединская"}
          <span className="mx-2">·</span>
          {header.versesCount} аятов
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-fg sm:text-5xl">
          {header.nameSimple}
        </h1>
        <p dir="rtl" className="mt-2 font-arabic text-3xl text-accent">
          {header.nameArabic}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startSurah}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            <Play className="h-4 w-4" />
            Воспроизвести суру
          </button>
          <TranslationToggle active={active} onChange={setActive} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-32 pt-10 sm:px-6">
        {ayat.map((ayah) => (
          <AyahCard
            key={ayah.ayahKey}
            data={ayah}
            activeTranslation={active}
            isAuthenticated={isAuthenticated}
            isActive={current?.ayahKey === ayah.ayahKey}
          />
        ))}
      </main>
    </>
  );
}
