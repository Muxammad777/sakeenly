import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "en", "ar", "fa", "tg", "uz", "kk", "ky", "ur", "ms", "hi", "id"] as const,
  defaultLocale: "ru",
  // Hide /ru prefix; show /tg, /uz, /kk, /ky for the others.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
