import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import {
  TIERS,
  DELIVERY_OPTIONS,
  ADDONS,
  HOSTING_MONTHLY_PAISE,
} from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export const metadata = {
  title: "Pricing",
  description:
    "Flat tier pricing in \u20B9 for websites and systems: pick a template, add customization or advanced features, or commission a fully custom build. Rush delivery and hosting available.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <section className="py-24">
        <Container className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Pricing
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Flat tier prices, clear add-ons
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            Every amount is in ₹ (INR). Tier price is a one-time fee. Delivery
            speed and extras are added at checkout. Hosting is billed monthly
            after handover.
          </p>
        </Container>
      </section>

      {/* Tiers */}
      <section className="border-t border-border py-20">
        <Container className="grid gap-4 lg:grid-cols-4">
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
              <ul className="flex flex-1 flex-col gap-2 border-t border-border pt-4 text-sm text-muted">
                {tier.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>

      {/* Delivery speed */}
      <section className="border-t border-border py-20">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Delivery speed
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Choose how fast you need it
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className="flex items-baseline justify-between gap-4 rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base text-ink">{opt.name}</span>
                  <span className="text-sm text-muted">{opt.note}</span>
                </div>
                <span className="font-mono text-sm text-ink">
                  {opt.surchargePaise === 0
                    ? "Included"
                    : `+ ${formatINR(opt.surchargePaise)}`}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Add-ons */}
      <section className="border-t border-border py-20">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Add-ons
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">Optional extras</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADDONS.map((addon) => (
              <div
                key={addon.id}
                className="flex items-baseline justify-between gap-4 rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base text-ink">{addon.name}</span>
                  <span className="text-sm text-muted">{addon.note}</span>
                </div>
                <span className="font-mono text-sm text-ink">
                  {`from ${formatINR(addon.fromPaise)}`}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Hosting */}
      <section className="border-t border-border py-20">
        <Container className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Hosting &amp; maintenance
          </p>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            After handover, keeping the site online and maintained is{" "}
            <span className="font-mono text-ink">
              {formatINR(HOSTING_MONTHLY_PAISE)}
            </span>{" "}
            per month, billed manually each month for now.
          </p>
        </Container>
      </section>

      <section className="border-t border-border py-20">
        <Container className="flex flex-col items-start gap-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to start?
          </h2>
          <ButtonLink href="/order/new">Start an order</ButtonLink>
          <p className="text-sm text-muted">
            Prices shown are indicative and confirmed on your order summary
            before payment.
          </p>
        </Container>
      </section>
    </>
  );
}
