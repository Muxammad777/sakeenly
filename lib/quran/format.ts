// Locale-aware digit formatting for verse/sura numbers.
//
// Arabic-script reading languages (ar, fa, ur, ps) prefer Eastern
// Arabic-Indic digits in narrative copy. We use the Persian set
// (۰-۹, U+06F0..U+06F9) for fa and the Arabic-Indic set (٠-٩,
// U+0660..U+0669) for ar — same shapes for 0-9 except 4, 5, 6.
//
// Everything else (ru, en, tg, uz, kk, ky) returns input unchanged.

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toLocaleDigits(input: number | string, locale: string): string {
  const str = String(input);
  if (locale === "fa") return mapDigits(str, PERSIAN_DIGITS);
  if (locale === "ar") return mapDigits(str, ARABIC_DIGITS);
  return str;
}

function mapDigits(str: string, table: readonly string[]): string {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 48; // '0' = 48
    out += code >= 0 && code <= 9 ? table[code] : str[i];
  }
  return out;
}

/** RTL UI locales. The Arabic ayah block always reads RTL regardless
 *  of UI direction (via dir="rtl" on the .arabic element). */
export const RTL_LOCALES = new Set(["fa", "ar", "ur", "ps", "he"]);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}
