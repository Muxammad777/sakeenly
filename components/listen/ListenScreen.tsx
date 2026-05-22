"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from "@/components/reader/AudioPlayerProvider";
import { AudioPlayer } from "@/components/reader/AudioPlayer";
import { RECITERS, type ReciterMeta } from "@/lib/quran/constants";

interface ChapterSummary {
  id: number;
  nameSimple: string;
  nameArabic: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
}

interface ListenScreenProps {
  chapters: ChapterSummary[];
}

const RECITER_AR: Record<string, string> = {
  mishary: "مشاري راشد العفاسي",
  basit: "عبد الباسط عبد الصمد",
  husary: "محمود خليل الحصري",
  sudais: "عبد الرحمن السديس",
  ghamdi: "سعد الغامدي",
  minshawi: "محمد صديق المنشاوي",
  shuraim: "سعود الشريم",
  matrood: "عبدالله المطرود",
  ajmi: "أحمد العجمي",
  rifai: "هاني الرفاعي",
  tablawi: "محمد الطبلاوي",
  juhany: "عبدالله الجهني",
};

export function ListenScreen({ chapters }: ListenScreenProps) {
  return (
    <AudioPlayerProvider>
      <ListenScreenInner chapters={chapters} />
      <AudioPlayer />
    </AudioPlayerProvider>
  );
}

function ListenScreenInner({ chapters }: ListenScreenProps) {
  const t = useTranslations("ls");
  const [reciter, setReciter] = useState<ReciterMeta>(RECITERS[0]);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const { current, isPlaying, toggle, playOne } = useAudioPlayer();

  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.nameSimple.toLowerCase().includes(q) ||
        String(c.id) === q ||
        c.nameArabic.includes(q),
    );
  }, [chapters, query]);

  // Popular surahs strip (handpicked).
  const popularStrip = chapters.filter((c) => [1, 36, 55, 67].includes(c.id));

  const handlePlay = async (c: ChapterSummary) => {
    setLoadingId(c.id);
    try {
      const res = await fetch(
        `/api/chapter-audio?reciter=${reciter.id}&chapter=${c.id}`,
      );
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "no_url");
      playOne({
        url: json.url,
        ayahKey: `${c.id}:0`,
        label: `${c.nameSimple} · ${reciter.name}${reciter.style ? ` (${reciter.style})` : ""}`,
      });
    } catch (err) {
      console.error(err);
      alert("Не удалось получить аудио. Попробуйте другого чтеца.");
    } finally {
      setLoadingId(null);
    }
  };

  const currentChapterId = current ? Number(current.ayahKey.split(":")[0]) : null;

  return (
    <>
      {/* HERO */}
      <section className="wrap listen-hero">
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>
          <span>{t("heading_1")}</span><br /><span>{t("heading_2")}</span>
        </h1>
        <p>{t("lede")}</p>
      </section>

      {/* FILTER */}
      <section className="wrap">
        <div className="filter-bar">
          <div className="filter-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              placeholder={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {[
            { id: "all", label: t("all") },
            { id: "hafs", label: "Хафс" },
            { id: "warsh", label: "Варш" },
            { id: "muratt", label: "Муратталь" },
            { id: "mujaw", label: "Муджаввад" },
          ].map((p) => (
            <button
              key={p.id}
              className={`filter-pill ${filter === p.id ? "active" : ""}`}
              onClick={() => setFilter(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* RECITER GRID */}
        <div className="reciter-grid">
          {RECITERS.map((r) => (
            <div
              key={r.slug}
              className={`reciter ${reciter.slug === r.slug ? "playing" : ""}`}
              onClick={() => setReciter(r)}
            >
              <div className="reciter-avatar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
                </svg>
              </div>
              <div className="reciter-info">
                <div className="reciter-name">{r.name}</div>
                {RECITER_AR[r.slug] && (
                  <div className="reciter-ar arabic" dir="rtl">{RECITER_AR[r.slug]}</div>
                )}
                <div className="reciter-meta">
                  {r.style ? <span>{r.style}</span> : null}
                  <span>114 сур</span>
                </div>
              </div>
              <button className="reciter-pp" aria-label="Play">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR SURAHS STRIP */}
      <section className="wrap surah-strip">
        <div className="strip-head">
          <div>
            <span className="eyebrow">{t("popular_eyebrow")}</span>
            <h2 style={{ marginTop: 10, fontWeight: 300 }}>{t("popular_h")}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            style={{ color: "oklch(var(--accent))", fontSize: 14, background: "none", border: 0, padding: 0, cursor: "pointer" }}
          >
            {showAll ? "Свернуть ↑" : t("all_114")}
          </button>
        </div>
        <div className="strip-row">
          {popularStrip.map((c) => (
            <button
              key={c.id}
              className="strip-card"
              onClick={() => (currentChapterId === c.id ? toggle() : handlePlay(c))}
              disabled={loadingId === c.id}
              type="button"
            >
              <div>
                <div className="n">{c.id} · {c.versesCount} аятов</div>
                <div className="t">{c.nameSimple}</div>
                <div className="meta">{c.revelationPlace === "makkah" ? "МЕККА" : "МЕДИНА"}</div>
              </div>
              <span className="play">
                {currentChapterId === c.id && isPlaying ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FULL CHAPTER LIST — collapsed by default; toggled by "Все 114 →" link above */}
      {showAll && (
      <section className="wrap surah-strip">
        <div className="strip-head">
          <div>
            <span className="eyebrow">Все суры</span>
            <h2 style={{ marginTop: 10, fontWeight: 300 }}>114 · {reciter.name}</h2>
          </div>
        </div>
        <div className="strip-row" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {filteredChapters.map((c) => {
            const isCurrent = currentChapterId === c.id;
            return (
              <button
                key={c.id}
                className="strip-card"
                onClick={() => (isCurrent ? toggle() : handlePlay(c))}
                disabled={loadingId === c.id}
                type="button"
              >
                <div>
                  <div className="n">{c.id} · {c.versesCount} аятов</div>
                  <div className="t">{c.nameSimple}</div>
                  <div className="meta arabic" dir="rtl">{c.nameArabic}</div>
                </div>
                <span className="play">
                  {isCurrent && isPlaying ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      )}
    </>
  );
}
