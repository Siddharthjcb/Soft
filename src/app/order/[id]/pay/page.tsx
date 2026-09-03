import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { PayButton } from "@/components/order/pay-button";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Payment" };

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id) notFound();

  const paid = order.status !== OrderStatus.pending_payment;

  return (
    <Container>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Payment
        </p>

        {paid ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">
              Payment complete
            </h1>
            <p className="text-base leading-relaxed text-muted">
              Order <span className="font-mono text-ink">{order.id}</span> is
              paid and in the queue.
            </p>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-ink underline underline-offset-4"
            >
              Go to dashboard
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight">
              Complete your order
            </h1>
            <p className="text-base leading-relaxed text-muted">
              Order <span className="font-mono text-ink">{order.id}</span>.
              Amount due{" "}
              <span className="font-mono text-ink">
                {formatINR(order.priceTotal)}
              </span>
              , paid securely via Razorpay — UPI, cards, or netbanking.
            </p>
            <PayButton orderId={order.id} amount={order.priceTotal} />
          </>
        )}
      </div>
    </Container>
  );
}
