import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PROPHET_STORIES, getStoryContent } from "@/lib/data/prophet-stories";

// Local-language prefix word for "Prophet" on the stories index card.
const PROPHET_PREFIX: Record<Locale, string> = {
  ru: "Пророк",
  en: "Prophet",
  ar: "النبي",
  fa: "حضرت",
  tg: "Пайғамбар",
  uz: "Payg'ambar",
  kk: "Пайғамбар",
  ky: "Пайгамбар",
  ur: "حضرت",
  ms: "Nabi",
  hi: "हज़रत",
  id: "Nabi",
};

const MIN_WORD: Record<Locale, string> = {
  ru: "МИН",
  en: "MIN",
  ar: "د",
  fa: "دقیقه",
  tg: "ДАҚ",
  uz: "DAQ",
  kk: "МИН",
  ky: "МҮН",
  ur: "منٹ",
  ms: "MIN",
  hi: "मिनट",
  id: "MIN",
};

interface PageProps { params: Promise<{ locale: Locale }>; }

// Per-slug decorative SVGs (no images of prophets — only abstract geometry).
const PROPHET_SVG: Record<string, React.ReactNode> = {
  // 9 original (kept as authored).
  adam:     <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"/>,
  nuh:      <><path d="M3 12c4-4 14-4 18 0v6H3z"/><path d="M7 18v3M17 18v3"/></>,
  ibrahim:  <path d="M12 2 L20 8 L20 16 L12 22 L4 16 L4 8 Z"/>,
  yusuf:    <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
  musa:     <><path d="M3 12 L9 8 L9 16 Z"/><path d="M15 8 L21 12 L15 16 Z"/></>,
  ayyub:    <><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
  yunus:    <><path d="M5 10 L19 10 L17 18 L7 18 Z"/><path d="M9 10 L11 4 M13 4 L15 10"/></>,
  sulayman: <path d="M6 10 L12 4 L18 10 L18 20 L6 20 Z"/>,
  isa:      <><circle cx="12" cy="9" r="5"/><path d="M5 22c0-5 3-8 7-8s7 3 7 8"/></>,
  // 16 added — abstract geometry only, never figurative.
  idris:    <><path d="M12 2 L12 22 M5 7 L19 7 M5 17 L19 17"/><circle cx="12" cy="12" r="2"/></>,
  hud:      <><path d="M3 14 Q12 4 21 14"/><path d="M3 18 Q12 10 21 18" strokeOpacity="0.5"/></>,
  salih:    <><path d="M4 18 L8 10 L12 14 L16 8 L20 18 Z"/><circle cx="12" cy="6" r="1.5"/></>,
  lut:      <><path d="M5 21 L12 4 L19 21 Z"/><path d="M8 16 L16 16" strokeOpacity="0.5"/></>,
  ismail:   <><circle cx="12" cy="12" r="8"/><path d="M12 4 L12 20 M4 12 L20 12"/></>,
  ishaq:    <><path d="M12 3 L21 12 L12 21 L3 12 Z"/><circle cx="12" cy="12" r="3"/></>,
  yaqub:    <><path d="M4 6 L12 12 L20 6"/><path d="M4 18 L12 12 L20 18"/></>,
  shuayb:   <><path d="M5 12 L19 12"/><path d="M9 6 L9 18 M15 6 L15 18"/><circle cx="12" cy="12" r="1.5"/></>,
  harun:    <><path d="M6 4 L6 20 M18 4 L18 20"/><path d="M6 12 L18 12" strokeOpacity="0.7"/></>,
  dhulkifl: <><path d="M4 20 L12 4 L20 20"/><path d="M8 14 L16 14" strokeOpacity="0.5"/></>,
  dawud:    <><path d="M12 2 L20 12 L12 22 L4 12 Z"/><path d="M12 6 L16 12 L12 18 L8 12 Z" strokeOpacity="0.5"/></>,
  ilyas:    <><path d="M4 6 L8 10 L4 14 L8 18"/><path d="M20 6 L16 10 L20 14 L16 18"/><path d="M8 12 L16 12" strokeOpacity="0.5"/></>,
  alyasa:   <><circle cx="12" cy="12" r="9" strokeOpacity="0.4"/><circle cx="12" cy="12" r="5"/></>,
  zakariya: <><path d="M12 4 L12 20"/><path d="M6 8 Q12 14 18 8" strokeOpacity="0.6"/><path d="M6 16 Q12 10 18 16" strokeOpacity="0.6"/></>,
  yahya:    <><circle cx="12" cy="8" r="3"/><path d="M9 11 L9 20 M15 11 L15 20" strokeOpacity="0.6"/></>,
  muhammad: <><path d="M12 2 L14 9 L21 10 L15.5 14.5 L17 21 L12 17.5 L7 21 L8.5 14.5 L3 10 L10 9 Z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kst" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/stories" } };
}

export default async function StoriesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("kst");
  const locale = useLocale() as Locale;
  const prefix = PROPHET_PREFIX[locale] ?? PROPHET_PREFIX.ru;
  const minWord = MIN_WORD[locale] ?? MIN_WORD.ru;
  return (
    <>
      <section className="wrap kid-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
        <div className="kid-adab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>{t("adab")}</span>
        </div>
      </section>

      <section className="wrap">
        <div className="stories">
          {PROPHET_STORIES.map((story) => {
            const c = getStoryContent(story, locale);
            const themeUpper = c.theme.toUpperCase();
            return (
              <Link key={story.slug} className="story" href={`/kids/stories/${story.slug}`}>
                <div className="story-illust">
                  <div className="geo-stars-soft"></div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    {PROPHET_SVG[story.slug]}
                  </svg>
                </div>
                <div className="story-name">{prefix} {c.name}</div>
                <div className="story-ar" dir="rtl">{`${story.nameAr} ${story.suffix}`}</div>
                <div className="story-meta">{`${story.readingMin} ${minWord} · ${themeUpper}`}</div>
                <span className="story-cta">{t("cta")}</span>
              </Link>
            );
          })}
        </div>
        <p style={{ marginTop: 30, color: "var(--text-3)", textAlign: "center", fontSize: 13 }}>
          {t("more")}
        </p>
      </section>
    </>
  );
}
