"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-display";

export function AdminOrderControls({
  orderId,
  currentStatus,
  currentDeliveredUrl,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentDeliveredUrl: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [deliveredUrl, setDeliveredUrl] = useState(currentDeliveredUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaved(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deliveredUrl }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(d?.error ?? "Could not save.");
      }
      setSaved(
        status === currentStatus
          ? "Saved."
          : "Saved. Customer notified by email.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold tracking-tight">Update order</h2>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Status
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="h-11 rounded-lg border border-border bg-transparent px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {status === OrderStatus.delivered && (
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Delivered site URL
          </span>
          <input
            type="url"
            value={deliveredUrl}
            onChange={(e) => setDeliveredUrl(e.target.value)}
            placeholder="https://…"
            className="h-11 rounded-lg border border-border bg-transparent px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink"
          />
        </label>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">{saved}</p>}

      <div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save and notify customer"}
        </Button>
      </div>
    </section>
  );
}
