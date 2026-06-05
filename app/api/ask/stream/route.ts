// POST /api/ask/stream
//
// Multi-turn Sakeenly agent. Body: { conversationId?, message, language? }.
// Streams Server-Sent Events:
//   event: text       — { delta }
//   event: tool_use   — { id, name, input }
//   event: tool_result — { id, name, output }
//   event: done       — { conversationId, messageId, citations, outcome,
//                         inputTokens, outputTokens, model }
//   event: error      — { message }
//
// Pipeline:
//   1. Auth + quota gate (free-tier 5 conversations/day, refusals free).
//   2. Refusal pre-flight on the new user message.
//   3. Load conversation history (up to 20 prior messages).
//   4. Agent loop:
//        - Stream Claude response (system + history + new user)
//        - Forward text deltas as SSE
//        - When Claude emits tool_use blocks, run each tool and
//          re-enter the loop with tool_result blocks.
//        - Stop when stop_reason === "end_turn".
//   5. After stream: persist user + assistant + tool messages, parse
//      citations, return done event.
//
// Anthropic SDK streaming details:
//   - We use messages.stream() (the SSE helper) to get fine-grained
//     events. Tool-use accumulates per block; we wait for block_stop
//     to grab the final input JSON.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { TRANSLATIONS, type TranslationKey } from "@/lib/quran/constants";
import {
  TOOLS,
  runSearchQuran,
  runGetAyah,
  runSearchHadith,
  type ToolName,
  type ToolExecCtx,
} from "@/lib/ai/tools";
import { parseCitations, type Citation } from "@/lib/ai/citations";
import {
  detectLanguage,
  isFatwaShaped,
  refusalMessageFor,
} from "@/lib/ai/refusal_policy";
import { getQuota, FREE_DAILY_LIMIT } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).max(2000),
  translation: z
    .enum(TRANSLATIONS.map((t) => t.key) as [TranslationKey, ...TranslationKey[]])
    .optional(),
  language: z.enum(["ru", "en", "auto"]).optional(),
});

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS ?? 1500);
const MAX_TOOL_ROUNDS = 4;
const MAX_HISTORY = 20;

function systemPrompt(language: "ru" | "en"): string {
  if (language === "ru") {
    return `Ты — Sakeenly, бережный помощник по Корану и хадисам для русскоязычных мусульман.

ПРАВИЛА (строго):
1. Используй ТОЛЬКО факты, полученные через инструменты search_quran, get_ayah, search_hadith. Никогда не выдумывай номера аятов или хадисов.
2. Перед содержательным ответом ВЫЗОВИ как минимум один инструмент. Если вопрос про Сунну/Пророка ﷺ/деяния — обязательно search_hadith. Если про Коран/смыслы/состояния — search_quran.
3. КАЖДОЕ содержательное утверждение должно сопровождаться inline-цитатой формата [Quran S:A] (например [Quran 2:255]) или [Bukhari N] / [Muslim N] (например [Bukhari 6502]).
4. НЕ цитируй дословно текст аята или хадиса — пересказывай суть своими словами. Ссылка [Quran 2:255] даёт читателю возможность открыть полный текст.
5. НЕ выноси правовых решений (фатв) — это работа учёных. Если вопрос требует фатвы — мягко перенаправь.
6. Если инструменты ничего не вернули — честно скажи: «В доступных источниках не нашёл ответа; обратитесь к учёному».
7. Тон — спокойный, тёплый, без украшательств. 2-5 коротких абзацев максимум.
8. Поддерживай многоходовый диалог: помни прошлые сообщения в этой беседе.`;
  }
  return `You are Sakeenly, a gentle Qur'an and hadith companion for Muslims.

RULES (strict):
1. Use ONLY facts obtained through the tools search_quran, get_ayah, search_hadith. Never invent ayah or hadith numbers.
2. Before any substantive answer CALL at least one tool. Sunnah/Prophet ﷺ questions → search_hadith. Qur'an/meaning/state questions → search_quran.
3. EVERY substantive claim must carry an inline citation of the form [Quran S:A] (e.g. [Quran 2:255]) or [Bukhari N] / [Muslim N] (e.g. [Bukhari 6502]).
4. Do NOT quote ayah or hadith text verbatim — paraphrase. The citation lets the reader open the source.
5. Do NOT issue fatwa — that is the work of qualified scholars. Gently redirect such questions.
6. If tools return nothing relevant, say: "I could not find the answer in available sources; please ask a scholar."
7. Tone: calm, warm, no decoration. 2-5 short paragraphs max.
8. Maintain multi-turn context: remember earlier messages in this conversation.`;
}

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("unauthenticated", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_body", issues: parsed.error.issues }), { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "model_unavailable", message: "ANTHROPIC_API_KEY not set on server" }), { status: 503 });
  }

  // Quota check up front (refusals don't charge).
  const quotaBefore = await getQuota(user.id);
  if (quotaBefore.remaining <= 0) {
    return new Response(
      JSON.stringify({
        error: "quota_exceeded",
        message: `Бесплатный лимит — ${FREE_DAILY_LIMIT} вопросов в сутки. Оформите Premium для безлимита.`,
        quota: quotaBefore,
      }),
      { status: 429 },
    );
  }

  const userMessage = parsed.data.message.trim();
  const language: "ru" | "en" =
    parsed.data.language && parsed.data.language !== "auto"
      ? parsed.data.language
      : detectLanguage(userMessage);
  const translation: TranslationKey =
    parsed.data.translation ?? (language === "ru" ? "kuliev" : "sahih-intl");
  const ctx: ToolExecCtx = { language, preferredTranslation: translation };

  // Refusal pre-flight on the *new* user message.
  if (isFatwaShaped(userMessage, parsed.data.language ?? "auto")) {
    const refusal = refusalMessageFor(language);
    // Persist as a complete turn under a fresh or existing conversation.
    const conversation = await ensureConversation(user.id, parsed.data.conversationId, userMessage, language);
    await db.message.create({
      data: { conversationId: conversation.id, role: "user", content: userMessage },
    });
    const refusalMsg = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: refusal,
        wasRefused: true,
        citations: [] as unknown as object,
      },
    });
    const stream = new ReadableStream({
      start(controller) {
        const enc = (e: string, d: unknown) => controller.enqueue(new TextEncoder().encode(sseEncode(e, d)));
        enc("text", { delta: refusal });
        enc("done", {
          conversationId: conversation.id,
          messageId: refusalMsg.id,
          citations: [],
          outcome: "refused_fatwa",
          inputTokens: 0,
          outputTokens: 0,
          model: null,
        });
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Persist user message immediately so a network drop preserves it.
  const conversation = await ensureConversation(user.id, parsed.data.conversationId, userMessage, language);
  await db.message.create({
    data: { conversationId: conversation.id, role: "user", content: userMessage },
  });

  // Load history (oldest → newest, cap MAX_HISTORY).
  const history = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY,
  });

  const client = new Anthropic({ apiKey });
  const sys = systemPrompt(language);

  // Build Anthropic messages array from our DB history.
  // Each user/assistant pair maps cleanly; tool messages get folded
  // into the assistant block they originated from.
  type AnthMsg = Anthropic.Messages.MessageParam;
  const messages: AnthMsg[] = historyToAnthropic(history);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(sseEncode(event, data)));

      let assistantText = "";
      const toolCallsPersisted: Array<{ id: string; name: string; input: unknown }> = [];
      let totalIn = 0;
      let totalOut = 0;
      let modelUsed = MODEL;
      let outcome: "answered" | "no_sources" | "model_unavailable" = "answered";

      try {
        // Agent loop: keep calling the model until it stops on its own.
        for (let round = 0; round < MAX_TOOL_ROUNDS + 1; round++) {
          let curText = "";
          const curToolUses: Array<{ id: string; name: string; input: unknown }> = [];
          let stopReason: string | null = null;

          const sdkStream = client.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            temperature: 0.2,
            system: sys,
            tools: TOOLS as unknown as Anthropic.Messages.Tool[],
            messages,
          });

          // Track current block to assemble tool inputs across deltas.
          let curBlockType: string | null = null;
          let curToolId: string | null = null;
          let curToolName: string | null = null;
          let curToolJson = "";

          for await (const ev of sdkStream) {
            if (ev.type === "content_block_start") {
              const cb = ev.content_block;
              curBlockType = cb.type;
              if (cb.type === "tool_use") {
                curToolId = cb.id;
                curToolName = cb.name;
                curToolJson = "";
              }
            } else if (ev.type === "content_block_delta") {
              const d = ev.delta;
              if (d.type === "text_delta") {
                curText += d.text;
                send("text", { delta: d.text });
              } else if (d.type === "input_json_delta") {
                curToolJson += d.partial_json;
              }
            } else if (ev.type === "content_block_stop") {
              if (curBlockType === "tool_use" && curToolId && curToolName) {
                let input: unknown = {};
                try { input = JSON.parse(curToolJson || "{}"); } catch { /* leave {} */ }
                const call = { id: curToolId, name: curToolName, input };
                curToolUses.push(call);
                send("tool_use", call);
                toolCallsPersisted.push(call);
              }
              curBlockType = null;
              curToolId = null;
              curToolName = null;
              curToolJson = "";
            } else if (ev.type === "message_stop") {
              // SDK exposes finalMessage / usage via the stream itself
              // after iteration finishes; capture below.
            }
          }
          const finalMsg = await sdkStream.finalMessage();
          stopReason = finalMsg.stop_reason ?? null;
          totalIn += finalMsg.usage?.input_tokens ?? 0;
          totalOut += finalMsg.usage?.output_tokens ?? 0;
          modelUsed = finalMsg.model ?? MODEL;
          assistantText += curText;

          // No tools called → we're done.
          if (curToolUses.length === 0 || stopReason !== "tool_use") {
            break;
          }
          if (round === MAX_TOOL_ROUNDS) {
            // Safety: stop after MAX_TOOL_ROUNDS even if model wants more tools.
            break;
          }

          // Push the assistant block (with its tool_use entries) to messages
          // so Claude sees its own previous turn.
          messages.push({
            role: "assistant",
            content: finalMsg.content as unknown as Anthropic.Messages.ContentBlockParam[],
          });

          // Run each tool and send tool_result blocks back.
          const toolResultBlocks: Anthropic.Messages.ToolResultBlockParam[] = [];
          for (const call of curToolUses) {
            const result = await runTool(call.name as ToolName, call.input, ctx);
            send("tool_result", { id: call.id, name: call.name, output: result });
            toolResultBlocks.push({
              type: "tool_result",
              tool_use_id: call.id,
              content: JSON.stringify(result),
            });
          }
          messages.push({ role: "user", content: toolResultBlocks });
        }

        // Citations.
        const citations: Citation[] = parseCitations(assistantText);

        // Track outcome: tools returned nothing and no citations → no_sources.
        if (citations.length === 0 && assistantText.includes("обратитесь к учёному")) {
          outcome = "no_sources";
        }

        // Persist assistant message + tool calls (one DB row per tool).
        const assistantMsg = await db.message.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: assistantText,
            toolCalls: toolCallsPersisted.length ? (toolCallsPersisted as unknown as object) : undefined,
            citations: (citations as unknown as object),
            inputTokens: totalIn,
            outputTokens: totalOut,
            model: modelUsed,
          },
        });

        send("done", {
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          citations,
          outcome,
          inputTokens: totalIn,
          outputTokens: totalOut,
          model: modelUsed,
        });
        controller.close();
      } catch (err) {
        console.error("[/api/ask/stream] pipeline error", err);
        send("error", { message: String(err instanceof Error ? err.message : err) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// ─── helpers ──────────────────────────────────────────────────────

async function ensureConversation(
  userId: string,
  id: string | undefined,
  firstUserMessage: string,
  language: string,
) {
  if (id) {
    const existing = await db.conversation.findUnique({ where: { id } });
    if (existing && existing.userId === userId) return existing;
  }
  // Title — first 60 chars of the user's opening question.
  const title = firstUserMessage.slice(0, 60).replace(/\s+/g, " ").trim() || "Новая беседа";
  return db.conversation.create({ data: { userId, title, language } });
}

function historyToAnthropic(
  history: Array<{
    role: "user" | "assistant" | "tool";
    content: string;
    toolName: string | null;
    toolInput: unknown;
    toolResult: unknown;
    toolCalls: unknown;
  }>,
): Anthropic.Messages.MessageParam[] {
  // We only feed user + assistant messages back. Tool messages were
  // ephemeral and have already been folded into the assistant's
  // content blocks; we don't replay them. (Claude doesn't need to
  // re-run tools for past turns — only the final text matters.)
  const out: Anthropic.Messages.MessageParam[] = [];
  for (const m of history) {
    if (m.role === "user") out.push({ role: "user", content: m.content });
    else if (m.role === "assistant") out.push({ role: "assistant", content: m.content });
  }
  return out;
}

async function runTool(name: ToolName, input: unknown, ctx: ToolExecCtx): Promise<unknown> {
  const inp = (input ?? {}) as Record<string, unknown>;
  switch (name) {
    case "search_quran":
      return runSearchQuran(ctx, {
        query: String(inp.query ?? ""),
        topK: typeof inp.topK === "number" ? inp.topK : undefined,
      });
    case "get_ayah":
      return runGetAyah(ctx, { verseKey: String(inp.verseKey ?? "") });
    case "search_hadith":
      return runSearchHadith(ctx, {
        query: String(inp.query ?? ""),
        topK: typeof inp.topK === "number" ? inp.topK : undefined,
        collections: Array.isArray(inp.collections)
          ? (inp.collections as Array<"bukhari" | "muslim">)
          : undefined,
      });
    default:
      return { error: "unknown_tool", name };
  }
}
