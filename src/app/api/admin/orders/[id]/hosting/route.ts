import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { HOSTING_MONTHLY_PAISE } from "@/lib/pricing";

/** Create a hosting subscription for a delivered order (one per order). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { hosting: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== OrderStatus.delivered) {
    return NextResponse.json(
      { error: "Order must be delivered first" },
      { status: 409 },
    );
  }
  if (order.hosting) {
    return NextResponse.json({ ok: true, id: order.hosting.id });
  }

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const sub = await prisma.hostingSubscription.create({
    data: {
      orderId: order.id,
      monthlyFee: HOSTING_MONTHLY_PAISE,
      nextBillingDate,
    },
  });

  return NextResponse.json({ ok: true, id: sub.id });
}
