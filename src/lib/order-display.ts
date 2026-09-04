import { OrderStatus, PaymentStatus, PaymentType } from "@prisma/client";
import { CATEGORIES } from "@/lib/categories";
import { TIERS, DELIVERY_OPTIONS, ADDONS } from "@/lib/pricing";

export const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.pending_payment,
  OrderStatus.new,
  OrderStatus.in_progress,
  OrderStatus.revision_requested,
  OrderStatus.delivered,
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  new: "New",
  in_progress: "In progress",
  revision_requested: "Revision requested",
  delivered: "Delivered",
};

export const statusLabel = (s: OrderStatus): string => STATUS_LABELS[s];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  order: "Order",
  hosting: "Hosting",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  created: "Pending",
  success: "Paid",
  failed: "Failed",
};

export const categoryLabel = (id: string): string =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;

export const tierLabel = (id: number): string => {
  const t = TIERS.find((x) => x.id === id);
  return t ? `${t.name} — ${t.tagline}` : `Tier ${id}`;
};

export const deliveryLabel = (id: string): string =>
  DELIVERY_OPTIONS.find((d) => d.id === id)?.name ?? id;

export const addonLabels = (ids: unknown): string[] =>
  Array.isArray(ids)
    ? ids.map((i) => ADDONS.find((a) => a.id === i)?.name ?? String(i))
    : [];
