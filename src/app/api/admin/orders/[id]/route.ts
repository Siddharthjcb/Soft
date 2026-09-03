import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendStatusUpdate } from "@/lib/email";
import { statusLabel } from "@/lib/order-display";
import { jsonError, parseJson, parseParams, requireApiAdmin } from "@/lib/api";
import { adminUpdateOrderBody, orderIdParams } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await requireApiAdmin();
  if (!authed.ok) return authed.response;

  const p = parseParams(orderIdParams, await params);
  if (!p.ok) return p.response;

  const parsed = await parseJson(adminUpdateOrderBody, request);
  if (!parsed.ok) return parsed.response;
  const { status, deliveredUrl: submittedUrl } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: p.data.id },
    include: { user: true },
  });
  if (!order) {
    return jsonError(404, "not_found", "Order not found.");
  }

  let deliveredUrl = order.deliveredUrl;
  if (status === OrderStatus.delivered) {
    const url = submittedUrl ?? "";
    if (!/^https?:\/\/.+/i.test(url)) {
      return jsonError(
        400,
        "invalid_delivered_url",
        "A valid delivered site URL (https://…) is required.",
      );
    }
    deliveredUrl = url;
  }

  const updated = await prisma.order.update({
    where: { id: p.data.id },
    data: { status, deliveredUrl },
  });

  if (status !== order.status) {
    try {
      await sendStatusUpdate({
        to: order.user.email,
        orderId: order.id,
        statusLabel: statusLabel(status),
        deliveredUrl: status === OrderStatus.delivered ? deliveredUrl : null,
      });
    } catch (err) {
      console.error("[admin] status-update email failed", err);
    }
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
