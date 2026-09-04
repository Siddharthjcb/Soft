import Link from "next/link";
import { OrderStatus, PaymentStatus, type Prisma } from "@prisma/client";
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

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : null;
  const query = (q ?? "").trim();

  const where: Prisma.OrderWhereInput = {
    ...(active ? { status: active } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query } },
            { user: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [orders, byStatus, revenue] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.success,
        createdAt: { gte: startOfMonth() },
      },
    }),
  ]);

  const countOf = (s: OrderStatus) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const needsAction =
    countOf(OrderStatus.new) + countOf(OrderStatus.revision_requested);

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

        {/* Overview */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Needs action" value={String(needsAction)} />
          <Stat label="In progress" value={String(countOf(OrderStatus.in_progress))} />
          <Stat label="Delivered" value={String(countOf(OrderStatus.delivered))} />
          <Stat
            label="Revenue (month)"
            value={formatINR(revenue._sum.amount ?? 0)}
          />
        </div>

        {/* Search — plain GET form, keeps the active status filter */}
        <form action="/admin" method="get" className="flex gap-3">
          {active && <input type="hidden" name="status" value={active} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search order id or customer email"
            aria-label="Search orders"
            className="h-11 flex-1 rounded-lg border border-border bg-transparent px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink"
          />
          <button
            type="submit"
            className="h-11 rounded-lg border border-border px-5 text-sm font-medium text-ink transition-colors hover:bg-faint"
          >
            Search
          </button>
        </form>

        <nav className="flex flex-wrap gap-2">
          <FilterLink
            href={query ? `/admin?q=${encodeURIComponent(query)}` : "/admin"}
            label="All"
            active={active === null}
          />
          {ORDER_STATUSES.map((s) => (
            <FilterLink
              key={s}
              href={`/admin?status=${s}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              label={STATUS_LABELS[s]}
              active={active === s}
            />
          ))}
        </nav>

        {orders.length === 0 ? (
          <p className="text-sm text-muted">
            No orders
            {active ? ` with status “${STATUS_LABELS[active]}”` : ""}
            {query ? ` matching “${query}”` : ""}.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tracking-tight text-ink">
        {value}
      </span>
    </div>
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
