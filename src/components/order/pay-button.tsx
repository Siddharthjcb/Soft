"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: () => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function PayButton({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function pay() {
    setError(null);
    if (!scriptReady || !window.Razorpay) {
      setError("Payment library is still loading — try again in a moment.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(d?.error ?? "Could not start payment.");
      }
      const data = (await res.json()) as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId?: string;
      };
      if (!data.keyId) throw new Error("Payment key is not configured.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Website Ordering Platform",
        description: `Order ${orderId}`,
        theme: { color: "#0a0a0a" },
        handler: () => setDone(true),
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base leading-relaxed text-ink">
          Payment received. We&rsquo;re confirming it now — your order moves to
          the queue automatically once confirmed.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <Button onClick={() => void pay()} disabled={loading}>
        {loading ? "Opening payment…" : `Pay ${formatINR(amount)}`}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
