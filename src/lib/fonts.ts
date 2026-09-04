import {
  Bricolage_Grotesque,
  Anek_Latin,
  Anek_Devanagari,
  Anek_Bangla,
  Anek_Tamil,
  Anek_Telugu,
  Anek_Kannada,
  Anek_Malayalam,
  Anek_Gujarati,
  Anek_Gurmukhi,
  Anek_Odia,
  Noto_Nastaliq_Urdu,
} from "next/font/google";

/**
 * Marketing-surface typefaces. All variable, all self-hosted by next/font, so
 * there is no third-party request and no layout shift.
 *
 * They are exposed as CSS variables on <html> but only *consumed* inside
 * [data-surface="editorial"] (see globals.css). Dashboard and admin keep the
 * system stack.
 *
 * Every options object below is written out in full: next/font parses these
 * calls statically at build time and rejects a spread.
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

/*
 * Indic faces for the language cycle. Anek is one superfamily across nine
 * scripts so they share a design; Urdu needs Nastaliq, which does not.
 *
 * `preload: false` on every one of these is deliberate and load-bearing: the
 * cycle is decorative and must never block first paint. Browsers fetch each
 * file only when a glyph in that script is first painted.
 */

export const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
  variable: "--font-devanagari",
});

export const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  display: "swap",
  preload: false,
  variable: "--font-bangla",
});

export const anekTamil = Anek_Tamil({
  subsets: ["tamil"],
  display: "swap",
  preload: false,
  variable: "--font-tamil",
});

export const anekTelugu = Anek_Telugu({
  subsets: ["telugu"],
  display: "swap",
  preload: false,
  variable: "--font-telugu",
});

export const anekKannada = Anek_Kannada({
  subsets: ["kannada"],
  display: "swap",
  preload: false,
  variable: "--font-kannada",
});

export const anekMalayalam = Anek_Malayalam({
  subsets: ["malayalam"],
  display: "swap",
  preload: false,
  variable: "--font-malayalam",
});

export const anekGujarati = Anek_Gujarati({
  subsets: ["gujarati"],
  display: "swap",
  preload: false,
  variable: "--font-gujarati",
});

export const anekGurmukhi = Anek_Gurmukhi({
  subsets: ["gurmukhi"],
  display: "swap",
  preload: false,
  variable: "--font-gurmukhi",
});

export const anekOdia = Anek_Odia({
  subsets: ["oriya"],
  display: "swap",
  preload: false,
  variable: "--font-odia",
});

export const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-urdu",
});

/** Every font variable, for the <html> element. */
export const fontVariables = [
  bricolage.variable,
  anekLatin.variable,
  anekDevanagari.variable,
  anekBangla.variable,
  anekTamil.variable,
  anekTelugu.variable,
  anekKannada.variable,
  anekMalayalam.variable,
  anekGujarati.variable,
  anekGurmukhi.variable,
  anekOdia.variable,
  notoNastaliqUrdu.variable,
].join(" ");
