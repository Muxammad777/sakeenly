import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Admin — Sakeenly", template: "%s — Sakeenly Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin",               label: "Дашборд" },
  { href: "/admin/users",         label: "Пользователи" },
  { href: "/admin/subscriptions", label: "Подписки" },
  { href: "/admin/ask-history",   label: "AI-вопросы" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg text-fg">
        <aside className="w-60 shrink-0 border-r border-border bg-bg-deep">
          <div className="px-5 py-6">
            <Link href="/admin" className="font-display text-lg tracking-tight">
              Sakeenly <span className="text-accent">admin</span>
            </Link>
            <div className="mt-1 text-xs text-fg-dim font-mono">{admin.email}</div>
          </div>
          <nav className="flex flex-col px-3 pb-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 border-t border-border pt-4">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-xs text-fg-dim transition-colors hover:bg-surface hover:text-fg"
              >
                ← На сайт
              </Link>
            </div>
          </nav>
        </aside>
        <main className="flex-1 px-10 py-10">{children}</main>
      </div>
    </ThemeProvider>
  );
}
