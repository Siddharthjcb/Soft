import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { categoryLabel, tierLabel } from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Customer · Admin" };

// Reads live data — never prerender.
export const dynamic = "force-dynamic";

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) notFound();

  const lifetime = user.orders
    .filter((o) => o.status !== OrderStatus.pending_payment)
    .reduce((sum, o) => sum + o.priceTotal, 0);

  return (
    <Container>
      <div className="flex flex-col gap-8 py-16 sm:py-24">
        <Link
          href="/admin/customers"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← Customers
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.name ?? user.email}
          </h1>
          <span className="font-mono text-xs text-muted">
            {user.email}
            {user.phone ? ` · ${user.phone}` : ""}
            {user.role === "admin" ? " · admin" : ""}
          </span>
          <span className="font-mono text-xs text-muted">
            Joined {user.createdAt.toISOString().slice(0, 10)} ·{" "}
            {user.orders.length} order{user.orders.length === 1 ? "" : "s"} ·{" "}
            {formatINR(lifetime)} lifetime
          </span>
        </div>

        {user.orders.length === 0 ? (
          <p className="text-sm text-muted">No orders from this customer yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {user.orders.map((o) => (
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
                      {o.createdAt.toISOString().slice(0, 10)} ·{" "}
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
