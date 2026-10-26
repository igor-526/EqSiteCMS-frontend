import { describe, expect, it } from "vitest";
import { normalizationSchemas } from "./normalization";

describe("UT-SEO-06 normalization", () => {
  it.each(["hashes", "params"] as const)("%s trims and preserves case", (kind) => {
    expect(normalizationSchemas[kind].parse("  Top_Источник  ")).toBe("Top_Источник");
  });
  it("removes exactly one leading hash and permits hash-specific punctuation", () => {
    expect(normalizationSchemas.hashes.parse(" #Top ")).toBe("Top");
    expect(normalizationSchemas.hashes.parse("!/catalog?x=1")).toBe("!/catalog?x=1");
    expect(normalizationSchemas.hashes.safeParse("##Top").success).toBe(false);
  });
  describe.each(["hashes", "params"] as const)("%s", (kind) => {
    it.each(["", " ", "#", "##", "a#b", "a b", "a\tb", "a\nb", "a\u0000b", "a\u0085b", "a\u00a0b", "a\u2003b"])("rejects %j", (value) => {
      expect(normalizationSchemas[kind].safeParse(value).success).toBe(false);
    });
    it.each(["a", "😀"])("counts Unicode code points: %s", (symbol) => {
      expect(normalizationSchemas[kind].safeParse(symbol.repeat(255)).success).toBe(true);
      expect(normalizationSchemas[kind].safeParse(symbol.repeat(256)).success).toBe(false);
    });
  });
  it.each(["a&b", "a=b", "a?b", "#top"])("params reject %s", (value) => {
    expect(normalizationSchemas.params.safeParse(value).success).toBe(false);
  });
});
