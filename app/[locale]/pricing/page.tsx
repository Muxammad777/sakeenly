import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PricingClient } from "./PricingClient";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pr" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/pricing" } };
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingClient />;
}
