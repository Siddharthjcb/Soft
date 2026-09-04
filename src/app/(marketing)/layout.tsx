import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StickyCta } from "@/components/sticky-cta";

/**
 * Everything public renders on the editorial surface. `data-surface` is what
 * swaps the whole token set to the terracotta system (globals.css) — the
 * dashboard and admin trees never carry it, so they stay monochrome.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-surface="editorial"
      className="grain relative flex min-h-screen flex-1 flex-col"
    >
      <SiteHeader />
      <div className="relative flex-1">{children}</div>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
