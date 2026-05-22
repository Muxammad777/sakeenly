import { describe, it, expect } from "vitest";
import { parseCitations, hasAnyCitation, renderCitationsHtml } from "@/lib/ai/citations";

describe("citation parser", () => {
  it("parses a single Quran citation", () => {
    const cits = parseCitations("Поминание Аллаха [Quran 13:28] успокаивает сердце.");
    expect(cits).toHaveLength(1);
    expect(cits[0]).toEqual({ type: "quran", ref: "13:28", surah: 13, ayah: 28, ayahEnd: undefined });
  });

  it("parses a Quran range citation", () => {
    const cits = parseCitations("См. [Quran 36:1-5].");
    expect(cits[0]).toEqual({ type: "quran", ref: "36:1-5", surah: 36, ayah: 1, ayahEnd: 5 });
  });

  it("parses hadith citations across collections", () => {
    const cits = parseCitations(
      "Пророк (ﷺ) сказал [Bukhari 5063]. Также [Muslim 2812] и [Tirmidhi 1234].",
    );
    expect(cits).toHaveLength(3);
    expect(cits.map((c) => (c as { collection?: string }).collection)).toEqual([
      "Bukhari",
      "Muslim",
      "Tirmidhi",
    ]);
  });

  it("dedupes repeated citations", () => {
    const cits = parseCitations("[Quran 1:1] ... [Quran 1:1] ... [Bukhari 1] [Bukhari 1]");
    expect(cits).toHaveLength(2);
  });

  it("rejects malformed surah numbers", () => {
    expect(parseCitations("[Quran 0:1]")).toHaveLength(0);
    expect(parseCitations("[Quran 115:1]")).toHaveLength(0);
    expect(parseCitations("[Quran 2:0]")).toHaveLength(0);
  });

  it("ignores non-citation brackets", () => {
    expect(parseCitations("[note] [todo] [Quran two:three]")).toHaveLength(0);
  });

  it("hasAnyCitation", () => {
    expect(hasAnyCitation("Plain text without sources.")).toBe(false);
    expect(hasAnyCitation("With [Bukhari 1].")).toBe(true);
  });
});

describe("renderCitationsHtml", () => {
  it("renders Quran citations as links", () => {
    const html = renderCitationsHtml(
      "Кто творит благое — [Quran 99:7] увидит итог.",
      (c) =>
        c.type === "quran"
          ? `<a href="/reader/${c.surah}/${c.ayah}">[${c.ref}]</a>`
          : `<span>${c.ref}</span>`,
    );
    expect(html).toContain('<a href="/reader/99/7">[99:7]</a>');
    expect(html).not.toContain("[Quran 99:7]");
  });

  it("preserves surrounding text", () => {
    const html = renderCitationsHtml(
      "before [Quran 1:1] middle [Bukhari 5063] after",
      (c) => `<sup>${c.ref}</sup>`,
    );
    expect(html).toBe("before <sup>1:1</sup> middle <sup>Bukhari 5063</sup> after");
  });
});
