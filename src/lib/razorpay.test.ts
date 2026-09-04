import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";
import { verifyCheckoutSignature, verifyWebhookSignature } from "@/lib/razorpay";

const KEY_SECRET = "test_key_secret_value";
const WEBHOOK_SECRET = "test_webhook_secret_value";

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("verifyCheckoutSignature", () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  });
  afterEach(() => {
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  const orderId = "order_ABC123";
  const paymentId = "pay_XYZ789";

  it("accepts a signature Razorpay would produce", () => {
    const sig = sign(`${orderId}|${paymentId}`, KEY_SECRET);
    expect(verifyCheckoutSignature(orderId, paymentId, sig)).toBe(true);
  });

  it("rejects a tampered payment id", () => {
    const sig = sign(`${orderId}|${paymentId}`, KEY_SECRET);
    expect(verifyCheckoutSignature(orderId, "pay_TAMPERED", sig)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    const sig = sign(`${orderId}|${paymentId}`, "not_the_secret");
    expect(verifyCheckoutSignature(orderId, paymentId, sig)).toBe(false);
  });

  it("rejects, without throwing, a signature of the wrong length", () => {
    expect(verifyCheckoutSignature(orderId, paymentId, "short")).toBe(false);
    expect(verifyCheckoutSignature(orderId, paymentId, "")).toBe(false);
  });

  it("fails closed when the secret is not configured", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const sig = sign(`${orderId}|${paymentId}`, KEY_SECRET);
    expect(verifyCheckoutSignature(orderId, paymentId, sig)).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });
  afterEach(() => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  const body = JSON.stringify({ event: "payment.captured", payload: {} });

  it("accepts a correctly signed raw body", () => {
    expect(verifyWebhookSignature(body, sign(body, WEBHOOK_SECRET))).toBe(true);
  });

  it("rejects a body that was modified after signing", () => {
    const sig = sign(body, WEBHOOK_SECRET);
    expect(verifyWebhookSignature(body + " ", sig)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifyWebhookSignature(body, null)).toBe(false);
  });

  it("fails closed when the secret is not configured", () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    expect(verifyWebhookSignature(body, sign(body, WEBHOOK_SECRET))).toBe(false);
  });
});
