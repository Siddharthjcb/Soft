import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Reject events older than this — blunts replay of a captured request. */
export const MAX_EVENT_AGE_SECONDS = 5 * 60;

/**
 * True when the event timestamp is missing, unparseable, or outside the
 * tolerance window (in either direction, to allow for clock skew).
 */
export function isStaleEvent(
  timestamp: string | number | null | undefined,
  maxAgeSeconds = MAX_EVENT_AGE_SECONDS,
): boolean {
  if (timestamp === null || timestamp === undefined) return true;
  const seconds =
    typeof timestamp === "number" ? timestamp : Number.parseInt(timestamp, 10);
  if (!Number.isFinite(seconds)) return true;
  const ageSeconds = Math.abs(Date.now() / 1000 - seconds);
  return ageSeconds > maxAgeSeconds;
}

/**
 * Claim an event id exactly once. Returns true if this call won the claim,
 * false if the event was already processed (a retry or a replay).
 */
export async function claimWebhookEvent(
  provider: "clerk" | "razorpay",
  eventId: string,
): Promise<boolean> {
  try {
    await prisma.processedWebhookEvent.create({ data: { provider, eventId } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return false;
    }
    throw err;
  }

  // No cron on the free tier — sweep old claims occasionally.
  if (Math.random() < 0.01) {
    void prisma.processedWebhookEvent
      .deleteMany({
        where: {
          processedAt: { lt: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        },
      })
      .catch(() => {
        /* best effort */
      });
  }

  return true;
}
