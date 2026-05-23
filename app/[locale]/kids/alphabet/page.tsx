import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AlphabetGrid } from "@/components/kids/AlphabetGrid";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

const LETTERS = [
  { glyph: "ا", tr: "a" }, { glyph: "ب", tr: "b" }, { glyph: "ت", tr: "t" }, { glyph: "ث", tr: "ṯ" },
  { glyph: "ج", tr: "j" }, { glyph: "ح", tr: "ḥ" }, { glyph: "خ", tr: "ḫ" }, { glyph: "د", tr: "d" },
  { glyph: "ذ", tr: "ḏ" }, { glyph: "ر", tr: "r" }, { glyph: "ز", tr: "z" }, { glyph: "س", tr: "s" },
  { glyph: "ش", tr: "š" }, { glyph: "ص", tr: "ṣ" }, { glyph: "ض", tr: "ḍ" }, { glyph: "ط", tr: "ṭ" },
  { glyph: "ظ", tr: "ẓ" }, { glyph: "ع", tr: "ʿ" }, { glyph: "غ", tr: "ġ" }, { glyph: "ف", tr: "f" },
  { glyph: "ق", tr: "q" }, { glyph: "ك", tr: "k" }, { glyph: "ل", tr: "l" }, { glyph: "م", tr: "m" },
  { glyph: "ن", tr: "n" }, { glyph: "ه", tr: "h" }, { glyph: "و", tr: "w" }, { glyph: "ي", tr: "y" },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ka" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/alphabet" } };
}

export default async function AlphabetPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("ka");
  return (
    <>
      <section className="wrap kid-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap">
        <div className="legend">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>
          <div><strong>{t("tip_lab")}</strong> <span>{t("tip")}</span></div>
        </div>

        <AlphabetGrid letters={LETTERS} />
      </section>
    </>
  );
}
