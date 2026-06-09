import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AlphabetGrid } from "@/components/kids/AlphabetGrid";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { KidBadgeWall } from "@/components/kids/KidBadgeWall";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ka" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/alphabet" } };
}

export default async function AlphabetPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <KidsProvider>
      <Content />
    </KidsProvider>
  );
}

function Content() {
  const t = useTranslations("ka");
  return (
    <>
      <section className="wrap kid-hero" data-hero-ar="الحُروف">
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

        <AlphabetGrid />
        <KidBadgeWall />
      </section>
    </>
  );
}
