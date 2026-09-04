/**
 * "The Mark" — the trust fixture.
 *
 * A fixture, never an interruption: same position every time, fades in once,
 * never pulses, changes only when the viewer touches it or silently on the
 * next render. The humour is dry; the point is that a human is behind this.
 *
 * Everything here is data. Copy and trigger thresholds are meant to be edited
 * freely without touching the component.
 */

export type TrustContext =
  | "arrive"
  | "browsing"
  | "near-cta"
  | "signing-up"
  | "returning";

/**
 * One line is chosen per context and held for that visit — it does not shuffle
 * while you read, which would be exactly the twitchiness we are avoiding.
 */
export const TRUST_LINES: Record<TrustContext, string[]> = {
  arrive: [
    "You're allowed to be skeptical.",
    "New site. No hype. Have a look.",
  ],
  browsing: [
    "Still here? Take your time.",
    "Nothing is going to pop up and chase you.",
  ],
  "near-cta": [
    "No fake countdown. No imaginary 47,382 users.",
    "Try it or don't. There's no funnel.",
  ],
  "signing-up": ["Okay — you're in. Let's make it useful."],
  returning: ["Welcome back. Still no dark patterns."],
};

/** When the context flips. Tweak freely; the hook reads these. */
export const TRUST_THRESHOLDS = {
  /** ms before the Mark fades in — long enough not to compete with the hero */
  appearAfterMs: 2000,
  /** scroll fraction past which we consider the visitor to be browsing */
  browsingAtScroll: 0.15,
  /** ms on page that also counts as browsing */
  browsingAfterMs: 15000,
};

/**
 * VIS-B2 — placeholder. Needs the operator's real name and the real list
 * before this ships; the whole feature is hollow without it.
 */
export const TRANSPARENCY = {
  heading: "Who's actually behind this",
  body: "One person, in Coimbatore. [REAL NAME] builds these. If something breaks you're emailing them, not a ticket queue.",
  promisesHeading: "Things we will never do",
  promises: [
    "Fake countdowns or invented user counts.",
    "Sell or share what you put in your site.",
    "Make cancelling harder than starting.",
    "Email you things you didn't ask for.",
  ],
  linkLabel: "Read the full transparency page",
  href: "/transparency",
};

/** Deterministic pick so the line is stable for a given context and visit. */
export function lineFor(context: TrustContext, seed = 0): string {
  const pool = TRUST_LINES[context];
  if (!pool || pool.length === 0) return "";
  return pool[Math.abs(seed) % pool.length];
}
