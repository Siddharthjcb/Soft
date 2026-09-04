import Razorpay from "razorpay";
import crypto from "node:crypto";

let client: Razorpay | null = null;

/**
 * Server-side Razorpay client, constructed on first use. Test-mode keys for
 * now (CLAUDE.md).
 *
 * Deliberately lazy: the SDK throws if `key_id` is empty, so building it at
 * module scope would make *importing* this file crash whenever the env vars
 * are missing — taking down every route that touches payments, with an opaque
 * error. This way the failure is explicit and only at the point of use, and
 * the signature helpers below stay importable without any keys.
 */
export function getRazorpay(): Razorpay {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

/**
 * Verify the signature Razorpay Checkout hands back to the browser:
 * HMAC-SHA256("<order_id>|<payment_id>", RAZORPAY_KEY_SECRET).
 * Lets us confirm a payment immediately instead of waiting on the webhook.
 */
export function verifyCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
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
