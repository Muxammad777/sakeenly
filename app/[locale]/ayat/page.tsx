import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AyatFilter } from "@/components/ayat/AyatFilter";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ay" });
  return {
    title: t("h1"),
    description: t("lede"),
    alternates: { canonical: "/ayat" },
  };
}

export default async function AyatIndex({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AyatContent />;
}

function AyatContent() {
  const t = useTranslations("ay");

  return (
    <>
      <section className="wrap ay-hero" data-hero-ar="آيات">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>
      <AyatFilter />
    </>
  );
}
