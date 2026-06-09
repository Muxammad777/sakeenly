import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { SurahsIndex } from "@/components/kids/SurahsIndex";

interface PageProps { params: Promise<{ locale: Locale }>; }

const SURAHS = [
  { n: 1,   ru: "Аль-Фатиха",  ar: "الفاتحة",  verses: 7 },
  { n: 114, ru: "Ан-Нас",      ar: "الناس",    verses: 6 },
  { n: 113, ru: "Аль-Фаляк",   ar: "الفلق",    verses: 5 },
  { n: 112, ru: "Аль-Ихляс",   ar: "الإخلاص",  verses: 4 },
  { n: 108, ru: "Аль-Каусар",  ar: "الكوثر",   verses: 3 },
  { n: 109, ru: "Аль-Кафирун", ar: "الكافرون", verses: 6 },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ks" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/surahs" } };
}

export default async function SurahsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <KidsProvider>
      <Content />
    </KidsProvider>
  );
}

function Content() {
  const t = useTranslations("ks");
  const surahs = SURAHS.map((s, i) => {
    const n = i + 1;
    return {
      ...s,
      meta: t(`s${n}.meta` as `s1.meta`),
      note: t(`s${n}.note` as `s1.note`),
      label: t(`s${n}.label` as `s1.label`),
    };
  });
  return (
    <>
      <section className="wrap kid-hero" data-hero-ar="السُّوَر">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap">
        <SurahsIndex surahs={surahs} />
      </section>
    </>
  );
}
