"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { apiErrorMessage } from "@/lib/client-error";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
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
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  /**
   * Confirm straight from the Checkout callback so the customer is not left
   * waiting on webhook delivery. If this call fails the payment still went
   * through — the webhook settles it — so we fall back to a waiting state.
   */
  async function confirmPayment(response: RazorpayResponse) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      if (!res.ok) throw new Error("verification failed");
      router.replace(`/dashboard/orders/${orderId}`);
      router.refresh();
    } catch {
      setPendingConfirmation(true);
      setLoading(false);
    }
  }

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
        throw new Error(await apiErrorMessage(res, "Could not start payment."));
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
        handler: (response) => void confirmPayment(response),
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (pendingConfirmation) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base leading-relaxed text-ink">
          Payment received. We&rsquo;re still confirming it — your order moves
          to the queue automatically, usually within a minute.
        </p>
        <Button onClick={() => router.refresh()}>Check again</Button>
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
