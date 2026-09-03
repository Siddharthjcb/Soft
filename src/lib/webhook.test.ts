import { describe, it, expect } from "vitest";
import { isStaleEvent, MAX_EVENT_AGE_SECONDS } from "@/lib/webhook";

const now = () => Math.floor(Date.now() / 1000);

describe("isStaleEvent", () => {
  it("accepts an event from right now", () => {
    expect(isStaleEvent(now())).toBe(false);
  });

  it("accepts a string timestamp (svix sends one)", () => {
    expect(isStaleEvent(String(now()))).toBe(false);
  });

  it("accepts an event just inside the window", () => {
    expect(isStaleEvent(now() - (MAX_EVENT_AGE_SECONDS - 30))).toBe(false);
  });

  it("rejects an event past the window — the replay case", () => {
    expect(isStaleEvent(now() - (MAX_EVENT_AGE_SECONDS + 60))).toBe(true);
  });

  it("tolerates small forward clock skew but rejects large", () => {
    expect(isStaleEvent(now() + 30)).toBe(false);
    expect(isStaleEvent(now() + MAX_EVENT_AGE_SECONDS + 60)).toBe(true);
  });

  it("fails closed on missing or unparseable timestamps", () => {
    expect(isStaleEvent(null)).toBe(true);
    expect(isStaleEvent(undefined)).toBe(true);
    expect(isStaleEvent("not-a-number")).toBe(true);
    expect(isStaleEvent(Number.NaN)).toBe(true);
  });

  it("honours a custom tolerance", () => {
    expect(isStaleEvent(now() - 100, 60)).toBe(true);
    expect(isStaleEvent(now() - 30, 60)).toBe(false);
  });
});
