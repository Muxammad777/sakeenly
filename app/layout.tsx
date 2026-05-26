import type { Metadata, Viewport } from "next";
import { Spectral, Golos_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/ThemeProvider";

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
 * Root layout — must define <html> and <body> for Next.js, but the actual
 * locale-aware shell (header / footer / providers) lives in
 * app/[locale]/layout.tsx.  This file only provides fonts + theme script.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The lang/dir attributes set here are placeholders for the very first
  // paint on the root segment (e.g. /robots.txt manifest requests). The
  // actual locale-aware shell in app/[locale]/layout.tsx updates them via
  // a small client effect so we honour the resolved locale (fa → rtl).
  return (
    <html
      lang="ru"
      dir="ltr"
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
