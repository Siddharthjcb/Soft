import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  categoryLabel,
  tierLabel,
} from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : null;

  const orders = await prisma.order.findMany({
    where: active ? { status: active } : {},
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <Container>
      <div className="flex flex-col gap-8 py-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Order queue
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          <FilterLink href="/admin" label="All" active={active === null} />
          {ORDER_STATUSES.map((s) => (
            <FilterLink
              key={s}
              href={`/admin?status=${s}`}
              label={STATUS_LABELS[s]}
              active={active === s}
            />
          ))}
        </nav>

        {orders.length === 0 ? (
          <p className="text-sm text-muted">
            No orders
            {active ? ` with status “${STATUS_LABELS[active]}”` : ""}.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-col gap-3 p-5 transition-colors hover:bg-faint sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-muted">{o.id}</span>
                    <span className="text-sm text-ink">
                      {categoryLabel(o.category)} · {tierLabel(o.tier)}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {o.createdAt.toISOString().slice(0, 10)} · {o.user.email} ·{" "}
                      {formatINR(o.priceTotal)}
                    </span>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-border text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
