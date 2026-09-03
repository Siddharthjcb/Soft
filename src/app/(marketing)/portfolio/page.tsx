import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SetType } from "@/components/motion/set-type";
import { DrawRule } from "@/components/motion/draw-rule";
import { LanguageCycle } from "@/components/language-cycle";
import { CATEGORIES } from "@/lib/categories";
import { CLOSING_CTA } from "@/lib/cta";

export const metadata = {
  title: "Work",
  description:
    "Recent websites and systems built for cloud kitchens, local vendors and students across India.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <section className="py-24">
        <Container className="flex flex-col items-start">
          <div className="mb-9 flex items-baseline gap-4">
            <LanguageCycle offset={2} className="text-2xl text-clay" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted sm:text-xs">
              — work
            </span>
          </div>
          <SetType
            as="h1"
            className="max-w-[16ch] font-display text-5xl leading-[1.0] tracking-[-0.035em] sm:text-6xl"
          >
            Recent projects
          </SetType>
          <p className="mt-8 max-w-[50ch] text-lg leading-relaxed text-muted">
            We&rsquo;re still gathering permission to show finished work here.
            In the meantime, this is the kind of project we take on.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <DrawRule hard className="mb-14" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex aspect-[4/3] flex-col justify-between border border-dashed border-border bg-surface p-7"
              >
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {category.name}
                </span>
                <span className="text-sm text-muted">Sample coming soon</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <DrawRule hard className="mb-14" />
          <SetType
            as="p"
            from={440}
            to={500}
            className="max-w-[20ch] font-display text-4xl leading-[1.08] tracking-[-0.03em]"
          >
            Want something like this?
          </SetType>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink href={CLOSING_CTA.href} className="h-14 px-8 text-base">
              {CLOSING_CTA.labelLong}
            </ButtonLink>
            <span className="text-[15px] text-muted">{CLOSING_CTA.support}</span>
          </div>
        </Container>
      </section>
    </>
  );
}
