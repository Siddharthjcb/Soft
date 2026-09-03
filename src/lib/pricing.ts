/**
 * PLACEHOLDER PRICING — every amount below is provisional and must be confirmed
 * with the operator before launch. Amounts are integer paise (CLAUDE.md:
 * "All money values stored as integers (paise), never floats").
 *
 * This is the single source of truth for prices shown on the marketing site
 * and (later) computed in the order flow.
 */

export type TierId = 1 | 2 | 3 | 4;

export interface Tier {
  id: TierId;
  name: string;
  /** short label used on the marketing surface, where "Tier 2" says nothing */
  short: string;
  tagline: string;
  pricePaise: number;
  /** true => display as "from ₹X" (Tier 4 is quoted after discovery) */
  priceIsFrom: boolean;
  includes: string[];
}

export const TIERS: Tier[] = [
  {
    id: 1,
    name: "Tier 1",
    short: "Make it yourself",
    tagline: "Pick a template, flat fee",
    pricePaise: 499900,
    priceIsFrom: false,
    includes: [
      "One category template",
      "Your content and branding applied",
      "Mobile-ready and hosted",
      "1-week standard delivery",
    ],
  },
  {
    id: 2,
    name: "Tier 2",
    short: "Customised",
    tagline: "Template plus customized features",
    pricePaise: 999900,
    priceIsFrom: false,
    includes: [
      "Everything in Tier 1",
      "Custom sections and layout changes",
      "Basic integrations: forms, maps, socials",
    ],
  },
  {
    id: 3,
    name: "Tier 3",
    short: "Advanced",
    tagline: "Advanced features",
    pricePaise: 1999900,
    priceIsFrom: false,
    includes: [
      "Everything in Tier 2",
      "Online ordering, bookings, or a dashboard",
      "Payment gateway setup",
    ],
  },
  {
    id: 4,
    name: "Tier 4",
    short: "Fully custom",
    tagline: "Fully custom project",
    pricePaise: 3999900,
    priceIsFrom: true,
    includes: [
      "Scoped entirely to your requirements",
      "Custom data model and workflows",
      "Final price after a short discovery call",
    ],
  },
];

export type DeliveryPlanId = "standard_1_week" | "rush_2_day";

export interface DeliveryOption {
  id: DeliveryPlanId;
  name: string;
  surchargePaise: number;
  note: string;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard_1_week",
    name: "Standard — 1 week",
    surchargePaise: 0,
    note: "Included",
  },
  {
    id: "rush_2_day",
    name: "Rush — 2 days",
    surchargePaise: 200000,
    note: "Faster turnaround",
  },
];

export type AddonId = "customization" | "security";

export interface AddonOption {
  id: AddonId;
  name: string;
  /** baseline; final amount varies by scope (CLAUDE.md) */
  fromPaise: number;
  note: string;
}

export const ADDONS: AddonOption[] = [
  {
    id: "customization",
    name: "Extra customization",
    fromPaise: 50000,
    note: "From — varies by scope",
  },
  {
    id: "security",
    name: "Security hardening",
    fromPaise: 100000,
    note: "From — varies by scope",
  },
];

/** Recurring hosting/maintenance, billed monthly. Manual for v1 (BUILD_PLAN Phase 6). */
export const HOSTING_MONTHLY_PAISE = 49900;

/** A customer's choices in the order flow. */
export interface OrderSelections {
  tier: TierId;
  deliveryPlan: DeliveryPlanId;
  addons: AddonId[];
}

/**
 * Total for an order, in integer paise. Add-on amounts are baselines ("from");
 * for Tier 4 the tier price is also a baseline. The order summary makes this
 * clear before payment.
 */
export function computeOrderTotal(sel: OrderSelections): number {
  const tier = TIERS.find((t) => t.id === sel.tier);
  const delivery = DELIVERY_OPTIONS.find((d) => d.id === sel.deliveryPlan);
  const addonTotal = sel.addons.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return sum + (addon?.fromPaise ?? 0);
  }, 0);
  return (tier?.pricePaise ?? 0) + (delivery?.surchargePaise ?? 0) + addonTotal;
}

/** Working days promised for each delivery plan — used to set Order.deadlineDate. */
export function deliveryDays(plan: DeliveryPlanId): number {
  return plan === "rush_2_day" ? 2 : 7;
}

/** Human-readable line items for a receipt / order summary. */
export function describeOrderLineItems(
  sel: OrderSelections,
): { label: string; amountPaise: number }[] {
  const items: { label: string; amountPaise: number }[] = [];

  const tier = TIERS.find((t) => t.id === sel.tier);
  if (tier) {
    items.push({
      label: `${tier.name} — ${tier.tagline}${tier.priceIsFrom ? " (from)" : ""}`,
      amountPaise: tier.pricePaise,
    });
  }

  const delivery = DELIVERY_OPTIONS.find((d) => d.id === sel.deliveryPlan);
  if (delivery && delivery.surchargePaise > 0) {
    items.push({ label: delivery.name, amountPaise: delivery.surchargePaise });
  }

  for (const id of sel.addons) {
    const addon = ADDONS.find((a) => a.id === id);
    if (addon) {
      items.push({ label: `${addon.name} (from)`, amountPaise: addon.fromPaise });
    }
  }

  return items;
}
