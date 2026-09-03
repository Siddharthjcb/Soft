import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

interface RazorpayWebhook {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string } };
    order?: { entity: { id: string } };
  };
}

/**
 * Razorpay webhook. On a captured payment / paid order we mark the Payment
 * row success and flip the Order from pending_payment to `new` (ready for
 * fulfilment). Idempotent.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const isPaid =
    event.event === "payment.captured" || event.event === "order.paid";
  if (!isPaid) {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const razorpayOrderId =
    event.payload.payment?.entity.order_id ?? event.payload.order?.entity.id;
  const razorpayPaymentId = event.payload.payment?.entity.id ?? null;
  if (!razorpayOrderId) {
    return NextResponse.json({ error: "no order id in payload" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: true },
  });
  if (!payment) {
    // Unknown order — ack so Razorpay stops retrying.
    return NextResponse.json({ ok: true, unknown: razorpayOrderId });
  }
  if (payment.status === PaymentStatus.success) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.success, razorpayPaymentId },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data:
        payment.order.status === OrderStatus.pending_payment
          ? { status: OrderStatus.new }
          : {},
    }),
  ]);

  return NextResponse.json({ ok: true });
}
