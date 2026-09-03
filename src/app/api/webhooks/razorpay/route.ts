import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { settleOrderPayment } from "@/lib/payments";
import { jsonError } from "@/lib/api";
import { claimWebhookEvent, isStaleEvent } from "@/lib/webhook";
import { razorpayEventBody } from "@/lib/schemas";

// settleOrderPayment renders a PDF receipt (react-pdf).
export const runtime = "nodejs";

/**
 * Razorpay webhook. Verifies the signature, rejects stale events, claims the
 * event id once, then hands off to the shared settlement path — the same one
 * /api/payments/verify uses. Whichever arrives first wins.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return jsonError(400, "invalid_signature", "Signature verification failed.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return jsonError(400, "invalid_json", "Body is not valid JSON.");
  }

  const parsed = razorpayEventBody.safeParse(parsedJson);
  if (!parsed.success) {
    return jsonError(400, "invalid_event", "Unrecognised event payload.");
  }
  const event = parsed.data;

  // Replay window: reject events far outside the tolerance.
  if (isStaleEvent(event.created_at)) {
    return jsonError(400, "stale_event", "Event timestamp is outside the window.");
  }

  const isPaid =
    event.event === "payment.captured" ||
    event.event === "order.paid" ||
    event.event === "payment_link.paid";
  if (!isPaid) {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const razorpayOrderId =
    event.payload.payment?.entity.order_id ??
    event.payload.order?.entity.id ??
    event.payload.payment_link?.entity.id;
  const razorpayPaymentId = event.payload.payment?.entity.id ?? null;
  if (!razorpayOrderId) {
    return jsonError(400, "missing_reference", "No order reference in payload.");
  }

  // Claim the event id so a retry or replay is a no-op.
  const eventId = request.headers.get("x-razorpay-event-id") ?? razorpayOrderId;
  if (!(await claimWebhookEvent("razorpay", `${event.event}:${eventId}`))) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const result = await settleOrderPayment({
    razorpayOrderId,
    razorpayPaymentId,
  });

  // Unknown references are acked so Razorpay stops retrying.
  return NextResponse.json({ ok: true, settled: result.status });
}
