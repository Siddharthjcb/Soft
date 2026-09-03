import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminOrderControls } from "@/components/admin/admin-order-controls";
import {
  categoryLabel,
  tierLabel,
  deliveryLabel,
  addonLabels,
} from "@/lib/order-display";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Order · Admin" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      assets: true,
      payments: { include: { receipt: true } },
    },
  });
  if (!order) notFound();

  const paid = order.payments.find((p) => p.status === PaymentStatus.success);

  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← Queue
        </Link>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-muted">{order.id}</span>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              {categoryLabel(order.category)}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-sm text-muted">
            {order.user.name ?? "—"} · {order.user.email}
            {order.user.phone ? ` · ${order.user.phone}` : ""}
          </span>
        </div>

        <dl className="flex flex-col divide-y divide-border rounded-xl border border-border">
          <AdminRow label="Tier" value={tierLabel(order.tier)} />
          <AdminRow label="Delivery" value={deliveryLabel(order.deliveryPlan)} />
          <AdminRow
            label="Add-ons"
            value={addonLabels(order.addons).join(", ") || "None"}
          />
          <AdminRow label="Total" value={formatINR(order.priceTotal)} />
          <AdminRow
            label="Payment"
            value={
              paid
                ? `Paid · ${paid.razorpayPaymentId ?? paid.razorpayOrderId}`
                : "Not paid"
            }
          />
          <AdminRow
            label="Placed"
            value={order.createdAt.toISOString().slice(0, 16).replace("T", " ")}
          />
          {order.deliveredUrl && (
            <AdminRow label="Delivered URL" value={order.deliveredUrl} />
          )}
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

        {order.revisionNote && (
          <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
              Revision requested
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {order.revisionNote}
            </p>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Files
          </h2>
          {order.assets.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
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

        <AdminOrderControls
          orderId={order.id}
          currentStatus={order.status}
          currentDeliveredUrl={order.deliveredUrl}
        />
      </div>
    </Container>
  );
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3">
      <dt className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="max-w-[60%] break-words text-right text-sm text-ink">
        {value}
      </dd>
    </div>
  );
}
