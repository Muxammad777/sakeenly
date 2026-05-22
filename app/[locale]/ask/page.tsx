import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AskChat } from "@/components/ask/AskChat";
import { getCurrentUser } from "@/lib/auth-helpers";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ask" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/ask" } };
}

export default async function AskPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  return <AskChat isAuthenticated={!!user} />;
}
