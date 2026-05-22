import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "tg", "uz", "kk", "ky"] as const,
  defaultLocale: "ru",
  // Hide /ru prefix; show /tg, /uz, /kk, /ky for the others.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
