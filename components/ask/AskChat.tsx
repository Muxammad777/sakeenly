"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { renderCitationsHtml, type Citation } from "@/lib/ai/citations";

type Outcome = "answered" | "refused_fatwa" | "no_sources" | "model_unavailable";

interface ToolCall {
  id: string;
  name: string;
  input: unknown;
  output?: unknown;
}

interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Tool calls displayed inline above this assistant turn. */
  tools?: ToolCall[];
  citations?: Citation[];
  outcome?: Outcome;
  pending?: boolean;
  error?: string;
}

interface AskChatProps { isAuthenticated: boolean; }

// Server-Sent Events parser — minimal but correct for the events our
// stream endpoint emits. Splits on blank lines, decodes JSON data.
async function* sseLines(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const raw = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) yield { event, data };
    }
  }
}

export function AskChat({ isAuthenticated }: AskChatProps) {
  const t = useTranslations("ask");
  const locale = useLocale();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  // Restore conversationId from URL hash so refresh keeps the same thread.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = /^#c=([\w-]+)$/.exec(window.location.hash);
    if (m) {
      setConversationId(m[1]);
      void loadConversation(m[1], setTurns);
    }
  }, []);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || pending) return;
    if (!isAuthenticated) {
      window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(`/${locale}/ask`)}`;
      return;
    }
    const userId = crypto.randomUUID();
    const aiId = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      { id: userId, role: "user", text: message },
      { id: aiId, role: "assistant", text: "", pending: true, tools: [] },
    ]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message, language: locale === "ru" ? "ru" : "en" }),
      });
      if (!res.ok || !res.body) {
        const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setTurns((prev) => prev.map((tt) => tt.id === aiId ? { ...tt, pending: false, error: json.message ?? json.error ?? `HTTP ${res.status}` } : tt));
        return;
      }
      for await (const { event, data } of sseLines(res.body)) {
        const payload = JSON.parse(data) as Record<string, unknown>;
        if (event === "text") {
          setTurns((prev) => prev.map((tt) => tt.id === aiId ? { ...tt, text: tt.text + (payload.delta as string) } : tt));
        } else if (event === "tool_use") {
          const call: ToolCall = { id: String(payload.id), name: String(payload.name), input: payload.input };
          setTurns((prev) => prev.map((tt) => tt.id === aiId ? { ...tt, tools: [...(tt.tools ?? []), call] } : tt));
        } else if (event === "tool_result") {
          const id = String(payload.id);
          setTurns((prev) => prev.map((tt) => {
            if (tt.id !== aiId) return tt;
            const tools = (tt.tools ?? []).map((c) => c.id === id ? { ...c, output: payload.output } : c);
            return { ...tt, tools };
          }));
        } else if (event === "done") {
          const cid = payload.conversationId as string | undefined;
          if (cid && !conversationId) {
            setConversationId(cid);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `#c=${cid}`);
            }
          }
          setTurns((prev) => prev.map((tt) => tt.id === aiId ? {
            ...tt,
            pending: false,
            citations: (payload.citations as Citation[]) ?? [],
            outcome: payload.outcome as Outcome,
          } : tt));
        } else if (event === "error") {
          setTurns((prev) => prev.map((tt) => tt.id === aiId ? { ...tt, pending: false, error: String(payload.message ?? "stream error") } : tt));
        }
      }
    } catch (err) {
      setTurns((prev) => prev.map((tt) => tt.id === aiId ? { ...tt, pending: false, error: String(err) } : tt));
    } finally {
      setPending(false);
    }
  };

  const newConversation = () => {
    setConversationId(null);
    setTurns([]);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#");
    }
  };

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
          <button key={s} className="sugg" type="button" onClick={() => { setInput(s); void send(s); }} disabled={pending}>
            {s}
          </button>
        ))}
        {conversationId && (
          <button className="sugg" type="button" onClick={newConversation} disabled={pending}>
            + {t("new_chat")}
          </button>
        )}
      </div>

      <section className="wrap">
        <div className="chat-shell">
          <div className="chat-thread" ref={threadRef}>
            {isEmpty ? <DemoConversation /> : turns.map((tt) => <TurnView key={tt.id} turn={tt} />)}
          </div>

          <form
            className="composer"
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
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
        </div>
      </section>
      <style jsx>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

async function loadConversation(id: string, setTurns: (t: Turn[]) => void) {
  try {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const json = (await res.json()) as {
      conversation: { messages: Array<{ id: string; role: "user" | "assistant" | "tool"; content: string; citations: Citation[] | null; toolCalls: ToolCall[] | null; wasRefused: boolean }> };
    };
    const turns: Turn[] = [];
    for (const m of json.conversation.messages) {
      if (m.role === "tool") continue;
      turns.push({
        id: m.id,
        role: m.role,
        text: m.content,
        tools: m.toolCalls ?? undefined,
        citations: m.citations ?? undefined,
        outcome: m.wasRefused ? "refused_fatwa" : "answered",
      });
    }
    setTurns(turns);
  } catch (err) {
    console.error("[ask] failed to load conversation", err);
  }
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
        <div className="avatar"><AgentIcon /></div>
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
    </>
  );
}

function AgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
    </svg>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  const t = useTranslations("ask");

  if (turn.role === "user") {
    return (
      <div className="msg user">
        <div className="avatar">{t("avatar_you")}</div>
        <div className="body">
          <div className="name">{t("label_q")}</div>
          <div className="text">{turn.text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="msg ai">
      <div className="avatar"><AgentIcon /></div>
      <div className="body">
        <div className="name">{t("label_a")}</div>

        {turn.tools && turn.tools.length > 0 && (
          <div className="tool-pills">
            {turn.tools.map((c) => <ToolPill key={c.id} call={c} />)}
          </div>
        )}

        {turn.pending && !turn.text && (
          <div className="text" style={{ opacity: 0.7 }}>{t("searching")}</div>
        )}

        {turn.text && <AnswerBody turn={turn} />}

        {turn.error && (
          <div className="text" style={{ color: "oklch(var(--text-3))" }}>
            {t("error_prefix")}: {turn.error}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolPill({ call }: { call: ToolCall }) {
  const t = useTranslations("ask");
  const [open, setOpen] = useState(false);
  const label = (() => {
    const q = (call.input as { query?: string })?.query;
    const v = (call.input as { verseKey?: string })?.verseKey;
    if (call.name === "search_quran") return t("tool_search_quran", { q: q ?? "" });
    if (call.name === "get_ayah") return t("tool_get_ayah", { v: v ?? "" });
    if (call.name === "search_hadith") return t("tool_search_hadith", { q: q ?? "" });
    return call.name;
  })();
  return (
    <div className={"tool-pill" + (call.output ? " done" : " busy")}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="tool-pill-head">
        <span className="tool-pill-icon">{call.output ? "✓" : "…"}</span>
        <span>{label}</span>
      </button>
      {open && call.output != null && (
        <pre className="tool-pill-body">{JSON.stringify(call.output, null, 2).slice(0, 1200)}</pre>
      )}
    </div>
  );
}

function AnswerBody({ turn }: { turn: Turn }) {
  const isRefusal = turn.outcome === "refused_fatwa";
  const html = isRefusal
    ? linkifyUrls(turn.text)
    : renderCitationsHtml(turn.text, (c) =>
        c.type === "quran"
          ? `<a class="citation" href="/reader/${c.surah}/${c.ayah}">${c.ref}</a>`
          : `<a class="citation" href="https://sunnah.com/${c.collection.toLowerCase()}/${c.number}" target="_blank" rel="noopener noreferrer">${c.ref}</a>`,
      );

  if (isRefusal) {
    return (
      <div className="refusal">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }
  return (
    <div className="text">
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {turn.pending && <span className="caret">▍</span>}
    </div>
  );
}

function linkifyUrls(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `<a class="link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
}
