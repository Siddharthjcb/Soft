import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import {
  categoryLabel,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Billing" };

// Reads live data — never prerender.
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentUser();

  const [payments, hosting] = await Promise.all([
    prisma.payment.findMany({
      where: { order: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        receipt: true,
        order: { select: { id: true, category: true } },
      },
    }),
    prisma.hostingSubscription.findMany({
      where: { order: { userId: user.id } },
      orderBy: { nextBillingDate: "asc" },
      include: { order: { select: { id: true, category: true } } },
    }),
  ]);

  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Billing
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Payments &amp; hosting
          </h1>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-muted">No payments yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-ink">
                      {PAYMENT_TYPE_LABELS[p.type]} ·{" "}
                      {categoryLabel(p.order.category)}
                    </span>
                    <Link
                      href={`/dashboard/orders/${p.order.id}`}
                      className="font-mono text-xs text-muted underline underline-offset-4 hover:text-ink"
                    >
                      {p.order.id}
                    </Link>
                    <span className="font-mono text-xs text-muted">
                      {p.createdAt.toISOString().slice(0, 10)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-ink">
                      {formatINR(p.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md bg-faint px-2 py-1 font-mono text-xs uppercase tracking-widest ${
                        p.status === PaymentStatus.success
                          ? "text-success"
                          : p.status === PaymentStatus.failed
                            ? "text-danger"
                            : "text-muted"
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[p.status]}
                    </span>
                    {p.receipt && p.status === PaymentStatus.success ? (
                      <a
                        href={`/api/orders/${p.order.id}/receipt`}
                        className="text-sm text-ink underline underline-offset-4"
                      >
                        Receipt
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Hosting &amp; maintenance
          </h2>
          {hosting.length === 0 ? (
            <p className="text-sm text-muted">
              No hosting subscription yet. One is set up after your site is
              delivered.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {hosting.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-ink">
                      {categoryLabel(h.order.category)}
                    </span>
                    <Link
                      href={`/dashboard/orders/${h.order.id}`}
                      className="font-mono text-xs text-muted underline underline-offset-4 hover:text-ink"
                    >
                      {h.order.id}
                    </Link>
                  </div>
                  <div className="flex flex-col gap-1 sm:items-end">
                    <span className="font-mono text-sm text-ink">
                      {formatINR(h.monthlyFee)} / month
                    </span>
                    <span className="font-mono text-xs text-muted">
                      Next billing {h.nextBillingDate.toISOString().slice(0, 10)}{" "}
                      · {h.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-muted">
            Hosting is billed manually each month — we send you a payment link.
          </p>
        </section>
      </div>
    </Container>
  );
}
