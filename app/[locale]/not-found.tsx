import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("nf");
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-[600px] flex-col items-center justify-center overflow-hidden px-7 py-20 text-center">
      <div aria-hidden className="geo-stars-fade -z-10" />
      <div className="font-arabic text-[clamp(5rem,14vw,9rem)] leading-none text-accent" dir="rtl">١٠٤</div>
      <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">{t("code")}</div>
      <h1 className="mt-7 font-display text-[clamp(2rem,4vw,3rem)] font-light text-fg">{t("h1")}</h1>
      <p className="mx-auto mt-5 max-w-[40ch] font-display text-[1.2rem] italic leading-relaxed text-fg-muted">{t("lede")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-[18px] text-sm font-medium text-accent-fg transition-opacity hover:opacity-95">
          <ArrowLeft className="h-4 w-4" />
          {t("btn_home")}
        </Link>
        <Link href="/reader/1/1" className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-[18px] text-sm font-medium text-fg transition-colors hover:bg-surface">
          <BookOpen className="h-4 w-4" />
          {t("btn_open")}
        </Link>
      </div>
    </section>
  );
}
