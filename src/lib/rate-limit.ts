import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, type ApiErrorBody } from "@/lib/api";

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the current window closes. */
  retryAfter: number;
}

/** Per-route budgets. Generous enough for real use, tight enough to blunt abuse. */
export const LIMITS = {
  createOrder: { bucket: "order:create", limit: 10, windowSeconds: 3600 },
  upload: { bucket: "upload", limit: 30, windowSeconds: 3600 },
  revision: { bucket: "order:revision", limit: 5, windowSeconds: 3600 },
  createPayment: { bucket: "payment:create", limit: 20, windowSeconds: 3600 },
  verifyPayment: { bucket: "payment:verify", limit: 30, windowSeconds: 3600 },
} as const;

/**
 * Fixed-window counter backed by Postgres — no external service.
 * The window is derived from the clock, so every caller in the same window
 * shares a row and the upsert increments it atomically.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const row = await prisma.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  // No cron on the free tier — sweep expired windows occasionally instead.
  if (Math.random() < 0.01) {
    void prisma.rateLimit
      .deleteMany({
        where: { windowStart: { lt: new Date(Date.now() - windowMs * 2) } },
      })
      .catch(() => {
        /* best effort */
      });
  }

  const retryAfter = Math.max(
    1,
    Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1000),
  );
  return { ok: row.count <= limit, retryAfter };
}

/** Signed-in user id when available, else the client IP. */
export function clientKey(request: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `ip:${ip}`;
}

/** Returns a 429 response when the caller is over budget, otherwise null. */
export async function enforceRateLimit(opts: {
  request: Request;
  bucket: string;
  limit: number;
  windowSeconds: number;
  userId?: string | null;
}): Promise<NextResponse<ApiErrorBody> | null> {
  const key = `${opts.bucket}:${clientKey(opts.request, opts.userId)}`;
  const result = await rateLimit(key, opts.limit, opts.windowSeconds);
  if (result.ok) return null;

  return jsonError(
    429,
    "rate_limited",
    "Too many requests. Please try again shortly.",
    { headers: { "Retry-After": String(result.retryAfter) } },
  );
}
