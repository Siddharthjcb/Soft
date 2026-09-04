import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, parseParams, requireApiUser } from "@/lib/api";
import { orderIdParams } from "@/lib/schemas";
import { describeOrderLineItems, type OrderSelections } from "@/lib/pricing";
import { renderReceiptPdf } from "@/lib/receipt";

// react-pdf needs the Node.js runtime.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await requireApiUser();
  if (!authed.ok) return authed.response;

  const p = parseParams(orderIdParams, await params);
  if (!p.ok) return p.response;

  const order = await prisma.order.findUnique({
    where: { id: p.data.id },
    include: { user: true, payments: { include: { receipt: true } } },
  });
  if (!order || order.userId !== authed.user.id) {
    return jsonError(404, "not_found", "Order not found.");
  }

  const payment = order.payments.find(
    (pay) => pay.status === PaymentStatus.success && pay.receipt,
  );
  if (!payment?.receipt) {
    return jsonError(404, "no_receipt", "No receipt for this order yet.");
  }

  const selections: OrderSelections = {
    tier: order.tier as OrderSelections["tier"],
    deliveryPlan: order.deliveryPlan,
    addons: Array.isArray(order.addons)
      ? (order.addons as OrderSelections["addons"])
      : [],
  };

  const pdf = await renderReceiptPdf({
    receiptNumber: payment.receipt.receiptNumber,
    issuedAt: payment.receipt.issuedAt,
    orderId: order.id,
    customerName: order.user.name,
    customerEmail: order.user.email,
    lineItems: describeOrderLineItems(selections),
    totalPaise: order.priceTotal,
    razorpayPaymentId: payment.razorpayPaymentId,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${payment.receipt.receiptNumber}.pdf"`,
    },
  });
}
