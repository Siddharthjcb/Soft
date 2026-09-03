import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/container";
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

  return (
    <Container>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Payment
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Order created</h1>
        <p className="text-base leading-relaxed text-muted">
          Order <span className="font-mono text-ink">{order.id}</span> is saved
          with status{" "}
          <span className="font-mono text-ink">pending_payment</span>. Amount
          due: <span className="font-mono text-ink">{formatINR(order.priceTotal)}</span>.
        </p>
        <p className="text-sm text-muted">
          Razorpay checkout is wired up in task 3.2.
        </p>
      </div>
    </Container>
  );
}
