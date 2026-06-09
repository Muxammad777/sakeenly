import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { quranApi } from "@/lib/api/quran";
import { toLocaleDigits } from "@/lib/quran/format";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rd" });
  return {
    title: t("surahs_h"),
    description: t("surahs_lede"),
    alternates: { canonical: "/reader" },
  };
}

export default async function ReaderIndex({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "rd" });
  const tSn = await getTranslations({ locale, namespace: "sn" });
  const chapters = await quranApi.chapters("en");

  return (
    <>
      <section className="wrap reader-hero" data-hero-ar="القُرآن">
        <div className="reader-index-head">
          <span className="tag"><span className="tag-dot" /><span>{t("surahs_eyebrow")}</span></span>
          <h1>{t("surahs_h")}</h1>
          <p>{t("surahs_lede")}</p>
        </div>
      </section>

      <section className="wrap reader-index">
        <ul className="surah-list surah-list-grid" aria-label={t("surahs_h")}>
        {chapters.map((c) => (
          <li key={c.id}>
            <Link className="surah-item surah-item-card" href={`/reader/${c.id}/1`}>
              <span className="surah-num">{toLocaleDigits(c.id, locale)}</span>
              <span className="surah-name">
                <b>{tSn(String(c.id))}</b>
                <span className="ar">{c.name_arabic}</span>
              </span>
              <span className="surah-meta">
                {toLocaleDigits(c.verses_count, locale)} {t("ayat_count")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </section>
    </>
  );
}
