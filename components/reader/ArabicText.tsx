import { cn } from "@/lib/utils";

interface ArabicTextProps {
  text: string;
  className?: string;
  /** "verse" = full ayah size; "phrase" = inline smaller */
  size?: "verse" | "phrase";
  /** Optional ayah number marker rendered as ۝ separator at end */
  ayahNumber?: number;
}

/**
 * Mushaf-style Arabic text renderer.
 *
 * Uses KFGQPC Hafs primary, then Amiri / system Arabic fallbacks. Right-to-left,
 * generous line-height to preserve tashkeel above/below letters.
 */
export function ArabicText({ text, className, size = "verse", ayahNumber }: ArabicTextProps) {
  return (
    <p
      dir="rtl"
      lang="ar"
      className={cn(
        "font-arabic text-fg",
        size === "verse" ? "text-3xl leading-[2.4] sm:text-4xl sm:leading-[2.4]" : "text-xl",
        className,
      )}
    >
      {text}
      {ayahNumber !== undefined ? (
        <span
          aria-hidden
          className="mx-1.5 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-accent/10 align-middle text-base text-accent"
        >
          {toArabicNumerals(ayahNumber)}
        </span>
      ) : null}
    </p>
  );
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumerals(n: number): string {
  return String(n)
    .split("")
    .map((c) => ARABIC_DIGITS[Number(c)] ?? c)
    .join("");
}
