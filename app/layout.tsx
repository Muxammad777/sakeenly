import type { Metadata, Viewport } from "next";
import { Spectral, Golos_Text, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import { isRtlLocale } from "@/lib/quran/format";

const spectral = Spectral({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sakeenly.com"),
  title: {
    default: "Sakeenly — Find your sakeena.",
    template: "%s — Sakeenly",
  },
  description: "Quran-companion. Без рекламы. Без трекеров.",
  applicationName: "Sakeenly",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7ee" },
    { media: "(prefers-color-scheme: dark)", color: "#11141a" },
  ],
};

/**
 * Root layout — defines <html> and <body>. We resolve the locale on the
 * SERVER via getLocale() (next-intl), so <html lang dir> is correct on
 * the very first paint — no LTR-then-RTL flicker on /ar / /fa / /ur.
 * The locale-aware shell (header / footer / providers) lives in
 * app/[locale]/layout.tsx.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // next-intl resolves the locale from middleware headers before this
  // server component runs. Fallbacks to the default locale on requests
  // outside the [locale] segment (e.g. /robots.txt, /sitemap.xml).
  const locale = await getLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${spectral.variable} ${golos.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg font-body text-fg antialiased">{children}</body>
    </html>
  );
}
