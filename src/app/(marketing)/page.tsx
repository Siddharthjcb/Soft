import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { LanguageCycle } from "@/components/language-cycle";
import { TrustMark } from "@/components/trust-mark";
import { TierGrid } from "@/components/tier-grid";
import { SetType } from "@/components/motion/set-type";
import { DrawRule } from "@/components/motion/draw-rule";
import { TIERS } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/categories";
import { PRIMARY_CTA, CLOSING_CTA, SECONDARY_CTA } from "@/lib/cta";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  description: SITE.description,
  alternates: { canonical: "/" },
};

// BLOCKED(B-13): brand name and domain are placeholders — see src/lib/site.ts.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      areaServed: SITE.areaServed,
    },
    {
      "@type": "Service",
      "@id": absoluteUrl("/#service"),
      name: "Website and system development",
      serviceType: "Web development",
      provider: { "@id": absoluteUrl("/#organization") },
      areaServed: SITE.areaServed,
      offers: TIERS.map((t) => ({
        "@type": "Offer",
        name: t.short,
        description: t.tagline,
        price: (t.pricePaise / 100).toFixed(2),
        priceCurrency: "INR",
        url: absoluteUrl("/pricing"),
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <section className="py-24 sm:py-28">
        <Container className="flex flex-col items-start">
          <div className="mb-9 flex items-baseline gap-4">
            <LanguageCycle
              phrase="welcome"
              className="text-2xl text-clay sm:text-[26px]"
            />
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted sm:text-xs">
              — websites for small business in india
            </span>
          </div>

          <SetType
            as="h1"
            className="max-w-[15ch] font-display text-5xl leading-[0.99] tracking-[-0.035em] sm:text-7xl lg:text-[88px]"
          >
            A website for the business you{" "}
            <span className="text-clay">actually</span> run.
          </SetType>

          <p className="mt-9 max-w-[50ch] text-lg leading-relaxed text-muted sm:text-xl">
            Pick a template, add your details, publish. A real site, live in
            minutes — free to start, no card, no call.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink href={PRIMARY_CTA.href} className="h-14 px-8 text-base">
              {PRIMARY_CTA.labelLong}
            </ButtonLink>
            <span className="text-[15px] text-muted">{PRIMARY_CTA.support}</span>
          </div>

          {/* the Mark, inline on mobile — the desktop fixture is in the footer */}
          <div className="mt-12 w-full max-w-md md:hidden">
            <TrustMark inline />
          </div>
        </Container>
      </section>

      {/* the modular grid */}
      <section className="py-20 sm:py-24">
        <Container>
          <DrawRule hard className="mb-16" />
          <TierGrid />
        </Container>
      </section>

      {/* categories */}
      <section className="py-20 sm:py-24">
        <Container>
          <DrawRule hard className="mb-16" />
          <p className="mb-10 font-display text-xs uppercase tracking-[0.14em] text-muted">
            Built for
          </p>
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-20">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="flex flex-col gap-2">
                <SetType
                  as="h2"
                  from={440}
                  to={500}
                  className="font-display text-3xl tracking-tight"
                >
                  {category.name}
                </SetType>
                <p className="text-base leading-relaxed text-muted">
                  {category.blurb}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* closing */}
      <section className="py-24 sm:py-28">
        <Container>
          <DrawRule hard className="mb-16" />
          <SetType
            as="p"
            from={440}
            to={500}
            className="max-w-[22ch] font-display text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl"
          >
            Every small business in India deserves a website it is proud of.
          </SetType>

          <LanguageCycle
            phrase="begin"
            offset={6}
            className="mt-8 text-3xl text-clay sm:text-[38px]"
          />

          <div className="mt-11 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink href={CLOSING_CTA.href} className="h-14 px-8 text-base">
              {CLOSING_CTA.labelLong}
            </ButtonLink>
            <span className="text-[15px] text-muted">{CLOSING_CTA.support}</span>
          </div>

          <a
            href={SECONDARY_CTA.href}
            className="mt-6 inline-block border-b border-border pb-0.5 text-[15px] text-muted transition-colors hover:text-ink"
          >
            {SECONDARY_CTA.label}
          </a>
        </Container>
      </section>

      {/* the Mark — desktop fixture */}
      <TrustMark />
    </>
  );
}
