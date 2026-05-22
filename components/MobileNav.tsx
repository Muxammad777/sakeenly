"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const NAV = [
  { href: "/reader/1/1", key: "read" as const, match: "/reader" },
  { href: "/listen",     key: "listen" as const, match: "/listen" },
  { href: "/ask",        key: "ask" as const, match: "/ask" },
  { href: "/ayat",       key: "ayat" as const, match: "/ayat" },
  { href: "/kids",       key: "kids" as const, match: "/kids" },
  { href: "/pricing",    key: "pricing" as const, match: "/pricing" },
];

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="sk-mobile-only grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:text-fg"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className="sk-mobile-only fixed inset-0 z-[60] flex flex-col"
          style={{
            background: "color-mix(in oklab, var(--bg) 96%, transparent)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            animation: "sakeenlyMobileNavIn 200ms ease-out",
          }}
        >
          <div className="flex h-[58px] items-center justify-between px-5 border-b border-border/60">
            <Logo />
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-6" aria-label="Mobile primary">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-base font-medium transition-colors"
                  style={{
                    color: active ? "var(--accent)" : "var(--text)",
                    background: active ? "var(--accent-soft)" : "transparent",
                    fontFamily: "'Spectral', serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/60 px-6 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <LocaleSwitcher />
              <ThemeSwitcher />
            </div>
            <div
              className="text-xs uppercase tracking-[0.18em]"
              style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              SAKEENLY · سكينة · 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
