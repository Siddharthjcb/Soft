import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendStatusUpdate } from "@/lib/email";
import { ORDER_STATUSES, statusLabel } from "@/lib/order-display";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  let body: { status?: string; deliveredUrl?: string };
  try {
    body = (await request.json()) as { status?: string; deliveredUrl?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let deliveredUrl = order.deliveredUrl;
  if (status === OrderStatus.delivered) {
    const url = (body.deliveredUrl ?? "").trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      return NextResponse.json(
        { error: "A valid delivered site URL (https://…) is required." },
        { status: 400 },
      );
    }
    deliveredUrl = url;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status, deliveredUrl },
  });

  if (status !== order.status) {
    try {
      await sendStatusUpdate({
        to: order.user.email,
        orderId: order.id,
        statusLabel: statusLabel(status),
        deliveredUrl:
          status === OrderStatus.delivered ? deliveredUrl : null,
      });
    } catch (err) {
      console.error("[admin] status-update email failed", err);
    }
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
