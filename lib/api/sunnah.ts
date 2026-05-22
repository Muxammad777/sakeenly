// Sunnah.com v1 client — optional (gated by SUNNAH_API_KEY).
//
// The public API requires an x-api-key header. There is no public full-text
// search endpoint; the v1 API exposes collections / books / chapters / hadiths.
// For Task 4 we surface a thin "is configured" check; full retrieval of
// specific hadith numbers is sufficient to render citations the LLM produces.

const BASE = process.env.SUNNAH_API_URL ?? "https://api.sunnah.com/v1";

export function isSunnahConfigured() {
  return Boolean(process.env.SUNNAH_API_KEY);
}

async function sunnahFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.SUNNAH_API_KEY;
  if (!apiKey) throw new Error("SUNNAH_API_KEY not set");
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!res.ok) throw new Error(`sunnah.com ${res.status} on ${path}`);
  return (await res.json()) as T;
}

export interface HadithRecord {
  collection: string;
  hadithNumber: string;
  arabic: string;
  english?: string;
  reference?: { book: number; hadith: number };
}

/**
 * Look up a single hadith by collection + number. Used when the LLM cites a
 * specific number we already trust (e.g. retrieved from a curated index).
 */
export async function getHadith(collection: string, number: string): Promise<HadithRecord | null> {
  if (!isSunnahConfigured()) return null;
  try {
    const data = await sunnahFetch<{
      arabic: string;
      hadithEnglish?: string;
      hadithNumber: string;
      reference?: { book: number; hadith: number };
    }>(`/collections/${collection}/hadiths/${number}`);
    return {
      collection,
      hadithNumber: data.hadithNumber,
      arabic: data.arabic,
      english: data.hadithEnglish,
      reference: data.reference,
    };
  } catch {
    return null;
  }
}
