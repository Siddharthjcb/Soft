import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { categoryLabel, tierLabel } from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-surface p-8">
            <p className="text-base text-muted">You have no orders yet.</p>
            <Link
              href="/order/new"
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              Start an order
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/dashboard/orders/${o.id}`}
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
