import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    rateLimit: { upsert: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { rateLimit, clientKey, enforceRateLimit, LIMITS } = await import(
  "@/lib/rate-limit"
);

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com/api/orders", {
    method: "POST",
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.rateLimit.deleteMany.mockResolvedValue({ count: 0 });
});

describe("rateLimit", () => {
  it("allows a caller at exactly the limit", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 10 });
    const result = await rateLimit("k", 10, 3600);
    expect(result.ok).toBe(true);
  });

  it("blocks the request that goes one over", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 11 });
    const result = await rateLimit("k", 10, 3600);
    expect(result.ok).toBe(false);
  });

  it("increments rather than overwriting the counter", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 1 });
    await rateLimit("k", 10, 3600);
    const args = prismaMock.rateLimit.upsert.mock.calls[0][0];
    expect(args.update).toEqual({ count: { increment: 1 } });
    expect(args.create.count).toBe(1);
  });

  it("buckets callers into a shared, clock-aligned window", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 1 });
    await rateLimit("k", 10, 3600);
    await rateLimit("k", 10, 3600);

    const first = prismaMock.rateLimit.upsert.mock.calls[0][0].where
      .key_windowStart.windowStart as Date;
    const second = prismaMock.rateLimit.upsert.mock.calls[1][0].where
      .key_windowStart.windowStart as Date;

    expect(first.getTime()).toBe(second.getTime());
    expect(first.getTime() % (3600 * 1000)).toBe(0);
  });

  it("reports a retryAfter inside the window, never zero", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 99 });
    const { retryAfter } = await rateLimit("k", 10, 60);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });
});

describe("clientKey", () => {
  it("prefers the signed-in user id", () => {
    expect(clientKey(request({ "x-forwarded-for": "1.2.3.4" }), "user_9")).toBe(
      "user:user_9",
    );
  });

  it("falls back to the first x-forwarded-for entry", () => {
    expect(clientKey(request({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe(
      "ip:1.2.3.4",
    );
  });

  it("falls back to x-real-ip, then to unknown", () => {
    expect(clientKey(request({ "x-real-ip": "9.9.9.9" }))).toBe("ip:9.9.9.9");
    expect(clientKey(request())).toBe("ip:unknown");
  });

  it("keeps two different users in separate buckets", () => {
    expect(clientKey(request(), "a")).not.toBe(clientKey(request(), "b"));
  });
});

describe("enforceRateLimit", () => {
  it("returns null so the handler continues when under budget", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 1 });
    const result = await enforceRateLimit({
      request: request(),
      userId: "u1",
      ...LIMITS.createOrder,
    });
    expect(result).toBeNull();
  });

  it("returns 429 with Retry-After once over budget", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({
      count: LIMITS.createOrder.limit + 1,
    });
    const result = await enforceRateLimit({
      request: request(),
      userId: "u1",
      ...LIMITS.createOrder,
    });

    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
    expect(Number(result!.headers.get("Retry-After"))).toBeGreaterThan(0);

    const body = (await result!.json()) as { error: { code: string } };
    expect(body.error.code).toBe("rate_limited");
  });

  it("namespaces buckets per route so one does not exhaust another", async () => {
    prismaMock.rateLimit.upsert.mockResolvedValue({ count: 1 });
    await enforceRateLimit({
      request: request(),
      userId: "u1",
      ...LIMITS.createOrder,
    });
    await enforceRateLimit({
      request: request(),
      userId: "u1",
      ...LIMITS.upload,
    });

    const keys = prismaMock.rateLimit.upsert.mock.calls.map(
      (c) => c[0].where.key_windowStart.key as string,
    );
    expect(keys[0]).not.toBe(keys[1]);
    expect(keys[0]).toContain(LIMITS.createOrder.bucket);
    expect(keys[1]).toContain(LIMITS.upload.bucket);
  });
});
