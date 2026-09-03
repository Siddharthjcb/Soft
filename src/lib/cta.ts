/**
 * Every call to action on the marketing surface reads from here.
 *
 * One action, three placements, escalating context — hero (curiosity), the
 * primary tile (comparison), the closing section (values). Same label and
 * target each time, so there is exactly one thing to do on the page.
 *
 * Kept as data so the funnel can be iterated without touching layout, which
 * was an explicit requirement of the direction.
 */

export const PRIMARY_CTA = {
  label: "Try it — free",
  /** with the arrow, for the larger placements */
  labelLong: "Try it — free →",
  href: "/order/new",
  /** the single reassurance line: what happens, how fast, what it costs */
  support: "Two minutes. No card. You'll have a live site to look at.",
} as const;

export const TILE_CTA = {
  ...PRIMARY_CTA,
  support: "No card. Cancel by ignoring it.",
} as const;

export const CLOSING_CTA = {
  ...PRIMARY_CTA,
  support: "We're just starting. Early sites get our full attention.",
} as const;

/** Shown on mobile after the hero scrolls away. Dismissible. */
export const STICKY_CTA = {
  label: "Make your site — free",
  href: PRIMARY_CTA.href,
} as const;

export const SECONDARY_CTA = {
  label: "or brief a custom build",
  href: "/pricing",
} as const;
