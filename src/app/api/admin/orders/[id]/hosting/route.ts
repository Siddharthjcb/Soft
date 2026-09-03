import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HOSTING_MONTHLY_PAISE } from "@/lib/pricing";
import { jsonError, parseParams, requireApiAdmin } from "@/lib/api";
import { orderIdParams } from "@/lib/schemas";

/** Create a hosting subscription for a delivered order (one per order). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await requireApiAdmin();
  if (!authed.ok) return authed.response;

  const p = parseParams(orderIdParams, await params);
  if (!p.ok) return p.response;

  const order = await prisma.order.findUnique({
    where: { id: p.data.id },
    include: { hosting: true },
  });
  if (!order) {
    return jsonError(404, "not_found", "Order not found.");
  }
  if (order.status !== OrderStatus.delivered) {
    return jsonError(409, "not_delivered", "Order must be delivered first.");
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
