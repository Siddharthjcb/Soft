import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/container";
import { OrderForm } from "@/components/order/order-form";

export const metadata = { title: "Start an order" };

export default async function NewOrderPage() {
  const { userId } = await auth();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              New order
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us what you need
            </h1>
            <p className="text-base leading-relaxed text-muted">
              Five quick steps. You can sign in at the end — your choices are
              kept.
            </p>
          </div>
          <OrderForm isSignedIn={Boolean(userId)} />
        </div>
      </Container>
    </section>
  );
}
