import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Customers · Admin" };

// Reads live data — never prerender, or the build bakes in a stale list.
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  // Small operator-scale dataset: orders are pulled per user and totalled in
  // memory. Revisit with a groupBy if the customer list ever gets long.
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { id: true, priceTotal: true, status: true } },
    },
  });

  return (
    <Container>
      <div className="flex flex-col gap-8 py-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Customers
          </h1>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-muted">No customers yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {users.map((u) => {
              const paid = u.orders.filter(
                (o) => o.status !== OrderStatus.pending_payment,
              );
              const lifetime = paid.reduce((sum, o) => sum + o.priceTotal, 0);
              return (
                <li key={u.id}>
                  <Link
                    href={`/admin/customers/${u.id}`}
                    className="flex flex-col gap-3 p-5 transition-colors hover:bg-faint sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-ink">
                        {u.name ?? u.email}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {u.email}
                        {u.role === "admin" ? " · admin" : ""}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted">
                      {u.orders.length} order{u.orders.length === 1 ? "" : "s"} ·{" "}
                      {formatINR(lifetime)} lifetime
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
