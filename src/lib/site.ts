/**
 * Canonical site identity, used for metadata, sitemap, robots and JSON-LD.
 *
 * BLOCKED(B-13): the name, tagline and URL are placeholders. Swap in the real
 * brand and production domain before launch — every SEO surface reads
 * from here.
 */
export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Website Ordering Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    "Order a website or system for your business, pay online in ₹, and track it through to delivery. Built for small businesses and students in India.",
  areaServed: "IN",
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE.url).toString();
}
