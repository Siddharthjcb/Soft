import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";
import { ADDONS, DELIVERY_OPTIONS } from "@/lib/pricing";
import { ORDER_STATUSES } from "@/lib/order-display";

/** Derive a zod enum from a catalog array so ids stay in one place. */
function idsOf<T extends { id: string }>(items: readonly T[]): [T["id"], ...T["id"][]] {
  return items.map((i) => i.id) as [T["id"], ...T["id"][]];
}

export const categoryIdSchema = z.enum(idsOf(CATEGORIES));
export const deliveryPlanSchema = z.enum(idsOf(DELIVERY_OPTIONS));
export const addonIdSchema = z.enum(idsOf(ADDONS));
export const orderStatusSchema = z.enum(
  ORDER_STATUSES as [(typeof ORDER_STATUSES)[number], ...typeof ORDER_STATUSES],
);
export const tierIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

/** cuid()-shaped ids used by every model. */
export const idSchema = z.string().min(1).max(64);

// --- route params -----------------------------------------------------------

export const orderIdParams = z.object({ id: idSchema });
export const subIdParams = z.object({ subId: idSchema });

// --- POST /api/orders -------------------------------------------------------

export const createOrderBody = z.object({
  category: categoryIdSchema,
  tier: tierIdSchema,
  deliveryPlan: deliveryPlanSchema,
  addons: z.array(addonIdSchema).max(10).default([]),
  requirementsText: z.string().max(5000).optional(),
  assets: z
    .array(
      z.object({
        url: z.url(),
        fileName: z.string().min(1).max(200),
      }),
    )
    .max(20)
    .default([]),
});
export type CreateOrderBody = z.infer<typeof createOrderBody>;

// --- POST /api/payments/create ----------------------------------------------

export const createPaymentBody = z.object({ orderId: idSchema });

// --- POST /api/orders/[id]/revision -----------------------------------------

export const revisionBody = z.object({
  note: z.string().trim().min(5, "Note is too short").max(2000),
});

// --- POST /api/admin/orders/[id] --------------------------------------------

export const adminUpdateOrderBody = z.object({
  status: orderStatusSchema,
  deliveredUrl: z.string().trim().max(2048).optional(),
});

// --- webhooks ---------------------------------------------------------------

export const clerkEventBody = z.object({
  type: z.string(),
  data: z.looseObject({ id: z.string().optional() }),
});

export const clerkUserData = z.looseObject({
  id: z.string(),
  email_addresses: z
    .array(z.looseObject({ id: z.string(), email_address: z.string() }))
    .optional(),
  primary_email_address_id: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  username: z.string().nullish(),
  public_metadata: z.looseObject({ role: z.string().optional() }).nullish(),
});

export const razorpayEventBody = z.object({
  event: z.string(),
  payload: z.looseObject({
    payment: z
      .looseObject({
        entity: z.looseObject({ id: z.string(), order_id: z.string().nullish() }),
      })
      .optional(),
    order: z
      .looseObject({ entity: z.looseObject({ id: z.string() }) })
      .optional(),
    payment_link: z
      .looseObject({ entity: z.looseObject({ id: z.string() }) })
      .optional(),
  }),
});
