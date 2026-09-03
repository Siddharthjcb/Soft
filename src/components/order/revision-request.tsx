"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/client-error";

export function RevisionRequest({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (note.trim().length < 5) {
      setError("Please add a little more detail.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) {
        throw new Error(
          await apiErrorMessage(res, "Could not submit the request."),
        );
      }
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-ink">
        Revision request sent. We&rsquo;ll be in touch.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold tracking-tight">Request a revision</h2>
      <label
        htmlFor="revision-note"
        className="font-mono text-xs uppercase tracking-widest text-muted"
      >
        What would you like changed?
      </label>
      <textarea
        id="revision-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={5}
        maxLength={2000}
        className="w-full rounded-lg border border-border bg-transparent p-4 text-sm leading-relaxed text-ink outline-none focus:ring-2 focus:ring-ink"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Button onClick={() => void submit()} disabled={submitting}>
          {submitting ? "Sending…" : "Send request"}
        </Button>
      </div>
    </section>
  );
}
