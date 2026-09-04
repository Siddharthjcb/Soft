import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { RevisionRequest } from "@/components/order/revision-request";
import {
  categoryLabel,
  tierLabel,
  deliveryLabel,
  addonLabels,
} from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      assets: true,
      payments: { include: { receipt: true } },
      revisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order || order.userId !== user.id) notFound();

  const paidPayment = order.payments.find(
    (p) => p.status === PaymentStatus.success && p.receipt,
  );
  const canRequestRevision =
    order.status === OrderStatus.in_progress ||
    order.status === OrderStatus.delivered;

  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← All orders
        </Link>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-muted">{order.id}</span>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              {categoryLabel(order.category)}
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <dl className="flex flex-col divide-y divide-border rounded-xl border border-border">
          <DetailRow label="Tier" value={tierLabel(order.tier)} />
          <DetailRow label="Delivery" value={deliveryLabel(order.deliveryPlan)} />
          <DetailRow
            label="Add-ons"
            value={addonLabels(order.addons).join(", ") || "None"}
          />
          <DetailRow label="Total" value={formatINR(order.priceTotal)} />
          <DetailRow
            label="Placed"
            value={order.createdAt.toISOString().slice(0, 10)}
          />
        </dl>

        {order.requirementsText && (
          <section className="flex flex-col gap-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
              Requirements
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {order.requirementsText}
            </p>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Files
          </h2>
          {order.assets.length === 0 ? (
            <p className="text-sm text-muted">No files attached.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {order.assets.map((a) => (
                <li key={a.id}>
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink underline underline-offset-4"
                  >
                    {a.fileName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Receipt
          </h2>
          {paidPayment?.receipt ? (
            <a
              href={`/api/orders/${order.id}/receipt`}
              className="text-sm text-ink underline underline-offset-4"
            >
              Download receipt {paidPayment.receipt.receiptNumber} (PDF)
            </a>
          ) : (
            <p className="text-sm text-muted">
              Available once payment is confirmed.
            </p>
          )}
        </section>

        {order.revisions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
              Your revision requests
            </h2>
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {order.revisions.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 p-5">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    {r.createdAt.toISOString().slice(0, 10)} · {r.status}
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {r.note}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {canRequestRevision && <RevisionRequest orderId={order.id} />}
      </div>
    </Container>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3">
      <dt className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="max-w-[60%] text-right text-sm text-ink">{value}</dd>
    </div>
  );
}
