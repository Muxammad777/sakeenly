import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

const SURAHS = [
  { n: 1,   ru: "Аль-Фатиха",  ar: "الفاتحة",  verses: 7, prog: 5 },
  { n: 114, ru: "Ан-Нас",      ar: "الناس",    verses: 6, prog: 3 },
  { n: 113, ru: "Аль-Фаляк",   ar: "الفلق",    verses: 5, prog: 2 },
  { n: 112, ru: "Аль-Ихляс",   ar: "الإخلاص",  verses: 4, prog: 4 },
  { n: 108, ru: "Аль-Каусар",  ar: "الكوثر",   verses: 3, prog: 3 },
  { n: 109, ru: "Аль-Кафирун", ar: "الكافرون", verses: 6, prog: 0 },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ks" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/surahs" } };
}

export default async function SurahsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("ks");
  return (
    <>
      <section className="wrap kid-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap">
        <div className="ks-grid">
          {SURAHS.map((s, i) => {
            const n = i + 1;
            return (
              <Link key={s.n} className="ks" href={`/hifz/learn/${s.n}/1`}>
                <div className="ks-head">
                  <div className="ks-num">{s.n}</div>
                  <div className="ks-title">
                    <div className="name">{s.ru}</div>
                    <div className="meta">{t(`s${n}.meta` as `s1.meta`)}</div>
                  </div>
                  <div className="ks-ar" dir="rtl">{s.ar}</div>
                </div>
                <div className="ks-note">{t(`s${n}.note` as `s1.note`)}</div>
                <div className="ks-progress">
                  {Array.from({ length: s.verses }).map((_, j) => (
                    <div key={j} className={`b ${j < s.prog ? "done" : ""}`}></div>
                  ))}
                </div>
                <div className="ks-foot">
                  <span className="label">{t(`s${n}.label` as `s1.label`)}</span>
                  <button className="ks-play">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
