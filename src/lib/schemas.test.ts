import { describe, it, expect } from "vitest";
import {
  createOrderBody,
  createPaymentBody,
  revisionBody,
  verifyPaymentBody,
  adminUpdateOrderBody,
  razorpayEventBody,
} from "@/lib/schemas";

const validOrder = {
  category: "restaurant",
  tier: 2,
  deliveryPlan: "rush_2_day",
  addons: ["security"],
  requirementsText: "Menu plus online ordering.",
  assets: [{ url: "https://example.com/logo.png", fileName: "logo.png" }],
};

describe("createOrderBody", () => {
  it("accepts a well-formed order", () => {
    const r = createOrderBody.safeParse(validOrder);
    expect(r.success).toBe(true);
  });

  it("defaults addons and assets to empty arrays", () => {
    const r = createOrderBody.parse({
      category: "portfolio",
      tier: 1,
      deliveryPlan: "standard_1_week",
    });
    expect(r.addons).toEqual([]);
    expect(r.assets).toEqual([]);
  });

  it("rejects a tier outside 1-4", () => {
    expect(
      createOrderBody.safeParse({ ...validOrder, tier: 5 }).success,
    ).toBe(false);
    expect(
      createOrderBody.safeParse({ ...validOrder, tier: 0 }).success,
    ).toBe(false);
  });

  it("rejects an unknown category, plan or add-on", () => {
    expect(
      createOrderBody.safeParse({ ...validOrder, category: "spaceship" }).success,
    ).toBe(false);
    expect(
      createOrderBody.safeParse({ ...validOrder, deliveryPlan: "instant" })
        .success,
    ).toBe(false);
    expect(
      createOrderBody.safeParse({ ...validOrder, addons: ["free_stuff"] })
        .success,
    ).toBe(false);
  });

  it("rejects an asset url that is not a url", () => {
    const r = createOrderBody.safeParse({
      ...validOrder,
      assets: [{ url: "not-a-url", fileName: "x.png" }],
    });
    expect(r.success).toBe(false);
  });

  it("caps requirements length", () => {
    const r = createOrderBody.safeParse({
      ...validOrder,
      requirementsText: "x".repeat(5001),
    });
    expect(r.success).toBe(false);
  });

  it("accepts an optional idempotency key but rejects a short one", () => {
    expect(
      createOrderBody.safeParse({ ...validOrder, idempotencyKey: "a".repeat(16) })
        .success,
    ).toBe(true);
    expect(
      createOrderBody.safeParse({ ...validOrder, idempotencyKey: "short" })
        .success,
    ).toBe(false);
  });
});

describe("revisionBody", () => {
  it("trims and requires a meaningful note", () => {
    expect(revisionBody.parse({ note: "  please change the header  " }).note).toBe(
      "please change the header",
    );
    expect(revisionBody.safeParse({ note: "  a  " }).success).toBe(false);
    expect(revisionBody.safeParse({ note: "" }).success).toBe(false);
  });
});

describe("adminUpdateOrderBody", () => {
  it("only accepts a real order status", () => {
    expect(adminUpdateOrderBody.safeParse({ status: "delivered" }).success).toBe(
      true,
    );
    expect(adminUpdateOrderBody.safeParse({ status: "shipped" }).success).toBe(
      false,
    );
  });
});

describe("createPaymentBody / verifyPaymentBody", () => {
  it("requires an order id", () => {
    expect(createPaymentBody.safeParse({ orderId: "abc" }).success).toBe(true);
    expect(createPaymentBody.safeParse({ orderId: "" }).success).toBe(false);
  });

  it("requires all three Razorpay checkout fields", () => {
    expect(
      verifyPaymentBody.safeParse({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: "sig",
      }).success,
    ).toBe(true);
    expect(
      verifyPaymentBody.safeParse({
        razorpay_order_id: "order_1",
        razorpay_payment_id: "pay_1",
      }).success,
    ).toBe(false);
  });
});

describe("razorpayEventBody", () => {
  it("passes through unknown extra fields but requires event + payload", () => {
    const r = razorpayEventBody.safeParse({
      event: "payment.captured",
      created_at: 1234567890,
      account_id: "acc_1",
      payload: { payment: { entity: { id: "pay_1", order_id: "order_1" } } },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.payload.payment?.entity.order_id).toBe("order_1");
    }
  });

  it("rejects a payload-less event", () => {
    expect(razorpayEventBody.safeParse({ event: "payment.captured" }).success).toBe(
      false,
    );
  });
});
