import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { settleOrderPayment } from "@/lib/payments";
import { jsonError, parseJson, requireApiUser } from "@/lib/api";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { verifyPaymentBody } from "@/lib/schemas";

// settleOrderPayment renders a PDF receipt (react-pdf).
export const runtime = "nodejs";

/**
 * Confirms a payment straight from the Razorpay Checkout callback, so the
 * customer is not left waiting on webhook delivery. The webhook remains the
 * backstop; whichever arrives first settles, the other is a no-op.
 */
export async function POST(request: Request) {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  const limited = await enforceRateLimit({
    request,
    userId: authed.user.id,
    ...LIMITS.verifyPayment,
  });
  if (limited) return limited;

  const parsed = await parseJson(verifyPaymentBody, request);
  if (!parsed.ok) return parsed.response;
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: signature,
  } = parsed.data;

  if (!verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, signature)) {
    return jsonError(400, "invalid_signature", "Payment signature is invalid.");
  }

  // The signature proves Razorpay issued it; this proves it is *this* user's.
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: true },
  });
  if (!payment || payment.order.userId !== authed.user.id) {
    return jsonError(404, "not_found", "Payment not found.");
  }

  const result = await settleOrderPayment({
    razorpayOrderId,
    razorpayPaymentId,
  });

  if (result.status === "unknown_reference") {
    return jsonError(404, "not_found", "Payment not found.");
  }

  return NextResponse.json({
    ok: true,
    orderId: payment.orderId,
    settled: result.status,
  });
}
