import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { TIERS } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/categories";
import { formatINR } from "@/lib/format";
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
        name: t.name,
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
      {/* Hero — one headline, one subhead, one CTA (DESIGN.md). */}
      <section className="py-24 sm:py-32">
        <Container className="flex flex-col items-start gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Websites &amp; systems for small businesses
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Order a website. Pay online. Track it to delivery.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            Choose a category and a tier, tell us what you need, and pay
            securely. You get an order you can follow from start to handover —
            no back-and-forth, no surprises.
          </p>
          <ButtonLink href="/order/new" className="mt-2">
            Start an order
          </ButtonLink>
        </Container>
      </section>

      {/* Tiers */}
      <section className="border-t border-border py-24">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Four tiers, one flat price each
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              Add rush delivery or extras at checkout. Full breakdown on the{" "}
              <Link href="/pricing" className="text-ink underline underline-offset-4">
                pricing page
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    {tier.name}
                  </span>
                  <span className="text-sm text-muted">{tier.tagline}</span>
                </div>
                <p className="font-mono text-2xl font-semibold tracking-tight">
                  {tier.priceIsFrom ? "from " : ""}
                  {formatINR(tier.pricePaise)}
                </p>
                <ul className="flex flex-1 flex-col gap-2 text-sm text-muted">
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <Link
                  href="/order/new"
                  className="text-sm font-medium text-ink underline underline-offset-4"
                >
                  Choose {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="border-t border-border py-24">
        <Container className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Categories
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Built for four kinds of work
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-8"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {category.audience}
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  {category.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {category.blurb}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
