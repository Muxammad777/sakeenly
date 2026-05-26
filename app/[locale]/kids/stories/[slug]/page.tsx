import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  PROPHET_STORIES,
  findProphetStory,
  getStoryContent,
  nextProphetStory,
  prophetStorySlugs,
} from "@/lib/data/prophet-stories";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

// Build all 9 prophets × N locales static pages.
export function generateStaticParams() {
  const slugs = prophetStorySlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = findProphetStory(slug);
  if (!story) return { title: "Истории пророков" };
  const c = getStoryContent(story, locale);
  const title = `${c.name} ${story.suffix} — ${c.theme}`;
  const description = `${c.name} ${story.suffix}: ${c.theme}. ${c.lesson}`;
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

// Minimal per-locale UI labels for the story page. Kept inline (not in
// next-intl messages) because they're tightly coupled to this component.
const LABELS: Record<Locale, {
  crumbs: { home: string; kids: string; stories: string };
  h1Prefix: string;
  minWord: string;
  adab: string;
  lessonLbl: string;
  sourcesH: string;
  disclaimerLbl: string;
  disclaimerBody: string;
  nextLbl: string;
  nextNamePrefix: string;
  allLbl: string;
}> = {
  ru: {
    crumbs: { home: "Sakeenly", kids: "Детям", stories: "Истории" },
    h1Prefix: "Пророк",
    minWord: "мин",
    adab: "Без изображений людей · по Корану и сахих-хадисам",
    lessonLbl: "Урок",
    sourcesH: "Источники",
    disclaimerLbl: "Адаб.",
    disclaimerBody:
      "Эта история подготовлена по Корану, сахих-хадисам и классическим тафсирам. Мы не выдумываем диалогов и сцен и не описываем внешность пророков, мир им. Если вы заметили ошибку — напишите нам.",
    nextLbl: "Следующий пророк",
    nextNamePrefix: "Пророк",
    allLbl: "Все 9 пророков",
  },
  en: {
    crumbs: { home: "Sakeenly", kids: "Kids", stories: "Stories" },
    h1Prefix: "Prophet",
    minWord: "min",
    adab: "No images of people · sourced from Qur'an and authentic hadith",
    lessonLbl: "Lesson",
    sourcesH: "Sources",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "This story is drawn from the Qur'an, authentic hadith, and classical tafsir. We do not invent dialogue or scenes, and we do not describe the appearance of the Prophets, peace be upon them. If you notice an error, please write to us.",
    nextLbl: "Next prophet",
    nextNamePrefix: "Prophet",
    allLbl: "All 9 prophets",
  },
  fa: {
    crumbs: { home: "سکینلی", kids: "کودکان", stories: "داستان‌ها" },
    h1Prefix: "حضرت",
    minWord: "دقیقه",
    adab: "بدون تصویر انسان · بر اساس قرآن و حدیث صحیح",
    lessonLbl: "درس",
    sourcesH: "منابع",
    disclaimerLbl: "ادب.",
    disclaimerBody:
      "این داستان از قرآن، احادیث صحیح و تفاسیر کلاسیک گرفته شده است. ما گفتگو یا صحنه‌ای را از خود نمی‌سازیم و ظاهر پیامبران علیهم‌السلام را توصیف نمی‌کنیم. اگر اشتباهی دیدید، به ما بنویسید.",
    nextLbl: "پیامبر بعدی",
    nextNamePrefix: "حضرت",
    allLbl: "هر ۹ پیامبر",
  },
  tg: {
    crumbs: { home: "Sakeenly", kids: "Кӯдакон", stories: "Қиссаҳо" },
    h1Prefix: "Пайғамбар",
    minWord: "дақ",
    adab: "Бе тасвири одамон · аз рӯи Қуръон ва ҳадисҳои саҳеҳ",
    lessonLbl: "Дарс",
    sourcesH: "Сарчашмаҳо",
    disclaimerLbl: "Адаб.",
    disclaimerBody:
      "Ин қисса аз рӯи Қуръон, ҳадисҳои саҳеҳ ва тафсирҳои классикӣ омода шудааст. Мо муколама ва саҳнаҳоро аз худ намебарорем ва зоҳири пайғамбарон алайҳим-ус-салом-ро тавсиф намекунем. Агар хатое дидед, ба мо нависед.",
    nextLbl: "Пайғамбари баъдӣ",
    nextNamePrefix: "Пайғамбар",
    allLbl: "Ҳамаи 9 пайғамбар",
  },
  uz: {
    crumbs: { home: "Sakeenly", kids: "Bolalar", stories: "Qissalar" },
    h1Prefix: "Payg'ambar",
    minWord: "daq",
    adab: "Odamlar tasvirisiz · Qur'on va sahih hadislarga ko'ra",
    lessonLbl: "Saboq",
    sourcesH: "Manbalar",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "Bu qissa Qur'on, sahih hadislar va klassik tafsirlarga asosan tayyorlangan. Biz dialog yoki sahnalarni o'zimizdan to'qib chiqarmaymiz va payg'ambarlar alayhimus-salomning tashqi ko'rinishini tasvirlamaymiz. Agar xatolik sezsangiz, bizga yozing.",
    nextLbl: "Keyingi payg'ambar",
    nextNamePrefix: "Payg'ambar",
    allLbl: "Barcha 9 payg'ambar",
  },
  kk: {
    crumbs: { home: "Sakeenly", kids: "Балалар", stories: "Қиссалар" },
    h1Prefix: "Пайғамбар",
    minWord: "мин",
    adab: "Адам бейнесі жоқ · Құран мен сахих хадистерге сүйенген",
    lessonLbl: "Сабақ",
    sourcesH: "Дереккөздер",
    disclaimerLbl: "Әдеп.",
    disclaimerBody:
      "Бұл қисса Құран, сахих хадистер және классикалық тәпсірлер негізінде дайындалған. Біз диалог пен оқиғаларды өзімізден ойлап шығармаймыз және пайғамбарлардың, оларға салауат болсын, бет-әлпетін сипаттамаймыз. Қате байқасаңыз, бізге жазыңыз.",
    nextLbl: "Келесі пайғамбар",
    nextNamePrefix: "Пайғамбар",
    allLbl: "Барлық 9 пайғамбар",
  },
  ky: {
    crumbs: { home: "Sakeenly", kids: "Балдар", stories: "Аңгемелер" },
    h1Prefix: "Пайгамбар",
    minWord: "мүн",
    adab: "Адамдардын сүрөттөрү жок · Куран жана сахих хадистердин негизинде",
    lessonLbl: "Сабак",
    sourcesH: "Булактар",
    disclaimerLbl: "Адеп.",
    disclaimerBody:
      "Бул аңгеме Куран, сахих хадистер жана классикалык тафсирлердин негизинде даярдалган. Биз диалогдорду жана көрүнүштөрдү ойлоп таппайбыз жана пайгамбарлардын, аларга салам болсун, сырткы келбетин сүрөттөбөйбүз. Эгер ката байкасаңыз, бизге жазыңыз.",
    nextLbl: "Кийинки пайгамбар",
    nextNamePrefix: "Пайгамбар",
    allLbl: "Бардык 9 пайгамбар",
  },
};

export default async function ProphetStoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const story = findProphetStory(slug);
  if (!story) notFound();
  const c = getStoryContent(story, locale);
  const next = nextProphetStory(story.slug);
  const nextC = getStoryContent(next, locale);
  const L = LABELS[locale];

  return (
    <>
      {/* HERO */}
      <section className="wrap kst-hero">
        <div className="geo-stars-fade" aria-hidden></div>
        <div className="kst-crumbs">
          <Link href="/">{L.crumbs.home}</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids">{L.crumbs.kids}</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids/stories">{L.crumbs.stories}</Link>
          <span className="kst-sep">/</span>
          <span className="kst-here">{c.name} {story.suffix}</span>
        </div>
        <h1 className="kst-h1">{L.h1Prefix} {c.name}</h1>
        <div className="kst-arabic" dir="rtl" lang="ar">
          {story.nameAr} {story.suffix}
        </div>
        <div className="kst-meta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>{story.readingMin} {L.minWord} · {c.theme}</span>
        </div>
        <div className="kst-adab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>{L.adab}</span>
        </div>
      </section>

      {/* BODY */}
      <section className="wrap">
        <article className="kst-article">
          {c.paragraphs.map((p, i) => (
            <p key={i} className="kst-p">{p}</p>
          ))}

          {/* Lesson */}
          <div className="kst-lesson">
            <span className="kst-lesson-lbl">{L.lessonLbl}</span>
            <p>{c.lesson}</p>
          </div>

          {/* Sources */}
          <div className="kst-sources">
            <h3>{L.sourcesH}</h3>
            <ul>
              {c.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="kst-disclaimer">
            <strong>{L.disclaimerLbl}</strong> {L.disclaimerBody}
          </div>
        </article>
      </section>

      {/* NEXT PROPHET */}
      <section className="wrap kst-next-wrap">
        <Link href={`/kids/stories/${next.slug}`} className="kst-next">
          <div>
            <span className="kst-next-lbl">{L.nextLbl}</span>
            <span className="kst-next-name">{L.nextNamePrefix} {nextC.name} {next.suffix}</span>
            <span className="kst-next-theme">{next.readingMin} {L.minWord} · {nextC.theme}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </Link>

        <div className="kst-all">
          <h4>{L.allLbl}</h4>
          <div className="kst-all-grid">
            {PROPHET_STORIES.filter((s) => s.slug !== story.slug).map((s) => {
              const sc = getStoryContent(s, locale);
              return (
                <Link key={s.slug} href={`/kids/stories/${s.slug}`} className="kst-all-mini">
                  <span className="ru">{L.nextNamePrefix} {sc.name}</span>
                  <span className="ar" dir="rtl">{s.nameAr}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
