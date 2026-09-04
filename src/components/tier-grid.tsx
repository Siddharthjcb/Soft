import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { TIERS } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { TILE_CTA } from "@/lib/cta";

/**
 * The modular grid — square, unequal, art-directed.
 *
 * Not four equal cards. A 12-column field where the primary offer takes
 * columns 1–7 across all three rows, filled and carrying the page's only
 * shadow, while the three commissioned tiers sit quietly at columns 9–12 and
 * deliberately do not top-align with it.
 *
 * Below md it collapses to the primary tile plus a three-row index, which
 * keeps the hierarchy intact without cramming a grid onto a phone.
 */
export function TierGrid() {
  const [, ...commissioned] = TIERS;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10">
      {/* primary — the free trial */}
      <div className="flex flex-col gap-4 border border-clay bg-clay-blush p-8 shadow-[0_2px_24px_rgba(33,25,21,0.08)] md:col-span-7 md:row-span-3 md:p-10">
        <span className="font-mono text-xs tracking-[0.1em] text-clay">
          01 — START HERE
        </span>
        <h3 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
          Make it yourself
        </h3>
        <p className="max-w-[36ch] text-base leading-relaxed text-muted">
          Choose a template, fill in your details, and publish. You get a real,
          hosted site you can send to anyone — today.
        </p>
        <p className="mt-2 font-mono text-2xl md:text-3xl">Free to start</p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-6">
          <ButtonLink href={TILE_CTA.href}>{TILE_CTA.labelLong}</ButtonLink>
          <span className="text-sm text-muted">{TILE_CTA.support}</span>
        </div>
      </div>

      {/* commissioned — quiet, secondary */}
      <p className="font-display text-xs uppercase tracking-[0.14em] text-muted md:col-span-4 md:col-start-9 md:row-start-1 md:-mt-8">
        Or we build it for you
      </p>

      {commissioned.map((tier, i) => (
        <Link
          key={tier.id}
          href="/pricing"
          className="group flex flex-col gap-2 border border-border bg-surface p-6 transition-colors hover:border-clay md:col-span-4 md:col-start-9"
          style={{ gridRow: i + 1 }}
        >
          <span className="font-mono text-xs text-muted">0{tier.id}</span>
          <span className="font-display text-2xl font-medium tracking-tight">
            {tier.short}
          </span>
          <span className="text-sm text-muted">{tier.tagline}</span>
          <span className="mt-1 flex items-center gap-2 font-mono text-sm">
            {tier.priceIsFrom ? "from " : ""}
            {formatINR(tier.pricePaise)}
            <span className="text-clay transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
