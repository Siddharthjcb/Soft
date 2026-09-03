import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { jsonError, parseJson, requireApiUser } from "@/lib/api";
import { createPaymentBody } from "@/lib/schemas";

/**
 * Creates (or reuses) a Razorpay order for an app Order that is still awaiting
 * payment, plus the matching Payment row. Returns what Razorpay Checkout needs.
 */
export async function POST(request: Request) {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  const parsed = await parseJson(createPaymentBody, request);
  if (!parsed.ok) return parsed.response;

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payments: true },
  });
  if (!order || order.userId !== authed.user.id) {
    return jsonError(404, "not_found", "Order not found.");
  }
  if (order.status !== OrderStatus.pending_payment) {
    return jsonError(409, "not_payable", "Order is not awaiting payment.");
  }

  // Reuse an existing pending Razorpay order if one is already attached.
  const existing = order.payments.find(
    (p) => p.type === PaymentType.order && p.status === PaymentStatus.created,
  );
  if (existing) {
    return NextResponse.json({
      razorpayOrderId: existing.razorpayOrderId,
      amount: existing.amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  }

  const rzpOrder = await razorpay.orders.create({
    amount: order.priceTotal, // paise
    currency: "INR",
    receipt: order.id,
    notes: { appOrderId: order.id, userId: authed.user.id },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: order.priceTotal,
      type: PaymentType.order,
      status: PaymentStatus.created,
    },
  });

  return NextResponse.json({
    razorpayOrderId: rzpOrder.id,
    amount: order.priceTotal,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
