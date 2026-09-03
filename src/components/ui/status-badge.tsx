import { OrderStatus } from "@prisma/client";

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  new: "New",
  in_progress: "In progress",
  revision_requested: "Revision requested",
  delivered: "Delivered",
};

/**
 * Monochrome by default (DESIGN.md). `success` is the only non-neutral colour
 * used here, and only for a delivered order.
 */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const delivered = status === OrderStatus.delivered;
  return (
    <span
      className={`inline-flex items-center rounded-md bg-faint px-2 py-1 font-mono text-xs uppercase tracking-widest ${
        delivered ? "text-success" : "text-muted"
      }`}
    >
      {LABELS[status]}
    </span>
  );
}
