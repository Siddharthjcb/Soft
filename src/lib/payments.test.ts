import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderStatus, PaymentStatus, PaymentType } from "@prisma/client";

const { prismaMock, emailMock } = vi.hoisted(() => ({
  prismaMock: {
    payment: { findUnique: vi.fn(), updateMany: vi.fn() },
    order: { update: vi.fn(), findUnique: vi.fn() },
    hostingSubscription: { findUnique: vi.fn(), update: vi.fn() },
    receipt: { upsert: vi.fn() },
  },
  emailMock: {
    sendOrderConfirmation: vi.fn(),
    sendAdminNewOrder: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/receipt", () => ({
  renderReceiptPdf: vi.fn(async () => Buffer.from("pdf")),
}));
vi.mock("@/lib/email", () => emailMock);

const { settleOrderPayment } = await import("@/lib/payments");

const ORDER = {
  id: "order_1",
  status: OrderStatus.pending_payment,
  deliveryPlan: "rush_2_day" as const,
  deadlineDate: null,
  tier: 2,
  addons: ["security"],
  priceTotal: 1099900,
  category: "restaurant",
  user: { email: "customer@example.com", name: "Aisha" },
};

function orderPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay_row_1",
    orderId: ORDER.id,
    type: PaymentType.order,
    status: PaymentStatus.created,
    order: ORDER,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.receipt.upsert.mockResolvedValue({
    receiptNumber: "RCPT-20260903-ABC123",
    issuedAt: new Date("2026-09-03T00:00:00Z"),
  });
  prismaMock.order.findUnique.mockResolvedValue(ORDER);
  prismaMock.order.update.mockResolvedValue(ORDER);
  emailMock.sendOrderConfirmation.mockResolvedValue(undefined);
  emailMock.sendAdminNewOrder.mockResolvedValue(undefined);
});

describe("settleOrderPayment", () => {
  it("reports an unmatched Razorpay reference instead of throwing", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);

    const result = await settleOrderPayment({
      razorpayOrderId: "order_unknown",
      razorpayPaymentId: null,
    });

    expect(result).toEqual({ status: "unknown_reference" });
    expect(prismaMock.payment.updateMany).not.toHaveBeenCalled();
  });

  it("settles an order payment: status -> new, deadline from the plan", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(orderPayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

    const before = Date.now();
    const result = await settleOrderPayment({
      razorpayOrderId: "order_rzp_1",
      razorpayPaymentId: "pay_1",
    });

    expect(result).toEqual({ status: "settled" });

    const update = prismaMock.order.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: ORDER.id });
    expect(update.data.status).toBe(OrderStatus.new);

    // rush_2_day => two days out
    const deadline = (update.data.deadlineDate as Date).getTime();
    const twoDays = 2 * 24 * 3600 * 1000;
    expect(deadline).toBeGreaterThanOrEqual(before + twoDays - 5000);
    expect(deadline).toBeLessThanOrEqual(Date.now() + twoDays + 5000);
  });

  it("only lets one of two concurrent callers do the work", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(orderPayment());
    // The compare-and-set: first caller claims it, second finds nothing to update.
    prismaMock.payment.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const [first, second] = await Promise.all([
      settleOrderPayment({ razorpayOrderId: "o", razorpayPaymentId: "p" }),
      settleOrderPayment({ razorpayOrderId: "o", razorpayPaymentId: "p" }),
    ]);

    const outcomes = [first.status, second.status].sort();
    expect(outcomes).toEqual(["already_settled", "settled"]);
    // Side effects ran exactly once.
    expect(prismaMock.order.update).toHaveBeenCalledTimes(1);
    expect(emailMock.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it("does not re-run side effects for an already-successful payment", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(
      orderPayment({ status: PaymentStatus.success }),
    );
    prismaMock.payment.updateMany.mockResolvedValue({ count: 0 });

    const result = await settleOrderPayment({
      razorpayOrderId: "o",
      razorpayPaymentId: "p",
    });

    expect(result).toEqual({ status: "already_settled" });
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(emailMock.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it("rolls a hosting subscription forward without touching order status", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(
      orderPayment({
        type: PaymentType.hosting,
        order: { ...ORDER, status: OrderStatus.delivered },
      }),
    );
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.hostingSubscription.findUnique.mockResolvedValue({
      id: "sub_1",
      nextBillingDate: new Date("2026-09-10T00:00:00Z"),
    });

    const result = await settleOrderPayment({
      razorpayOrderId: "plink_1",
      razorpayPaymentId: "pay_2",
    });

    expect(result).toEqual({ status: "hosting_settled" });
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(emailMock.sendOrderConfirmation).not.toHaveBeenCalled();

    const next = prismaMock.hostingSubscription.update.mock.calls[0][0].data
      .nextBillingDate as Date;
    expect(next.toISOString().slice(0, 10)).toBe("2026-10-10");
  });

  it("leaves a non-pending order's status alone when a late payment lands", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(
      orderPayment({ order: { ...ORDER, status: OrderStatus.in_progress } }),
    );
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

    await settleOrderPayment({ razorpayOrderId: "o", razorpayPaymentId: "p" });

    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it("still reports success when the receipt email fails", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(orderPayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
    emailMock.sendOrderConfirmation.mockRejectedValue(new Error("resend down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await settleOrderPayment({
      razorpayOrderId: "o",
      razorpayPaymentId: "p",
    });

    expect(result).toEqual({ status: "settled" });
    // The payment was still recorded — the money is not lost to a mail outage.
    expect(prismaMock.payment.updateMany).toHaveBeenCalled();
    spy.mockRestore();
  });
});
