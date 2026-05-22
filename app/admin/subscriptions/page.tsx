import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Подписки" };

export default async function AdminSubscriptionsPage() {
  const [active, total, byPlan, recent] = await Promise.all([
    db.subscription.count({ where: { isActive: true } }),
    db.subscription.count(),
    db.subscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
      where: { isActive: true },
    }),
    db.subscription.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const planCounts = Object.fromEntries(byPlan.map((b) => [b.plan, b._count._all]));

  return (
    <div>
      <header className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
          admin · subscriptions
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-fg">Подписки</h1>
      </header>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">Активных</div>
          <div className="mt-2 font-display text-2xl text-fg">{active}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">Premium</div>
          <div className="mt-2 font-display text-2xl text-accent">{planCounts.premium ?? 0}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">Family</div>
          <div className="mt-2 font-display text-2xl text-accent">{planCounts.family ?? 0}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">Всего записей</div>
          <div className="mt-2 font-display text-2xl text-fg">{total}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left font-mono text-[11px] uppercase tracking-[0.1em] text-fg-dim">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">План</th>
              <th className="px-4 py-3">Активна</th>
              <th className="px-4 py-3">Истекает</th>
              <th className="px-4 py-3">Stripe customer</th>
              <th className="px-4 py-3">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s) => (
              <tr key={s.id} className="border-t border-border/60 hover:bg-surface/50">
                <td className="px-4 py-3 font-mono text-xs text-fg">{s.user.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-accent/12 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                    {s.plan}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {s.isActive ? <span className="text-accent">●</span> : <span className="text-fg-dim">○</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                  {s.expiresAt ? s.expiresAt.toISOString().slice(0, 10) : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fg-dim">{s.stripeCustomerId ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-fg-dim">
                  {s.updatedAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-fg-dim">
                  Подписок пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
