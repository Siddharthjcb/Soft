import { OrderStatus, PaymentStatus, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  deliveryDays,
  describeOrderLineItems,
  type OrderSelections,
} from "@/lib/pricing";
import { renderReceiptPdf } from "@/lib/receipt";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email";

export type SettleResult =
  | { status: "settled" }
  | { status: "hosting_settled" }
  | { status: "already_settled" }
  | { status: "unknown_reference" };

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Single settlement path for a successful Razorpay payment, shared by the
 * webhook and the client-side verify endpoint. Whichever arrives first wins;
 * the other becomes a no-op.
 *
 * Idempotency is enforced by a conditional update (compare-and-set on
 * PaymentStatus), so two concurrent callers cannot both do the side effects.
 */
export async function settleOrderPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
}): Promise<SettleResult> {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
    include: { order: true },
  });
  if (!payment) return { status: "unknown_reference" };

  // Compare-and-set: only one caller can flip created -> success.
  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, status: { not: PaymentStatus.success } },
    data: {
      status: PaymentStatus.success,
      razorpayPaymentId: input.razorpayPaymentId,
    },
  });
  if (claimed.count === 0) return { status: "already_settled" };

  const isOrderPayment = payment.type === PaymentType.order;
  const wasPending = payment.order.status === OrderStatus.pending_payment;

  if (isOrderPayment && wasPending) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.new,
        deadlineDate:
          payment.order.deadlineDate ??
          addDays(new Date(), deliveryDays(payment.order.deliveryPlan)),
      },
    });
  }

  // Hosting fee: roll the subscription forward, no receipt email.
  if (!isOrderPayment) {
    const sub = await prisma.hostingSubscription.findUnique({
      where: { orderId: payment.orderId },
    });
    if (sub) {
      const next = new Date(sub.nextBillingDate);
      next.setMonth(next.getMonth() + 1);
      await prisma.hostingSubscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: next },
      });
    }
    return { status: "hosting_settled" };
  }

  // Receipt + emails. Best-effort: the payment is already recorded and this
  // event will not be reprocessed, so a mail failure must not throw.
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

      const pdf = await renderReceiptPdf({
        receiptNumber: receipt.receiptNumber,
        issuedAt: receipt.issuedAt,
        orderId: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        lineItems: describeOrderLineItems(selections),
        totalPaise: order.priceTotal,
        razorpayPaymentId: input.razorpayPaymentId,
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
    console.error("[settleOrderPayment] receipt/email failed", err);
  }

  return { status: "settled" };
}
