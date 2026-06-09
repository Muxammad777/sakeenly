import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { Providers } from "@/app/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ViewTransitionsRoot } from "@/components/ViewTransitionsRoot";
import { LocaleDirSync } from "@/components/LocaleDirSync";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { isRtlLocale } from "@/lib/quran/format";
import "@/app/preview-styles/index.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "hero" });
  // hero.title_h + " " + hero.title_e gives "Find your sakeena." in EN.
  const title = `${t("title_h")} ${t("title_e")}`.replace(/\s+\./, ".");
  const sub = t("sub");
  return {
    title: { default: title, template: "%s — Sakeenly" },
    description: sub,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider>
      <Providers>
        {/* Push lang+dir onto <html> from the resolved locale. RootLayout
            ships ltr placeholders; this corrects them for fa/ar etc. */}
        <LocaleDirSync locale={locale} dir={dir} />
        <CursorSpotlight />
        <ScrollProgress />
        <ViewTransitionsRoot />
        <div className="flex min-h-screen flex-col" data-locale={locale} data-dir={dir}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
