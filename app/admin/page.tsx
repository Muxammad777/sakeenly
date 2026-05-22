import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Дашборд" };

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">{label}</div>
      <div className="mt-3 font-display text-4xl text-fg">{value}</div>
      {hint && <div className="mt-2 text-xs text-fg-muted">{hint}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [users, activeSubs, premiumSubs, asks, refusedAsks, bookmarks, today] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { isActive: true } }),
    db.subscription.count({ where: { isActive: true, plan: { in: ["premium", "family"] } } }),
    db.askHistory.count(),
    db.askHistory.count({ where: { wasRefused: true } }),
    db.bookmark.count(),
    db.askHistory.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const refusalRate = asks > 0 ? Math.round((refusedAsks / asks) * 100) : 0;

  return (
    <div className="max-w-5xl">
      <header className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
          Sakeenly · admin
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-fg">Состояние сервиса.</h1>
        <p className="mt-2 max-w-prose text-sm text-fg-muted">
          Витрина для метрик роста, подписок и качества AI-Q&amp;A. Цифры тянутся из Prisma на лету.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Пользователи" value={users} />
        <StatCard label="Активных подписок" value={activeSubs} hint={`Premium/Family: ${premiumSubs}`} />
        <StatCard label="Закладок" value={bookmarks} />
        <StatCard label="AI-вопросов всего" value={asks} />
        <StatCard label="За 24 часа" value={today} />
        <StatCard label="Refusal rate" value={`${refusalRate}%`} hint={`${refusedAsks} из ${asks}`} />
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl text-fg">Что дальше</h2>
        <ul className="mt-4 space-y-2 text-sm text-fg-muted">
          <li>· Раздел <span className="font-mono text-fg">/admin/users</span> — список пользователей с ролями</li>
          <li>· Раздел <span className="font-mono text-fg">/admin/subscriptions</span> — текущие подписки и Stripe</li>
          <li>· Раздел <span className="font-mono text-fg">/admin/ask-history</span> — лог Q&amp;A для проверки refusal-policy</li>
        </ul>
      </section>
    </div>
  );
}
