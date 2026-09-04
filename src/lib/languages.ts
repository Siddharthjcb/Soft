/**
 * The language cycle — the editorial surface's signature.
 *
 * A short phrase rotates through twelve Indian scripts in exactly three places
 * (hero eyebrow, closing line, footer). Never the headline: legibility, layout
 * stability, and it would compete with meaning.
 *
 * Ordered so the scripts alternate barred → round → angular rather than
 * grouping by region, which gives the cycle visual rhythm.
 *
 * VIS-B1: every translation below is DRAFTED and still needs native-speaker
 * review before this ships. Do not treat these as verified.
 */

export interface LanguageEntry {
  id: string;
  /** English name, for aria-label and the config UI later */
  label: string;
  /** CSS variable holding the face for this script (see src/lib/fonts.ts) */
  fontVar: string;
  /** BCP-47 language subtags that should pin to this entry */
  locales: string[];
  /** the hero eyebrow phrase — "welcome" */
  welcome: string;
  /** the closing phrase — "let's begin" */
  begin: string;
  /** scripts that need a little more line-height at display sizes */
  tall?: boolean;
}

export const LANGUAGES: LanguageEntry[] = [
  {
    id: "hi",
    label: "Hindi",
    fontVar: "--font-devanagari",
    locales: ["hi"],
    welcome: "स्वागत है",
    begin: "शुरू करें",
  },
  {
    id: "bn",
    label: "Bengali",
    fontVar: "--font-bangla",
    locales: ["bn"],
    welcome: "স্বাগতম",
    begin: "শুরু করা যাক",
  },
  {
    id: "ta",
    label: "Tamil",
    fontVar: "--font-tamil",
    locales: ["ta"],
    welcome: "நல்வரவு",
    begin: "தொடங்குவோம்",
  },
  {
    id: "te",
    label: "Telugu",
    fontVar: "--font-telugu",
    locales: ["te"],
    welcome: "స్వాగతం",
    begin: "మొదలుపెడదాం",
  },
  {
    id: "ml",
    label: "Malayalam",
    fontVar: "--font-malayalam",
    locales: ["ml"],
    welcome: "സ്വാഗതം",
    begin: "തുടങ്ങാം",
    tall: true,
  },
  {
    id: "kn",
    label: "Kannada",
    fontVar: "--font-kannada",
    locales: ["kn"],
    welcome: "ಸ್ವಾಗತ",
    begin: "ಪ್ರಾರಂಭಿಸೋಣ",
    tall: true,
  },
  {
    id: "gu",
    label: "Gujarati",
    fontVar: "--font-gujarati",
    locales: ["gu"],
    welcome: "સ્વાગત છે",
    begin: "શરૂ કરીએ",
  },
  {
    id: "pa",
    label: "Punjabi",
    fontVar: "--font-gurmukhi",
    locales: ["pa"],
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    begin: "ਸ਼ੁਰੂ ਕਰੀਏ",
  },
  {
    id: "or",
    label: "Odia",
    fontVar: "--font-odia",
    locales: ["or"],
    welcome: "ସ୍ୱାଗତ",
    begin: "ଆରମ୍ଭ କରିବା",
    tall: true,
  },
  {
    id: "mr",
    label: "Marathi",
    fontVar: "--font-devanagari",
    locales: ["mr"],
    welcome: "स्वागत आहे",
    begin: "सुरू करूया",
  },
  {
    id: "as",
    label: "Assamese",
    fontVar: "--font-bangla",
    locales: ["as"],
    welcome: "আদৰণি",
    begin: "আৰম্ভ কৰোঁ",
  },
  {
    id: "ur",
    label: "Urdu",
    fontVar: "--font-urdu",
    locales: ["ur"],
    welcome: "خوش آمدید",
    begin: "شروع کریں",
    tall: true,
  },
];

export type PhraseKey = "welcome" | "begin";

/** Index of the next entry in the loop. */
export function nextIndex(current: number, total = LANGUAGES.length): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/** Where an instance starts, so two on one page never change together. */
export function startIndex(offset: number, total = LANGUAGES.length): number {
  if (total <= 0) return 0;
  return ((offset % total) + total) % total;
}

/**
 * The single script to show when the cycle is suppressed (reduced motion or
 * save-data): the viewer's own if we serve it, otherwise Devanagari.
 */
export function preferredIndex(locales: readonly string[]): number {
  for (const locale of locales) {
    const tag = locale.toLowerCase().split("-")[0];
    const found = LANGUAGES.findIndex((l) => l.locales.includes(tag));
    if (found !== -1) return found;
  }
  return 0;
}
