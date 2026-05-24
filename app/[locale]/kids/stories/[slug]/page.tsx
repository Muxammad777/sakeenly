import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  PROPHET_STORIES,
  findProphetStory,
  nextProphetStory,
  prophetStorySlugs,
} from "@/lib/data/prophet-stories";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

// Build all 9 prophets × 5 locales = 45 static pages.
export function generateStaticParams() {
  const slugs = prophetStorySlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = findProphetStory(slug);
  if (!story) return { title: "Истории пророков" };
  const title = `Пророк ${story.nameRu} ${story.suffix} — история для детей`;
  const description =
    `${story.nameRu} ${story.suffix}: ${story.theme}. Короткая история для родителя — ` +
    `прочесть ребёнку 4-10 лет. По Корану, сахих-хадисам и «Кисас аль-Анбия» Ибн Касира.`;
  return {
    title,
    description,
    alternates: { canonical: `/kids/stories/${story.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `https://sakeenly.com/kids/stories/${story.slug}`,
      siteName: "Sakeenly",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProphetStoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const story = findProphetStory(slug);
  if (!story) notFound();
  // TODO: when localized text becomes available, swap hard-coded RU labels
  // below for `t("kst.*")` lookups. For now the ru-only narrative ships under
  // every locale until the mufassir review pass is complete.
  const next = nextProphetStory(story.slug);

  return (
    <>
      {/* HERO */}
      <section className="wrap kst-hero">
        <div className="geo-stars-fade" aria-hidden></div>
        <div className="kst-crumbs">
          <Link href="/">Sakeenly</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids">Детям</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids/stories">Истории</Link>
          <span className="kst-sep">/</span>
          <span className="kst-here">{story.nameRu} {story.suffix}</span>
        </div>
        <h1 className="kst-h1">Пророк {story.nameRu}</h1>
        <div className="kst-arabic" dir="rtl" lang="ar">
          {story.nameAr} {story.suffix}
        </div>
        <div className="kst-meta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>{story.readingMin} мин · {story.theme}</span>
        </div>
        <div className="kst-adab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Без изображений людей · по Корану и сахих-хадисам</span>
        </div>
      </section>

      {/* BODY */}
      <section className="wrap">
        <article className="kst-article">
          {story.paragraphs.map((p, i) => (
            <p key={i} className="kst-p">{p}</p>
          ))}

          {/* Lesson */}
          <div className="kst-lesson">
            <span className="kst-lesson-lbl">Урок</span>
            <p>{story.lesson}</p>
          </div>

          {/* Sources */}
          <div className="kst-sources">
            <h3>Источники</h3>
            <ul>
              {story.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="kst-disclaimer">
            <strong>Адаб.</strong> Эта история подготовлена по Корану, сахих-хадисам и
            классическим тафсирам. Мы не выдумываем диалогов и сцен и не описываем
            внешность пророков, мир им. Если вы заметили ошибку — напишите нам.
          </div>
        </article>
      </section>

      {/* NEXT PROPHET */}
      <section className="wrap kst-next-wrap">
        <Link href={`/kids/stories/${next.slug}`} className="kst-next">
          <div>
            <span className="kst-next-lbl">Следующий пророк</span>
            <span className="kst-next-name">Пророк {next.nameRu} {next.suffix}</span>
            <span className="kst-next-theme">{next.readingMin} мин · {next.theme}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </Link>

        <div className="kst-all">
          <h4>Все 9 пророков</h4>
          <div className="kst-all-grid">
            {PROPHET_STORIES.filter((s) => s.slug !== story.slug).map((s) => (
              <Link key={s.slug} href={`/kids/stories/${s.slug}`} className="kst-all-mini">
                <span className="ru">Пророк {s.nameRu}</span>
                <span className="ar" dir="rtl">{s.nameAr}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
