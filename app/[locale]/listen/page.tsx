import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { quranApi } from "@/lib/api/quran";
import { ListenScreen } from "@/components/listen/ListenScreen";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("listen"), description: "Все 114 сур × 12 чтецов через Quran.com CDN.", alternates: { canonical: "/listen" } };
}

export default async function ListenPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const chapters = await quranApi.chapters("en");
  return (
    <ListenScreen
      chapters={chapters.map(c => ({
        id: c.id,
        nameSimple: c.name_simple,
        nameArabic: c.name_arabic,
        versesCount: c.verses_count,
        revelationPlace: c.revelation_place,
      }))}
    />
  );
}
