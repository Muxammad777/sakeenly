"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal target is only available after first client render.
  useEffect(() => { setMounted(true); }, []);

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

      {open && mounted && createPortal(
        <>
          {/* Dimmed backdrop — tap anywhere outside the sheet to close. */}
          <div
            className="sk-mobile-only fixed inset-0 z-[59]"
            style={{ background: "oklch(0 0 0 / 0.45)", animation: "sakeenlyMobileNavIn 180ms ease-out" }}
            onClick={() => setOpen(false)}
          />
          {/* Bottom sheet — anchored to bottom, auto-height, rounded top. */}
          <div
            role="dialog"
            aria-modal="true"
            className="sk-mobile-only fixed inset-x-0 bottom-0 z-[60] flex flex-col"
            style={{
              background: "oklch(var(--bg))",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTop: "1px solid oklch(var(--border))",
              boxShadow: "0 -10px 40px -10px oklch(0 0 0 / 0.5)",
              maxHeight: "85vh",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
              animation: "sakeenlyMobileNavSheetIn 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Drag handle — visual cue that the sheet is dismissible */}
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "oklch(var(--text-3) / 0.4)" }} />
            </div>

            <div className="flex items-center justify-between px-5 pb-2">
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

            <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-3" aria-label="Mobile primary">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl px-4 py-3 text-base font-medium transition-colors"
                    style={{
                      color: active ? "oklch(var(--accent))" : "oklch(var(--text))",
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

            <div className="border-t border-border/60 px-5 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <LocaleSwitcher />
                <ThemeSwitcher />
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "oklch(var(--text-3))", fontFamily: "'JetBrains Mono', monospace" }}
              >
                SAKEENLY · سكينة · 2026
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
