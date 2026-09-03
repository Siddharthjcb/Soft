import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

/**
 * Creates (or reuses) a Razorpay order for an app Order that is still awaiting
 * payment, plus the matching Payment row. Returns what Razorpay Checkout needs.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: { payments: true },
  });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== OrderStatus.pending_payment) {
    return NextResponse.json(
      { error: "Order is not awaiting payment" },
      { status: 409 },
    );
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
    notes: { appOrderId: order.id, userId: user.id },
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
