"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

interface Subscription {
  id: string;
  monthlyFee: number;
  nextBillingDate: string; // ISO
  status: string;
}

export function HostingControls({
  orderId,
  subscription,
}: {
  orderId: string;
  subscription: Subscription | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createSub() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/hosting`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(d?.error ?? "Could not create the subscription.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function generateLink() {
    if (!subscription) return;
    setError(null);
    setGenerating(true);
    setLink(null);
    try {
      const res = await fetch(
        `/api/admin/hosting/${subscription.id}/payment-link`,
        { method: "POST" },
      );
      const d = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !d?.url) {
        throw new Error(d?.error ?? "Could not generate the link.");
      }
      setLink(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Hosting &amp; maintenance
      </h2>

      {!subscription ? (
        <>
          <p className="text-sm text-muted">No subscription yet.</p>
          <div>
            <Button onClick={() => void createSub()} disabled={creating}>
              {creating ? "Creating…" : "Create hosting subscription"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
            <HostingRow
              label="Monthly fee"
              value={formatINR(subscription.monthlyFee)}
            />
            <HostingRow
              label="Next billing"
              value={subscription.nextBillingDate.slice(0, 10)}
            />
            <HostingRow label="Status" value={subscription.status} />
          </dl>
          <div>
            <Button onClick={() => void generateLink()} disabled={generating}>
              {generating
                ? "Generating…"
                : "Generate payment link for this month"}
            </Button>
          </div>
          {link && (
            <p className="text-sm">
              <span className="text-muted">Send this to the customer: </span>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-ink underline underline-offset-4"
              >
                {link}
              </a>
            </p>
          )}
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </section>
  );
}

function HostingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-2.5">
      <dt className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
