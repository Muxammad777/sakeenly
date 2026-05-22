import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

const PROPHETS: { ar: string; svg: React.ReactNode }[] = [
  { ar: "آدم عليه السلام",   svg: <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"/> },
  { ar: "نوح عليه السلام",   svg: <><path d="M3 12c4-4 14-4 18 0v6H3z"/><path d="M7 18v3M17 18v3"/></> },
  { ar: "إبراهيم عليه السلام", svg: <path d="M12 2 L20 8 L20 16 L12 22 L4 16 L4 8 Z"/> },
  { ar: "يوسف عليه السلام",  svg: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></> },
  { ar: "موسى عليه السلام",  svg: <><path d="M3 12 L9 8 L9 16 Z"/><path d="M15 8 L21 12 L15 16 Z"/></> },
  { ar: "أيوب عليه السلام",  svg: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></> },
  { ar: "يونس عليه السلام",  svg: <><path d="M5 10 L19 10 L17 18 L7 18 Z"/><path d="M9 10 L11 4 M13 4 L15 10"/></> },
  { ar: "سليمان عليه السلام",svg: <path d="M6 10 L12 4 L18 10 L18 20 L6 20 Z"/> },
  { ar: "عيسى عليه السلام",  svg: <><circle cx="12" cy="9" r="5"/><path d="M5 22c0-5 3-8 7-8s7 3 7 8"/></> },
];

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
          {PROPHETS.map((p, i) => {
            const n = i + 1;
            return (
              <Link key={n} className="story" href="#">
                <div className="story-illust">
                  <div className="geo-stars-soft"></div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    {p.svg}
                  </svg>
                </div>
                <div className="story-name">{t(`p${n}.name` as `p1.name`)}</div>
                <div className="story-ar" dir="rtl">{p.ar}</div>
                <div className="story-meta">{t(`p${n}.meta` as `p1.meta`)}</div>
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
