import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { findEmotion, emotionSlugs, EMOTIONS } from "@/lib/data/emotions";
import { quranApi } from "@/lib/api/quran";
import { findTranslation } from "@/lib/quran/constants";
import { VerseAudio } from "@/components/ayat/VerseAudio";
import type { Locale } from "@/i18n/routing";

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

  const translation = findTranslation("kuliev");

  // Fetch every verse in the bundle in parallel via verse_key.
  const enriched = await Promise.all(
    bundle.verses.map(async (pick) => {
      try {
        const verse = await quranApi.verseByKey(pick.key.split("-")[0], {
          translations: [translation],
          reciter: { id: 7, slug: "mishary", name: "Mishari" },
          language: "en",
        });
        const [surahStr, ayahStr] = verse.verse_key.split(":");
        const tr = verse.translations.find((t) => t.resource_id === translation.id);
        return {
          verseKey: verse.verse_key,
          surah: Number(surahStr),
          ayah: Number(ayahStr),
          arabic: verse.text_uthmani,
          translationHtml: tr?.text ?? "",
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
          <Link href="/">Sakeenly</Link> &nbsp;/&nbsp;
          <Link href="/ayat">Аяты по темам</Link> &nbsp;/&nbsp;
          <span style={{ color: "var(--text-2)" }}>{bundle.ruTitle}</span>
        </div>
        <h1>{bundle.ruTitle}</h1>
        <p className="lede">{bundle.ruIntro}</p>
        <div className="meta-strip">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            6 мин чтения
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {bundle.needsReview ? "Ожидает утверждения" : "Проверено учёными"}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z"/></svg>
            Аудио каждого аята
          </span>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="wrap">
        <div className="seo-layout">
          {/* TOC */}
          <aside className="toc">
            <h4>В этой подборке</h4>
            <ol>
              <li><a href="#intro" className="active">О чём эта подборка</a></li>
              {verses.map((v, i) => (
                <li key={v.verseKey}>
                  <a href={`#a${i + 1}`}>{v.emphasis ?? `Аят ${v.verseKey}`}</a>
                </li>
              ))}
              <li><a href="#scholar">От учёного</a></li>
              <li><a href="#related">Похожие темы</a></li>
            </ol>
          </aside>

          <article className="seo-article">
            <p className="intro" id="intro">{bundle.ruIntro}</p>
            <p>
              Подборка собрана из аятов, на которые столетиями опираются учёные, имамы и обычные люди в моменты страха, тревоги, паники, бессонницы и отчаяния. Они не лечат тревогу как медицина — но дают ту точку опоры, без которой лечение бесполезно. Если тревога сильная и длительная — обязательно обратись к врачу. Коран не отменяет ас-сабаб (средство): Пророк ﷺ говорил «лечитесь».
            </p>

            {verses.map((v, i) => {
              const n = i + 1;
              return (
                <div key={v.verseKey} className="ayah-card" id={`a${n}`}>
                  <div className="ayah-card-head">
                    <div>
                      <div className="ayah-tag">Аят #{n} · {v.verseKey}</div>
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
                      __html: v.translationHtml + ` <span class="by">Перевод Э. Кулиева</span>`,
                    }}
                  />
                  <div className="ayah-actions">
                    {v.audioUrl ? (
                      <VerseAudio url={v.audioUrl} />
                    ) : (
                      <button className="btn btn-soft btn-sm" disabled>
                        <PlayIcon /> Слушать
                      </button>
                    )}
                    <button className="btn btn-soft btn-sm">
                      <BookmarkIcon /> Закладка
                    </button>
                    <Link className="btn btn-soft btn-sm" href={`/reader/${v.surah}/${v.ayah}`}>
                      Открыть в ридере →
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
                <h4>Шейх Абдулла Ал-Гариб</h4>
                <div className="role">SCHOLAR BOARD · SAKEENLY</div>
                <p>«Тревога — не доказательство слабости имана. Сам Пророк ﷺ просил у Аллаха защиты от тревоги и печали ежедневно: <em>аллахумма инни ауузу бика мин аль-хамми ва-ль-хазан</em>. Эта подборка — не замена ду’а и не замена врача. Это точки, на которые можно встать, когда падать страшнее, чем стоять.»</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
              <strong>Дисклеймер.</strong> Если ты испытываешь длительную тревогу, панические атаки или мысли причинить себе вред — обратись к врачу. Sakeenly не заменяет медицину. Если есть страх за жизнь — позвони в кризисную линию: 8-800-2000-122 (Россия, бесплатно, 24/7).
            </div>

            {/* Related */}
            <div className="related" id="related">
              <h3>Похожие подборки</h3>
              <div className="related-list">
                {EMOTIONS.filter((e) => e.slug !== bundle.slug).slice(0, 8).map((e) => (
                  <Link key={e.slug} href={`/ayat/${e.slug}`}>{e.ruTitle}</Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* SEO CTA */}
      <section className="wrap">
        <div className="seo-cta">
          <span className="eyebrow">Sakeenly · Quran-companion</span>
          <h2>Сохрани эти аяты в свою библиотеку.</h2>
          <p>Один тап — и закладки синхронизируются между всеми твоими устройствами. Аудио каждого аята. Тафсиры. Бесплатно.</p>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/reader/1/1">
              Открыть в Sakeenly
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
            <Link className="btn btn-ghost" href="/pricing">Что внутри</Link>
          </div>
        </div>
      </section>

      {/* ALL EMOTIONS */}
      <section className="wrap all-emotions">
        <h2>Другие подборки</h2>
        <div className="emotion-grid-big">
          {EMOTIONS.filter((e) => e.slug !== bundle.slug).slice(0, 12).map((e) => (
            <Link key={e.slug} className="em-mini" href={`/ayat/${e.slug}`}>
              <span className="ru">{e.ruTitle}</span>
              <span className="ct">{e.verses.length} АЯТОВ</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
