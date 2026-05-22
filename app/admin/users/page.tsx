import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Пользователи" };

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const q = (sp.q ?? "").trim();

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name:  { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
        subscription: { select: { plan: true, isActive: true } },
        _count: { select: { bookmarks: true, askHistory: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
            admin · users
          </span>
          <h1 className="mt-2 font-display text-3xl font-light text-fg">
            Пользователи <span className="text-fg-dim">· {total}</span>
          </h1>
        </div>
        <form action="/admin/users" method="get" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Поиск по email или имени"
            className="h-9 w-72 rounded-full border border-border bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent"
          />
        </form>
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left font-mono text-[11px] uppercase tracking-[0.1em] text-fg-dim">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Язык</th>
              <th className="px-4 py-3">План</th>
              <th className="px-4 py-3 text-right">Закладки</th>
              <th className="px-4 py-3 text-right">Q&amp;A</th>
              <th className="px-4 py-3">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/60 hover:bg-surface/50">
                <td className="px-4 py-3 font-mono text-xs text-fg">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-fg-muted">{u.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      admin
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">user</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs uppercase text-fg-muted">{u.language}</td>
                <td className="px-4 py-3 text-fg-muted">
                  {u.subscription?.isActive ? (
                    <span className="rounded-full bg-accent/12 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                      {u.subscription.plan}
                    </span>
                  ) : (
                    <span className="text-fg-dim">free</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-fg-muted">{u._count.bookmarks}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-fg-muted">{u._count.askHistory}</td>
                <td className="px-4 py-3 font-mono text-xs text-fg-dim">
                  {u.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-fg-dim">
                  Никого не нашли{q ? ` по запросу «${q}»` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 font-mono text-xs">
          <span className="text-fg-dim">
            Страница {page} из {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
