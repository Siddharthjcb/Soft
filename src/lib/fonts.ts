import { Bricolage_Grotesque, Anek_Latin } from "next/font/google";

/**
 * Marketing-surface typefaces. Both are variable and self-hosted by next/font,
 * so there is no render-blocking request to a third party and no layout shift.
 *
 * They are exposed as CSS variables on <html> but only *consumed* inside
 * [data-surface="editorial"] (see globals.css). Dashboard and admin keep the
 * system stack.
 */

/** Display face — headlines, tier names, the wordmark. */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

/** Body face — everything else on the marketing surface. */
export const anekLatin = Anek_Latin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anek",
});

/** Convenience: both variable classes, for the <html> element. */
export const fontVariables = `${bricolage.variable} ${anekLatin.variable}`;
