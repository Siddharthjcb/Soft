import { describe, it, expect } from "vitest";
import {
  TIERS,
  ADDONS,
  DELIVERY_OPTIONS,
  computeOrderTotal,
  describeOrderLineItems,
  deliveryDays,
  type OrderSelections,
} from "@/lib/pricing";

const tier1 = TIERS.find((t) => t.id === 1)!;
const rush = DELIVERY_OPTIONS.find((d) => d.id === "rush_2_day")!;
const customization = ADDONS.find((a) => a.id === "customization")!;
const security = ADDONS.find((a) => a.id === "security")!;

describe("catalog integrity", () => {
  it("prices every amount as a whole number of paise", () => {
    const amounts = [
      ...TIERS.map((t) => t.pricePaise),
      ...DELIVERY_OPTIONS.map((d) => d.surchargePaise),
      ...ADDONS.map((a) => a.fromPaise),
    ];
    for (const a of amounts) expect(Number.isInteger(a)).toBe(true);
  });

  it("keeps the add-on baselines CLAUDE.md promises", () => {
    expect(customization.fromPaise).toBe(50000); // ₹500
    expect(security.fromPaise).toBe(100000); // ₹1000
  });

  it("prices tiers in ascending order", () => {
    const prices = TIERS.map((t) => t.pricePaise);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
});

describe("computeOrderTotal", () => {
  const base: OrderSelections = {
    tier: 1,
    deliveryPlan: "standard_1_week",
    addons: [],
  };

  it("is the tier price when nothing is added", () => {
    expect(computeOrderTotal(base)).toBe(tier1.pricePaise);
  });

  it("adds the rush surcharge", () => {
    expect(computeOrderTotal({ ...base, deliveryPlan: "rush_2_day" })).toBe(
      tier1.pricePaise + rush.surchargePaise,
    );
  });

  it("adds every selected add-on", () => {
    expect(
      computeOrderTotal({ ...base, addons: ["customization", "security"] }),
    ).toBe(tier1.pricePaise + customization.fromPaise + security.fromPaise);
  });

  it("never charges for a duplicate-free empty selection twice", () => {
    const once = computeOrderTotal({ ...base, addons: ["customization"] });
    expect(once).toBe(tier1.pricePaise + customization.fromPaise);
  });

  it("returns an integer for every tier and plan combination", () => {
    for (const tier of TIERS) {
      for (const plan of DELIVERY_OPTIONS) {
        const total = computeOrderTotal({
          tier: tier.id,
          deliveryPlan: plan.id,
          addons: ["customization", "security"],
        });
        expect(Number.isInteger(total)).toBe(true);
        expect(total).toBeGreaterThan(0);
      }
    }
  });
});

describe("describeOrderLineItems", () => {
  it("line items always sum to the computed total", () => {
    for (const tier of TIERS) {
      for (const plan of DELIVERY_OPTIONS) {
        const selections: OrderSelections = {
          tier: tier.id,
          deliveryPlan: plan.id,
          addons: ["security"],
        };
        const sum = describeOrderLineItems(selections).reduce(
          (acc, i) => acc + i.amountPaise,
          0,
        );
        expect(sum).toBe(computeOrderTotal(selections));
      }
    }
  });

  it("omits a zero-cost delivery option", () => {
    const items = describeOrderLineItems({
      tier: 1,
      deliveryPlan: "standard_1_week",
      addons: [],
    });
    expect(items).toHaveLength(1);
    expect(items[0].label).toContain("Tier 1");
  });

  it("includes the rush option when it costs something", () => {
    const items = describeOrderLineItems({
      tier: 1,
      deliveryPlan: "rush_2_day",
      addons: [],
    });
    expect(items).toHaveLength(2);
    expect(items[1].amountPaise).toBe(rush.surchargePaise);
  });

  it("marks baseline amounts as 'from'", () => {
    const items = describeOrderLineItems({
      tier: 4,
      deliveryPlan: "standard_1_week",
      addons: ["customization"],
    });
    expect(items[0].label).toContain("(from)"); // tier 4 is quoted
    expect(items[1].label).toContain("(from)"); // add-ons are baselines
  });
});

describe("deliveryDays", () => {
  it("promises 2 days for rush and 7 for standard", () => {
    expect(deliveryDays("rush_2_day")).toBe(2);
    expect(deliveryDays("standard_1_week")).toBe(7);
  });
});
