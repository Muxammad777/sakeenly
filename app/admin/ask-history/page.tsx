import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "AI-вопросы" };

export default async function AdminAskHistoryPage() {
  const [total, refused, recent] = await Promise.all([
    db.askHistory.count(),
    db.askHistory.count({ where: { wasRefused: true } }),
    db.askHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const refusalRate = total > 0 ? Math.round((refused / total) * 100) : 0;

  return (
    <div>
      <header className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
          admin · ask-history
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-fg">AI-вопросы</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Лог Q&amp;A. Refusal rate: <span className="font-mono text-accent">{refusalRate}%</span>{" "}
          ({refused} из {total}).
        </p>
      </header>

      <div className="space-y-3">
        {recent.map((q) => (
          <article
            key={q.id}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-fg-dim">
              <span>{q.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              <span>· {q.user.email ?? "anon"}</span>
              <span>· {q.language}</span>
              {q.wasRefused && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">refused</span>
              )}
            </div>
            <div className="text-sm text-fg">
              <span className="text-fg-dim">Q:</span> {q.question}
            </div>
            <div className="mt-2 max-h-24 overflow-hidden text-xs text-fg-muted">
              <span className="text-fg-dim">A:</span> {q.answer.slice(0, 400)}
              {q.answer.length > 400 && "…"}
            </div>
          </article>
        ))}
        {recent.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-fg-dim">
            Истории пока нет. Когда пользователи начнут задавать вопросы — записи появятся здесь.
          </div>
        )}
      </div>
    </div>
  );
}
