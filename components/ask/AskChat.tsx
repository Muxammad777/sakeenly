"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { renderCitationsHtml, type Citation } from "@/lib/ai/citations";

type Outcome = "answered" | "refused_fatwa" | "no_sources" | "model_unavailable";

interface Source { verseKey: string; surah: number; ayah: number; translationKey: string; }

interface AskResponse {
  outcome: Outcome;
  text: string;
  language: "ru" | "en";
  citations: Citation[];
  sources: Source[];
  quota: { plan: string; used: number; limit: number; remaining: number };
}

interface Turn {
  id: string;
  question: string;
  answer?: AskResponse;
  error?: string;
  pending: boolean;
}

interface AskChatProps { isAuthenticated: boolean; }

export function AskChat({ isAuthenticated }: AskChatProps) {
  const t = useTranslations("ask");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const send = async (raw: string) => {
    const question = raw.trim();
    if (!question || pending) return;
    if (!isAuthenticated) {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent("/ask")}`;
      return;
    }
    const id = crypto.randomUUID();
    setTurns((prev) => [...prev, { id, question, pending: true }]);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = (await res.json()) as AskResponse | { error: string; message?: string };
      setTurns((prev) =>
        prev.map((tt) => {
          if (tt.id !== id) return tt;
          if ("error" in json) return { ...tt, pending: false, error: json.message ?? json.error };
          return { ...tt, pending: false, answer: json };
        }),
      );
    } catch (err) {
      setTurns((prev) => prev.map((tt) => (tt.id === id ? { ...tt, pending: false, error: String(err) } : tt)));
    } finally {
      setPending(false);
    }
  };

  const lastQuota = [...turns].reverse().find((tt) => tt.answer)?.answer?.quota;
  const isEmpty = turns.length === 0;
  const suggestions = [t("sugg1"), t("sugg2"), t("sugg3"), t("sugg4")];

  return (
    <>
      <section className="wrap ask-hero">
        <div className="geo-stars-fade" aria-hidden />
        <span className="tag">
          <span className="tag-dot" />
          <span>{t("badge")}</span>
        </span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
        <div className="ask-policy">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{t("policy")}</span>
        </div>
      </section>

      <div className="suggest">
        {suggestions.map((s) => (
          <button key={s} className="sugg" type="button" onClick={() => { setInput(s); send(s); }} disabled={pending}>
            {s}
          </button>
        ))}
      </div>

      <section className="wrap">
        <div className="chat-shell">
          <div className="chat-thread" ref={threadRef}>
            {isEmpty ? <DemoConversation /> : turns.map((tt) => <TurnView key={tt.id} turn={tt} />)}
          </div>

          <form
            className="composer"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
              placeholder={t("placeholder")}
              rows={1}
              disabled={pending}
            />
            <button className="send" type="submit" aria-label={t("aria_send")} disabled={pending || !input.trim()}>
              {pending ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.2-8.55" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12l14-7-7 14-2-5-5-2z" />
                </svg>
              )}
            </button>
          </form>

          <div className="quota">
            <span>
              {lastQuota && Number.isFinite(lastQuota.limit)
                ? `Free · ${lastQuota.used} / ${lastQuota.limit} ${lastQuota.remaining === 1 ? "вопрос" : "вопросов"} сегодня`
                : t("quota")}
            </span>
            <Link href="/pricing" className="up">{t("upgrade")}</Link>
          </div>
        </div>
      </section>
      <style jsx>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function DemoConversation() {
  const t = useTranslations("ask");
  const sources = [
    { key: "src1", surah: 2, ayah: 153 },
    { key: "src2", surah: 39, ayah: 10 },
    { key: "src3", surah: 70, ayah: 5 },
    { key: "src4", surah: 94, ayah: 5 },
  ] as const;

  return (
    <>
      <div className="msg user">
        <div className="avatar">{t("avatar_you")}</div>
        <div className="body">
          <div className="name">{t("label_q")}</div>
          <div className="text">{t("q1")}</div>
        </div>
      </div>

      <div className="msg ai">
        <div className="avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
          </svg>
        </div>
        <div className="body">
          <div className="name">{t("label_a")}</div>
          <div className="text">
            <span dangerouslySetInnerHTML={{ __html: t.raw("a1_html") as string }} />
            <div className="sources">
              <h4>{t("sources")}</h4>
              <ul>
                {sources.map((s) => (
                  <li key={s.key}>
                    <Link href={`/reader/${s.surah}/${s.ayah}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2" />
                      </svg>
                      <span>{t(s.key)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="msg user">
        <div className="avatar">{t("avatar_you")}</div>
        <div className="body">
          <div className="name">{t("label_q")}</div>
          <div className="text">{t("q2")}</div>
        </div>
      </div>

      <div className="msg ai">
        <div className="avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
          </svg>
        </div>
        <div className="body">
          <div className="name">{t("label_a")}</div>
          <div className="refusal">
            <h5>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{t("refusal_h")}</span>
            </h5>
            <p>{t("refusal_p")}</p>
            <div className="links">
              <a href="https://seekersguidance.org/answers/" target="_blank" rel="noopener noreferrer">SeekersGuidance →</a>
              <a href="https://yaqeeninstitute.org/" target="_blank" rel="noopener noreferrer">Yaqeen Institute →</a>
              <a href="https://www.amjaonline.org/" target="_blank" rel="noopener noreferrer">AMJA →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  const t = useTranslations("ask");
  return (
    <>
      <div className="msg user">
        <div className="avatar">{t("avatar_you")}</div>
        <div className="body">
          <div className="name">{t("label_q")}</div>
          <div className="text">{turn.question}</div>
        </div>
      </div>

      {turn.pending && (
        <div className="msg ai">
          <div className="avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
            </svg>
          </div>
          <div className="body">
            <div className="name">{t("label_a")}</div>
            <div className="text" style={{ opacity: 0.7 }}>Ищу в Коране…</div>
          </div>
        </div>
      )}

      {turn.error && (
        <div className="msg ai">
          <div className="avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
            </svg>
          </div>
          <div className="body">
            <div className="name">{t("label_a")}</div>
            <div className="text" style={{ color: "oklch(var(--text-3))" }}>Ошибка: {turn.error}</div>
          </div>
        </div>
      )}

      {turn.answer && <AnswerView answer={turn.answer} />}
    </>
  );
}

function AnswerView({ answer }: { answer: AskResponse }) {
  const t = useTranslations("ask");
  const isRefusal = answer.outcome === "refused_fatwa";
  const html = isRefusal
    ? linkifyUrls(answer.text)
    : renderCitationsHtml(answer.text, (c) =>
        c.type === "quran"
          ? `<a class="citation" href="/reader/${c.surah}/${c.ayah}">${c.ref}</a>`
          : `<span class="citation">${c.ref}</span>`,
      );

  return (
    <div className="msg ai">
      <div className="avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
        </svg>
      </div>
      <div className="body">
        <div className="name">{t("label_a")}</div>
        {isRefusal ? (
          <div className="refusal">
            <h5>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{t("refusal_h")}</span>
            </h5>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : (
          <div className="text">
            <span dangerouslySetInnerHTML={{ __html: html }} />
            {answer.sources.length > 0 && (
              <div className="sources">
                <h4>{t("sources")}</h4>
                <ul>
                  {answer.sources.map((s) => (
                    <li key={s.verseKey}>
                      <Link href={`/reader/${s.surah}/${s.ayah}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2" />
                        </svg>
                        <span>Quran {s.verseKey}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function linkifyUrls(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `<a class="link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
}
