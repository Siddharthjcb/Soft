import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { describeOrderLineItems, type OrderSelections } from "@/lib/pricing";
import { renderReceiptPdf } from "@/lib/receipt";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email";

// react-pdf needs the Node.js runtime.
export const runtime = "nodejs";

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

  // Receipt + emails. Best-effort: a mail failure must not fail the webhook
  // (the payment is already recorded and this event won't be reprocessed).
  try {
    const receiptNumber = `RCPT-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${payment.id.slice(-6).toUpperCase()}`;

    const receipt = await prisma.receipt.upsert({
      where: { paymentId: payment.id },
      update: {},
      create: { paymentId: payment.id, receiptNumber },
    });

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { user: true },
    });

    if (order) {
      const selections: OrderSelections = {
        tier: order.tier as OrderSelections["tier"],
        deliveryPlan: order.deliveryPlan,
        addons: Array.isArray(order.addons)
          ? (order.addons as OrderSelections["addons"])
          : [],
      };
      const lineItems = describeOrderLineItems(selections);

      const pdf = await renderReceiptPdf({
        receiptNumber: receipt.receiptNumber,
        issuedAt: receipt.issuedAt,
        orderId: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        lineItems,
        totalPaise: order.priceTotal,
        razorpayPaymentId,
      });

      await sendOrderConfirmation({
        to: order.user.email,
        orderId: order.id,
        receiptNumber: receipt.receiptNumber,
        totalPaise: order.priceTotal,
        pdf,
      });
      await sendAdminNewOrder({
        orderId: order.id,
        category: order.category,
        tier: order.tier,
        totalPaise: order.priceTotal,
        customerEmail: order.user.email,
      });
    }
  } catch (err) {
    console.error("[razorpay webhook] receipt/email failed", err);
  }

  return NextResponse.json({ ok: true });
}
