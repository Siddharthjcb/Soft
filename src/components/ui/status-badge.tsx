import { OrderStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/order-display";

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
      {STATUS_LABELS[status]}
    </span>
  );
}
