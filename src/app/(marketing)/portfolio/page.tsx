import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";

export const metadata = { title: "Work" };

export default function PortfolioPage() {
  return (
    <>
      <section className="py-24">
        <Container className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Work
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Recent projects
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            We&rsquo;re gathering permission to show finished work here. In the
            meantime, here is the kind of project we take on.
          </p>
        </Container>
      </section>

      <section className="border-t border-border py-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex aspect-[4/3] flex-col justify-between rounded-xl border border-dashed border-border bg-surface p-6"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {category.name}
                </span>
                <span className="text-sm text-muted">Sample coming soon</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20">
        <Container className="flex flex-col items-start gap-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Want something like this?
          </h2>
          <ButtonLink href="/order/new">Start an order</ButtonLink>
        </Container>
      </section>
    </>
  );
}
