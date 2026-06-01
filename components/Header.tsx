import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";

export function Header() {
  const t = useTranslations("nav");

  const NAV = [
    { href: "/reader", key: "read" as const },
    { href: "/listen",     key: "listen" as const },
    { href: "/ask",        key: "ask" as const },
    { href: "/ayat",       key: "ayat" as const },
    { href: "/hifz",       key: "hifz" as const },
    { href: "/kids",       key: "kids" as const },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/70 backdrop-blur-md supports-[backdrop-filter]:bg-bg/78"
      style={{ backdropFilter: "blur(16px) saturate(140%)" }}
    >
      <div className="mx-auto flex h-[58px] max-w-[1240px] items-center gap-4 px-4 sm:gap-7 sm:px-7">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          <UserMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
