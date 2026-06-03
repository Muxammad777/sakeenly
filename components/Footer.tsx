import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";

export function Footer() {
  const t = useTranslations("foot");
  const tNav = useTranslations("nav");

  return (
    <footer className="mt-[120px] border-t border-border pt-14 pb-10 text-sm text-fg-dim">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-7 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo className="mb-3.5" />
          <p className="max-w-[36ch] leading-relaxed text-fg-muted">{t("tagline")}</p>
        </div>

        <div>
          <h4 className="mb-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim">
            {t("product")}
          </h4>
          <ul className="space-y-1">
            <li><Link href="/reader/1/1" className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("reader")}</Link></li>
            <li><Link href="/listen"    className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("reciters")}</Link></li>
            <li><Link href="/ask"       className="block py-1 text-fg-muted transition-colors hover:text-fg">{tNav("ask")}</Link></li>
            <li><Link href="/ayat"      className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("ayat")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim">
            {t("company")}
          </h4>
          <ul className="space-y-1">
            <li><Link href="/about"   className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("about")}</Link></li>
            <li><Link href="/scholars" className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("scholars")}</Link></li>
            <li><Link href="/privacy" className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("privacy")}</Link></li>
            <li><Link href="#"        className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("terms")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-fg-dim">
            {t("help")}
          </h4>
          <ul className="space-y-1">
            <li><Link href="#" className="block py-1 text-fg-muted transition-colors hover:text-fg">FAQ</Link></li>
            <li><Link href="#" className="block py-1 text-fg-muted transition-colors hover:text-fg">{t("report")}</Link></li>
            <li><Link href="#" className="block py-1 text-fg-muted transition-colors hover:text-fg">English</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1240px] flex-col gap-2 border-t border-border px-7 pt-6 font-mono text-xs text-fg-dim sm:flex-row sm:justify-between">
        <span>SAKEENLY · سكينة · {new Date().getFullYear()}</span>
        <span>{t("bottom_made")}</span>
      </div>
    </footer>
  );
}
