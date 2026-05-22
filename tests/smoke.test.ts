import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("sanity check — runtime is alive", () => {
    expect(1 + 1).toBe(2);
  });
});
