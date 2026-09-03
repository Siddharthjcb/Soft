import Razorpay from "razorpay";
import crypto from "node:crypto";

/**
 * Server-side Razorpay client. Test-mode keys for now (CLAUDE.md).
 * Keys come from RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

/** Verify a Razorpay webhook signature (HMAC-SHA256 of the raw body). */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}
