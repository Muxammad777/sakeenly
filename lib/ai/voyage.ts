// Voyage AI embeddings — placeholder.
//
// We DO NOT use embeddings in the Task-4 MVP because we have no vector index
// over the Quranic / hadith corpus yet (that's Year 1+). The wrapper is kept
// minimal so the day we build the index we just plug it in at retrieval time.

import { VoyageAIClient } from "voyageai";

const DEFAULT_MODEL = process.env.VOYAGE_MODEL ?? "voyage-3";

let _client: VoyageAIClient | null = null;
function client(): VoyageAIClient {
  if (_client) return _client;
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");
  _client = new VoyageAIClient({ apiKey });
  return _client;
}

export function isVoyageConfigured() {
  return Boolean(process.env.VOYAGE_API_KEY);
}

export async function embed(texts: string[], model: string = DEFAULT_MODEL): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await client().embed({ input: texts, model });
  return (res.data ?? []).map((d) => d.embedding ?? []);
}
