import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SetType } from "@/components/motion/set-type";
import { DrawRule } from "@/components/motion/draw-rule";
import { LanguageCycle } from "@/components/language-cycle";
import {
  TIERS,
  DELIVERY_OPTIONS,
  ADDONS,
  HOSTING_MONTHLY_PAISE,
} from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { PRIMARY_CTA, CLOSING_CTA } from "@/lib/cta";

export const metadata = {
  title: "Pricing",
  description:
    "Start free with a template you publish yourself, or commission a build. Flat prices in ₹, delivery speed and extras added at checkout.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  // Tier 1 is the self-serve offer and is presented as free; the commissioned
  // tiers are the ones with a price. VIS-B4 tracks reconciling the underlying
  // pricing data with that.
  const [, ...commissioned] = TIERS;

  return (
    <>
      <section className="py-24">
        <Container className="flex flex-col items-start">
          <div className="mb-9 flex items-baseline gap-4">
            <LanguageCycle className="text-2xl text-clay" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted sm:text-xs">
              — pricing
            </span>
          </div>
          <SetType
            as="h1"
            className="max-w-[18ch] font-display text-5xl leading-[1.0] tracking-[-0.035em] sm:text-6xl"
          >
            Start free. Pay only if you want us to build it.
          </SetType>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted">
            Every amount is in ₹ (INR). Commissioned tiers are a one-time fee.
            Delivery speed and extras are added at checkout, and hosting is
            billed monthly after handover.
          </p>
        </Container>
      </section>

      {/* the free offer, leading */}
      <section className="pb-8">
        <Container>
          <DrawRule hard className="mb-14" />
          <div className="flex flex-col gap-4 border border-clay bg-clay-blush p-8 md:max-w-2xl md:p-10">
            <span className="font-mono text-xs tracking-[0.1em] text-clay">
              01 — START HERE
            </span>
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              Make it yourself
            </h2>
            <p className="max-w-[42ch] text-base leading-relaxed text-muted">
              Choose a template, add your details, publish. A real hosted site,
              live in minutes.
            </p>
            <p className="mt-1 font-mono text-3xl">Free to start</p>
            <div className="mt-4 flex flex-col items-start gap-3">
              <ButtonLink href={PRIMARY_CTA.href}>
                {PRIMARY_CTA.labelLong}
              </ButtonLink>
              <span className="text-sm text-muted">{PRIMARY_CTA.support}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* commissioned tiers */}
      <section className="py-16">
        <Container>
          <DrawRule className="mb-12" />
          <p className="mb-10 font-display text-xs uppercase tracking-[0.14em] text-muted">
            Or we build it for you
          </p>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {commissioned.map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col gap-3 border border-border bg-surface p-7"
              >
                <span className="font-mono text-xs text-muted">0{tier.id}</span>
                <h3 className="font-display text-2xl font-medium tracking-tight">
                  {tier.short}
                </h3>
                <p className="font-mono text-lg">
                  {tier.priceIsFrom ? "from " : ""}
                  {formatINR(tier.pricePaise)}
                </p>
                <ul className="mt-2 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted">
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* delivery + add-ons */}
      <section className="py-16">
        <Container>
          <DrawRule className="mb-12" />
          <div className="grid gap-14 md:grid-cols-2 md:gap-20">
            <div>
              <p className="mb-8 font-display text-xs uppercase tracking-[0.14em] text-muted">
                Delivery speed
              </p>
              <div className="flex flex-col">
                {DELIVERY_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-baseline justify-between gap-6 border-b border-border py-4"
                  >
                    <span className="text-base">{opt.name}</span>
                    <span className="font-mono text-sm">
                      {opt.surchargePaise === 0
                        ? "Included"
                        : `+ ${formatINR(opt.surchargePaise)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-8 font-display text-xs uppercase tracking-[0.14em] text-muted">
                Add-ons
              </p>
              <div className="flex flex-col">
                {ADDONS.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-baseline justify-between gap-6 border-b border-border py-4"
                  >
                    <span className="text-base">{addon.name}</span>
                    <span className="font-mono text-sm">
                      from {formatINR(addon.fromPaise)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-14 max-w-[54ch] text-base leading-relaxed text-muted">
            After handover, keeping a commissioned site online and maintained is{" "}
            <span className="font-mono text-ink">
              {formatINR(HOSTING_MONTHLY_PAISE)}
            </span>{" "}
            a month, billed manually for now.
          </p>
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
            Not sure which one? Start free and find out.
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
