import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { describeOrderLineItems, type OrderSelections } from "@/lib/pricing";
import { renderReceiptPdf } from "@/lib/receipt";

// react-pdf needs the Node.js runtime.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, payments: { include: { receipt: true } } },
  });
  if (!order || order.userId !== user.id) {
    return new Response("Not found", { status: 404 });
  }

  const payment = order.payments.find(
    (p) => p.status === PaymentStatus.success && p.receipt,
  );
  if (!payment?.receipt) {
    return new Response("No receipt yet", { status: 404 });
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
