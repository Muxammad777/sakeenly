import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findEmotion, emotionSlugs, EMOTIONS } from "@/lib/data/emotions";
import { quranApi } from "@/lib/api/quran";
import { findTranslation, DEFAULT_TRANSLATION_BY_LOCALE, TRANSLATIONS } from "@/lib/quran/constants";
import { VerseAudio } from "@/components/ayat/VerseAudio";
import type { Locale } from "@/i18n/routing";
import ayatiMap        from "@/lib/quran/tanzil/ayati.json";
import sodikMap        from "@/lib/quran/tanzil/sodik.json";
import altayMap        from "@/lib/quran/tanzil/altay.json";
import mokhtasarKyMap  from "@/lib/quran/tanzil/mokhtasar-ky.json";
import krachkovskyMap  from "@/lib/quran/tanzil/krachkovsky.json";
import osmanovMap      from "@/lib/quran/tanzil/osmanov.json";
import porokhovaMap    from "@/lib/quran/tanzil/porokhova.json";
import fooladvandMap   from "@/lib/quran/tanzil/fooladvand.json";
import kulievRaw       from "@/lib/knowledge/translations/ru_elmirkuliev.json";
import sahihRaw        from "@/lib/knowledge/translations/en_sahih_international.json";

// Quran.com's translation API occasionally returns Kuliev with footnote
// <sup>n</sup> markup or otherwise looking truncated. Easier to ship the
// whole text from the local corpora we already bundle for /search and
// overlay it on top of the API-fetched arabic + audio.
type VerseEntry = { chapter: number; verse: number; text: string };
function buildMapFromVerseArray(data: { quran: VerseEntry[] }): Record<string, string> {
  const m: Record<string, string> = {};
  for (const v of data.quran) m[`${v.chapter}:${v.verse}`] = v.text;
  return m;
}
function buildMapFromQuranComApi(
  data: { data: { surahs: Array<{ number: number; ayahs: Array<{ numberInSurah: number; text: string }> }> } },
): Record<string, string> {
  const m: Record<string, string> = {};
  for (const sura of data.data.surahs) {
    for (const a of sura.ayahs) m[`${sura.number}:${a.numberInSurah}`] = a.text;
  }
  return m;
}
const kulievMap = buildMapFromVerseArray(kulievRaw as { quran: VerseEntry[] });
const sahihMap  = buildMapFromQuranComApi(sahihRaw as Parameters<typeof buildMapFromQuranComApi>[0]);

const TANZIL_MAPS: Record<string, Record<string, string>> = {
  kuliev:         kulievMap,
  "sahih-intl":   sahihMap,
  ayati:          ayatiMap        as Record<string, string>,
  sodik:          sodikMap        as Record<string, string>,
  altay:          altayMap        as Record<string, string>,
  "mokhtasar-ky": mokhtasarKyMap  as Record<string, string>,
  krachkovsky:    krachkovskyMap  as Record<string, string>,
  osmanov:        osmanovMap      as Record<string, string>,
  porokhova:      porokhovaMap    as Record<string, string>,
  fooladvand:     fooladvandMap   as Record<string, string>,
};

interface PageProps {
  params: Promise<{ locale: Locale; emotion: string }>;
}

// Generate all 30 emotion pages at build time.
export function generateStaticParams() {
  return emotionSlugs().map((emotion) => ({ emotion }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { emotion } = await params;
  const bundle = findEmotion(emotion);
  if (!bundle) return { title: "Ayat" };
  return {
    title: bundle.ruTitle,
    description: bundle.ruDescription,
    keywords: bundle.ruKeywords,
    alternates: { canonical: `/ayat/${bundle.slug}` },
    openGraph: {
      type: "article",
      title: bundle.ruTitle,
      description: bundle.ruDescription,
      url: `https://sakeenly.com/ayat/${bundle.slug}`,
      siteName: "Sakeenly",
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.ruTitle,
      description: bundle.ruDescription,
    },
  };
}

const AUDIO_CDN = "https://verses.quran.com/";
function toAbsoluteAudioUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return AUDIO_CDN + url.replace(/^\/+/, "");
}

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const BookmarkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
);

export default async function EmotionPage({ params }: PageProps) {
  const { locale, emotion } = await params;
  setRequestLocale(locale);
  const bundle = findEmotion(emotion);
  if (!bundle) notFound();
  const t = await getTranslations({ locale, namespace: "aem" });
  const tEmo = await getTranslations({ locale, namespace: "emo30" });
  // Localized title (fallback to ruTitle for any slug we forgot to translate)
  let title = bundle.ruTitle;
  try { title = tEmo(bundle.slug); } catch { /* fallback to ruTitle */ }

  // Pick a translation based on the URL locale (instead of always Kuliev).
  // For Quran.com-backed translations we fetch via the API; for tanzil-corpus
  // ones (Ayati/Sodik/Altay/Mokhtasar-ky/Krachkovsky/Osmanov/Porokhova) we
  // overlay the locally bundled JSON over the Arabic verse from quran.com.
  const localeTranslationKey = DEFAULT_TRANSLATION_BY_LOCALE[locale] ?? "kuliev";
  const localeMeta = TRANSLATIONS.find((tr) => tr.key === localeTranslationKey)!;
  const tanzilOverlay = TANZIL_MAPS[localeTranslationKey];
  // For the API call we still need a Quran.com-backed translation to fetch
  // arabic + audio for each verse. Use the locale's translation when it's
  // quran.com-sourced; otherwise fall back to Kuliev (we'll discard its text
  // and use the tanzil overlay below).
  const apiTranslation = localeMeta.source === "quran.com" ? localeMeta : findTranslation("kuliev");

  const enriched = await Promise.all(
    bundle.verses.map(async (pick) => {
      try {
        const verse = await quranApi.verseByKey(pick.key.split("-")[0], {
          translations: [apiTranslation],
          reciter: { id: 1, slug: "abdulbaset-mujawwad", name: "Abdul-Basit Abdul-Samad", style: "Mujawwad" },
          language: "en",
        });
        const [surahStr, ayahStr] = verse.verse_key.split(":");
        const overlayText = tanzilOverlay?.[verse.verse_key];
        const apiText = verse.translations.find((t) => t.resource_id === apiTranslation.id)?.text;
        return {
          verseKey: verse.verse_key,
          surah: Number(surahStr),
          ayah: Number(ayahStr),
          arabic: verse.text_uthmani,
          translationHtml: overlayText || apiText || "",
          audioUrl: verse.audio?.url ? toAbsoluteAudioUrl(verse.audio.url) : undefined,
          emphasis: pick.emphasis,
        };
      } catch (err) {
        console.error(`[ayat/${emotion}] failed to fetch ${pick.key}`, err);
        return null;
      }
    }),
  );
  const verses = enriched.filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <>
      {/* HERO */}
      <section className="wrap seo-hero">
        <div className="crumbs">
          <Link href="/">{t("crumbs_root")}</Link> &nbsp;/&nbsp;
          <Link href="/ayat">{t("crumbs_ayat")}</Link> &nbsp;/&nbsp;
          <span style={{ color: "var(--text-2)" }}>{title}</span>
        </div>
        <h1>{title}</h1>
        <p className="lede">{bundle.ruIntro}</p>
        <div className="meta-strip">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {t("meta_min_reading", { n: 6 })}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {bundle.needsReview ? t("meta_needs_review") : t("meta_reviewed")}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z"/></svg>
            {t("meta_audio")}
          </span>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="wrap">
        <div className="seo-layout">
          {/* TOC */}
          <aside className="toc">
            <h4>{t("toc_h")}</h4>
            <ol>
              <li><a href="#intro" className="active">{t("toc_intro")}</a></li>
              {verses.map((v, i) => (
                <li key={v.verseKey}>
                  <a href={`#a${i + 1}`}>{v.emphasis ?? `${t("ayah_n", { n: i + 1 })}`}</a>
                </li>
              ))}
              <li><a href="#scholar">{t("toc_scholar")}</a></li>
              <li><a href="#related">{t("toc_related")}</a></li>
            </ol>
          </aside>

          <article className="seo-article">
            <p className="intro" id="intro">{bundle.ruIntro}</p>
            <p>{t("body_intro")}</p>

            {verses.map((v, i) => {
              const n = i + 1;
              return (
                <div key={v.verseKey} className="ayah-card" id={`a${n}`}>
                  <div className="ayah-card-head">
                    <div>
                      <div className="ayah-tag">{t("ayah_n", { n })} · {v.verseKey}</div>
                      {v.emphasis && (
                        <div style={{ fontFamily: "'Spectral', serif", fontSize: "1.4rem", marginTop: 6 }}>
                          {v.emphasis}
                        </div>
                      )}
                    </div>
                    <div className="ayah-num-big">{String(n).padStart(2, "0")}</div>
                  </div>
                  <div className="arabic ayah-arabic" lang="ar" dir="rtl">
                    {v.arabic}
                  </div>
                  <div className="ayah-cite">{v.verseKey}</div>
                  <p
                    className="ayah-translation"
                    dangerouslySetInnerHTML={{
                      __html: v.translationHtml + ` <span class="by">${localeMeta.author}</span>`,
                    }}
                  />
                  <div className="ayah-actions">
                    {v.audioUrl ? (
                      <VerseAudio url={v.audioUrl} />
                    ) : (
                      <button className="btn btn-soft btn-sm" disabled>
                        <PlayIcon /> {t("action_listen")}
                      </button>
                    )}
                    <button className="btn btn-soft btn-sm">
                      <BookmarkIcon /> {t("action_bookmark")}
                    </button>
                    <Link className="btn btn-soft btn-sm" href={`/reader/${v.surah}/${v.ayah}`}>
                      {t("action_open")}
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Scholar block */}
            <div className="scholar-block geo-frame" id="scholar">
              {(["tl", "tr", "bl", "br"] as const).map((p) => (
                <span key={p} className={`corner ${p}`}>
                  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="0.9">
                    <path d="M2 18 Q2 2 18 2" />
                    <path d="M8 2 Q8 8 2 8" opacity="0.7" />
                    <circle cx="18" cy="18" r="3" />
                    <path d="M18 14 L19 17 L22 18 L19 19 L18 22 L17 19 L14 18 L17 17 Z" fill="currentColor" opacity="0.8" stroke="none" />
                  </svg>
                </span>
              ))}
              <div className="scholar-avatar">ع</div>
              <div>
                <h4>{t("scholar_name")}</h4>
                <div className="role">{t("scholar_role")}</div>
                <p>{t("scholar_quote")}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
              <strong>{t("disclaimer_lbl")}</strong> {t("disclaimer_body")}
            </div>

            {/* Related */}
            <div className="related" id="related">
              <h3>{t("related_h")}</h3>
              <div className="related-list">
                {EMOTIONS.filter((e) => e.slug !== bundle.slug).slice(0, 8).map((e) => {
                  let label = e.ruTitle;
                  try { label = tEmo(e.slug); } catch { /* fallback */ }
                  return <Link key={e.slug} href={`/ayat/${e.slug}`}>{label}</Link>;
                })}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* SEO CTA */}
      <section className="wrap">
        <div className="seo-cta">
          <span className="eyebrow">{t("cta_eyebrow")}</span>
          <h2>{t("cta_h")}</h2>
          <p>{t("cta_body")}</p>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/reader/1/1">
              {t("cta_btn_primary")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ALL EMOTIONS */}
      <section className="wrap all-emotions">
        <h2>{t("all_emotions_h")}</h2>
        <div className="emotion-grid-big">
          {EMOTIONS.filter((e) => e.slug !== bundle.slug).slice(0, 12).map((e) => {
            let label = e.ruTitle;
            try { label = tEmo(e.slug); } catch { /* fallback */ }
            return (
              <Link key={e.slug} className="em-mini" href={`/ayat/${e.slug}`}>
                <span className="ru">{label}</span>
                <span className="ct">{e.verses.length}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
