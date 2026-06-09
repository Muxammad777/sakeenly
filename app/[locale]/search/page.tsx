import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SearchClient } from "@/components/search/SearchClient";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sr" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "sr" });

  return (
    <section className="wrap search-page">
      <div className="search-hero" data-hero-ar="بَحْث">
        <span className="tag"><span className="tag-dot" /><span>{t("eyebrow")}</span></span>
        <h1>{t("title")}</h1>
        <p>{t("lede")}</p>
      </div>
      <SearchClient initialQuery={q ?? ""} />
    </section>
  );
}
