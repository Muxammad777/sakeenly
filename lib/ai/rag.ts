// RAG pipeline orchestrating refusal, retrieval, Claude completion, citation
// parsing, and a "no-source" fallback.
//
// Flow:
//   1. detect language
//   2. refusal check       → if fatwa-shape, return REFUSAL with referrals
//   3. retrieve sources    → top-K ayat from Quran.com /search (lexical)
//   4. if no sources       → return "no_sources" answer (model never reached)
//   5. ask Claude          → strict system prompt: cite-only-from-sources
//   6. parse citations     → return AskAnswer

import { TRANSLATIONS, type TranslationKey } from "@/lib/quran/constants";
import { askClaude, isClaudeConfigured } from "./claude";
import { parseCitations, type Citation } from "./citations";
import {
  detectLanguage,
  isFatwaShaped,
  refusalMessageFor,
  type Language,
} from "./refusal_policy";
import { retrieve, type RetrievedAyah } from "./retrieval";

export type AskOutcome = "answered" | "refused_fatwa" | "no_sources" | "model_unavailable";

export interface AskAnswer {
  outcome: AskOutcome;
  text: string;
  language: "ru" | "en";
  citations: Citation[];
  sourcesUsed: RetrievedAyah[];
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AskParams {
  question: string;
  /** Preferred RU/EN translation for both retrieval AND citations the user sees. */
  translation?: TranslationKey;
  /** Override auto-detection. */
  language?: Language;
}

const SYSTEM_PROMPT_RU = (sourceBlock: string) => `Ты — Sakeenly, помощник по Корану для русскоязычных мусульман.

ПРАВИЛА (строго):
1. Используй ТОЛЬКО предоставленные ниже источники. Если ответа в них нет — честно скажи "В предоставленных источниках нет ответа на этот вопрос; обратитесь к учёному" и не выдумывай.
2. КАЖДОЕ содержательное утверждение должно сопровождаться inline-цитатой формата [Quran S:A] (например [Quran 2:255]) или [Bukhari N].
3. НЕ цитируй текст аята или хадиса дословно — пересказывай суть своими словами. Ссылка [Quran S:A] и так даёт читателю возможность увидеть полный текст.
4. НЕ выноси правовых решений (фатв) — это работа учёных.
5. Отвечай на том же языке, что и вопрос (русский).
6. Тон — спокойный, тёплый, без украшательств. 2-5 коротких абзацев максимум.

ИСТОЧНИКИ (нумерация для удобства, ссылайся по verse_key):
${sourceBlock}`;

const SYSTEM_PROMPT_EN = (sourceBlock: string) => `You are Sakeenly, a Quran companion for Muslims.

RULES (strict):
1. Use ONLY the sources provided below. If the answer is not in them, say "The provided sources do not contain an answer to this question; please ask a scholar." Do not fabricate.
2. EVERY substantive claim must carry an inline citation of the form [Quran S:A] (e.g. [Quran 2:255]) or [Bukhari N].
3. Do NOT quote the verbatim text of any ayah or hadith — paraphrase. The citation lets the reader open the source.
4. Do NOT issue rulings (fatwa) — that is the work of qualified scholars.
5. Answer in the same language as the question (English).
6. Tone: calm, warm, no decoration. 2-5 short paragraphs max.

SOURCES (numbered for convenience; cite by verse_key):
${sourceBlock}`;

function buildSourceBlock(ayat: RetrievedAyah[], translationLabel: string): string {
  return ayat
    .map(
      (a, i) =>
        `[${i + 1}] verse_key="${a.verseKey}" translation="${translationLabel}":\n${a.translation}`,
    )
    .join("\n\n");
}

const NO_SOURCES_RU =
  "В предоставленных источниках Корана не нашёл подходящего ответа на ваш вопрос. Попробуйте переформулировать или обратитесь к учёному.";
const NO_SOURCES_EN =
  "I could not find a relevant verse in the provided sources for your question. Try rephrasing, or consult a scholar.";

const MODEL_UNAVAILABLE_RU =
  "AI-ответы временно недоступны: ключ ANTHROPIC_API_KEY не настроен на сервере.";
const MODEL_UNAVAILABLE_EN =
  "AI answers are temporarily unavailable: ANTHROPIC_API_KEY is not configured on the server.";

export async function ask(params: AskParams): Promise<AskAnswer> {
  const question = params.question.trim();
  const language: "ru" | "en" =
    params.language && params.language !== "auto" ? params.language : detectLanguage(question);

  // 1. Refusal
  if (isFatwaShaped(question, params.language ?? "auto")) {
    return {
      outcome: "refused_fatwa",
      text: refusalMessageFor(language),
      language,
      citations: [],
      sourcesUsed: [],
    };
  }

  // 2. Retrieval
  const translationKey: TranslationKey =
    params.translation ?? (language === "ru" ? "kuliev" : "sahih-intl");
  const { ayat } = await retrieve({
    query: question,
    language,
    preferredTranslation: translationKey,
    topK: 5,
  });

  if (ayat.length === 0) {
    return {
      outcome: "no_sources",
      text: language === "ru" ? NO_SOURCES_RU : NO_SOURCES_EN,
      language,
      citations: [],
      sourcesUsed: [],
    };
  }

  // 3. Model
  if (!isClaudeConfigured()) {
    return {
      outcome: "model_unavailable",
      text: language === "ru" ? MODEL_UNAVAILABLE_RU : MODEL_UNAVAILABLE_EN,
      language,
      citations: [],
      sourcesUsed: ayat,
    };
  }

  const translationLabel =
    TRANSLATIONS.find((t) => t.key === translationKey)?.author ?? "translation";
  const system = (language === "ru" ? SYSTEM_PROMPT_RU : SYSTEM_PROMPT_EN)(
    buildSourceBlock(ayat, translationLabel),
  );
  const result = await askClaude({ system, user: question });

  return {
    outcome: "answered",
    text: result.text,
    language,
    citations: parseCitations(result.text),
    sourcesUsed: ayat,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  };
}
