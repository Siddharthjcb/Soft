import { describe, it, expect } from "vitest";
import {
  LANGUAGES,
  nextIndex,
  startIndex,
  preferredIndex,
} from "@/lib/languages";

describe("language catalogue", () => {
  it("carries all twelve scripts with both phrases", () => {
    expect(LANGUAGES).toHaveLength(12);
    for (const l of LANGUAGES) {
      expect(l.welcome.trim().length).toBeGreaterThan(0);
      expect(l.begin.trim().length).toBeGreaterThan(0);
      expect(l.fontVar.startsWith("--font-")).toBe(true);
      expect(l.locales.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reuses one face where two languages share a script", () => {
    const devanagari = LANGUAGES.filter(
      (l) => l.fontVar === "--font-devanagari",
    ).map((l) => l.id);
    expect(devanagari).toEqual(["hi", "mr"]);

    const bangla = LANGUAGES.filter((l) => l.fontVar === "--font-bangla").map(
      (l) => l.id,
    );
    expect(bangla).toEqual(["bn", "as"]);
  });

  it("never repeats a script back to back", () => {
    for (let i = 1; i < LANGUAGES.length; i++) {
      expect(LANGUAGES[i].fontVar).not.toBe(LANGUAGES[i - 1].fontVar);
    }
  });
});

describe("nextIndex", () => {
  it("advances and wraps", () => {
    expect(nextIndex(0)).toBe(1);
    expect(nextIndex(LANGUAGES.length - 1)).toBe(0);
  });

  it("does not divide by zero on an empty catalogue", () => {
    expect(nextIndex(3, 0)).toBe(0);
  });
});

describe("startIndex", () => {
  it("staggers instances so two never change together", () => {
    expect(startIndex(0)).toBe(0);
    expect(startIndex(6)).toBe(6);
    expect(startIndex(0)).not.toBe(startIndex(6));
  });

  it("wraps an offset past the end, and handles negatives", () => {
    expect(startIndex(LANGUAGES.length)).toBe(0);
    expect(startIndex(LANGUAGES.length + 2)).toBe(2);
    expect(startIndex(-1)).toBe(LANGUAGES.length - 1);
  });
});

describe("preferredIndex", () => {
  it("picks the viewer's own script when we serve it", () => {
    expect(LANGUAGES[preferredIndex(["ta-IN"])].id).toBe("ta");
    expect(LANGUAGES[preferredIndex(["ml"])].id).toBe("ml");
    expect(LANGUAGES[preferredIndex(["ur-PK"])].id).toBe("ur");
  });

  it("is case-insensitive and ignores the region subtag", () => {
    expect(LANGUAGES[preferredIndex(["BN-in"])].id).toBe("bn");
  });

  it("takes the first match in preference order", () => {
    expect(LANGUAGES[preferredIndex(["en-IN", "kn-IN"])].id).toBe("kn");
  });

  it("falls back to Devanagari for a language we do not serve", () => {
    expect(LANGUAGES[preferredIndex(["en-GB"])].id).toBe("hi");
    expect(LANGUAGES[preferredIndex([])].id).toBe("hi");
  });
});
