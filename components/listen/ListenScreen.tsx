"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from "@/components/reader/AudioPlayerProvider";
import { AudioPlayer } from "@/components/reader/AudioPlayer";
import { RECITERS, type ReciterMeta } from "@/lib/quran/constants";
import { toLocaleDigits } from "@/lib/quran/format";

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
  "abdulbaset-mujawwad": "عبد الباسط عبد الصمد",
  "abdulbaset-murattal": "عبد الباسط عبد الصمد",
  sudais:                "عبد الرحمن السديس",
  shatri:                "أبو بكر الشاطري",
  rifai:                 "هاني الرفاعي",
  husary:                "محمود خليل الحصري",
  "minshawi-mujawwad":   "محمد صديق المنشاوي",
  "minshawi-murattal":   "محمد صديق المنشاوي",
  shuraym:               "سعود الشريم",
  tablawi:               "محمد الطبلاوي",
  "husary-muallim":      "محمود خليل الحصري",
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
  const tRd = useTranslations("rd");
  const tSn = useTranslations("sn");
  const uiLocale = useLocale();
  const fmt = (n: number | string) => toLocaleDigits(n, uiLocale);
  const router = useRouter();
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

  // Reciter style filter. Hafs is the default qira'at — reciters without
  // an explicit style field are treated as Hafs. Warsh has no data yet so
  // the chip surfaces an empty state until reciters in that qira'at are
  // added (intentional honest UI rather than a dead chip).
  const filteredReciters = useMemo(() => {
    if (filter === "all") return RECITERS;
    if (filter === "hafs") return RECITERS.filter((r) => !r.style);
    if (filter === "warsh") return [];
    if (filter === "muratt") return RECITERS.filter((r) => r.style === "Murattal");
    if (filter === "mujaw") return RECITERS.filter((r) => r.style === "Mujawwad");
    return RECITERS;
  }, [filter]);

  // Popular surahs strip (handpicked).
  const popularStrip = chapters.filter((c) => [1, 36, 55, 67].includes(c.id));

  const handlePlay = async (c: ChapterSummary, withReciter?: ReciterMeta) => {
    const r = withReciter ?? reciter;
    setLoadingId(c.id);
    try {
      const res = await fetch(
        `/api/chapter-audio?reciter=${r.id}&chapter=${c.id}`,
      );
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "no_url");
      playOne({
        url: json.url,
        ayahKey: `${c.id}:0`,
        label: `${c.nameSimple} · ${r.name}${r.style ? ` (${r.style})` : ""}`,
      });
    } catch (err) {
      console.error(err);
      alert("Не удалось получить аудио. Попробуйте другого чтеца.");
    } finally {
      setLoadingId(null);
    }
  };

  // Card ▶ button — audition the reciter on Al-Fatihah (or whatever sura
  // is currently playing) so a single tap on the card actually plays.
  const handleReciterPreview = (r: ReciterMeta) => {
    setReciter(r);
    const playingChapterId = current ? Number(current.ayahKey.split(":")[0]) : null;
    const target = chapters.find((c) => c.id === (playingChapterId ?? 1)) ?? chapters[0];
    if (target) handlePlay(target, r);
  };

  const currentChapterId = current ? Number(current.ayahKey.split(":")[0]) : null;

  return (
    <>
      {/* HERO */}
      <section className="wrap listen-hero">
        <div className="geo-stars-fade" aria-hidden />
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
            { id: "hafs", label: t("qiraat_hafs") },
            { id: "warsh", label: t("qiraat_warsh") },
            { id: "muratt", label: t("style_muratt") },
            { id: "mujaw", label: t("style_mujaw") },
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
        {filteredReciters.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "oklch(var(--text-3))", fontFamily: "var(--font-mono), monospace", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {t("no_results")}
          </div>
        ) : null}
        <div className="reciter-grid">
          {filteredReciters.map((r) => (
            <div
              key={r.slug}
              className={`reciter ${reciter.slug === r.slug ? "playing" : ""}`}
              role="link"
              tabIndex={0}
              // Card tap → open reader with this reciter selected (Al-Fatihah).
              // The ▶ button beside it still does a quick in-page preview.
              onClick={() => router.push(`/reader/1/1?reciter=${r.slug}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/reader/1/1?reciter=${r.slug}`);
                }
              }}
              style={{ cursor: "pointer" }}
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
              <button
                type="button"
                className="reciter-pp"
                aria-label={`Прослушать ${r.name}`}
                onClick={(e) => { e.stopPropagation(); handleReciterPreview(r); }}
              >
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
            {showAll ? t("collapse") : t("all_114")}
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
                <div className="n">{fmt(c.id)} · {fmt(c.versesCount)} {tRd("ayat_count")}</div>
                <div className="t">{tSn(String(c.id))}</div>
                <div className="meta">{c.revelationPlace === "makkah" ? tRd("place_makkah").toUpperCase() : tRd("place_madinah").toUpperCase()}</div>
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
            <span className="eyebrow">{tRd("side_all_surahs")}</span>
            <h2 style={{ marginTop: 10, fontWeight: 300 }}>{fmt(114)} · {reciter.name}</h2>
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
                  <div className="n">{fmt(c.id)} · {fmt(c.versesCount)} {tRd("ayat_count")}</div>
                  <div className="t">{tSn(String(c.id))}</div>
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
