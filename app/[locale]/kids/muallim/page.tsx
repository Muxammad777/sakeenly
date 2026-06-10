import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { MuallimHub } from "@/components/kids/MuallimHub";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "muallim" });
  return { title: t("hub_h1"), description: t("hub_lede") };
}

export default async function MuallimHubPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MuallimHubContent />;
}

function MuallimHubContent() {
  const t = useTranslations("muallim");

  return (
    <>
      <section className="wrap kid-hero" data-hero-ar="مُعَلِّم">
        <div className="geo-stars-fade" aria-hidden />
        <span className="tag"><span className="tag-dot"></span><span>{t("hub_eyebrow")}</span></span>
        <h1>{t("hub_h1")}</h1>
        <p>{t("hub_lede")}</p>
        <div style={{ marginTop: 18, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn-ghost btn-sm" href="/kids">← {t("lesson_back")}</Link>
        </div>
      </section>

      <section className="wrap">
        <KidsProvider>
          <MuallimHub />
        </KidsProvider>
      </section>
    </>
  );
}
