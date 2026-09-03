import { NextResponse } from "next/server";
import { PaymentStatus, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

/**
 * Generate a one-off Razorpay Payment Link for this month's hosting fee.
 * The operator sends the link to the customer manually. A Payment row
 * (type = hosting) tracks it; the webhook marks it success and rolls the
 * subscription's nextBillingDate forward.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ subId: string }> },
) {
  await requireAdmin();
  const { subId } = await params;

  const sub = await prisma.hostingSubscription.findUnique({
    where: { id: subId },
    include: { order: { include: { user: true } } },
  });
  if (!sub) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  const period = new Date().toISOString().slice(0, 7); // YYYY-MM

  const link = (await razorpay.paymentLink.create({
    amount: sub.monthlyFee,
    currency: "INR",
    description: `Hosting & maintenance — order ${sub.orderId} — ${period}`,
    customer: {
      email: sub.order.user.email,
      name: sub.order.user.name ?? "",
    },
    notify: { email: false, sms: false },
    reminder_enable: false,
    notes: { hostingSubscriptionId: sub.id, orderId: sub.orderId, period },
  })) as { id: string; short_url: string };

  await prisma.payment.create({
    data: {
      orderId: sub.orderId,
      razorpayOrderId: link.id, // payment-link id (plink_...) as the Razorpay ref
      amount: sub.monthlyFee,
      type: PaymentType.hosting,
      status: PaymentStatus.created,
    },
  });

  return NextResponse.json({ ok: true, url: link.short_url });
}
