# Design Direction — "The Broadsheet, in terracotta"

**Status:** PROPOSAL — awaiting sign-off on §11 forks before the mock is updated
**Supersedes:** the monochrome `DESIGN.md` for all **public / marketing** surfaces.
Dashboard and admin stay monochrome-functional (they are tools, not the pitch).
**Ref:** `VIS`

The product should read, in the first few seconds, as **premium · human ·
Indian · modern · playful · trustworthy** — and never as **corporate ·
generic · AI-generated · overdesigned · gimmicky**. Every decision below is
measured against that.

---

## 1 · Terracotta as a complete colour system

Terracotta is the identity, not an accent. The whole palette is built from
fired-earth tones — clay, kiln, laterite soil, Chettinad tile, Bengali
terracotta temple. Warm throughout; nothing is pure white or pure black.

```
--clay          #B4552D   identity. primary CTA, the cycling word, one headline word, links, TrustMark
--clay-fired    #8F3F1F   hover / pressed / dark-mode ink of the CTA
--clay-blush    #F3E4DA   fill of the ONE highlighted tile; rare section wash
--paper         #F6F0E8   page surface (the broadsheet column)
--paper-edge    #EFE7DB   the ground outside the column
--paper-raised  #FBF7F1   a tile that sits above the page
--ink           #211915   text — a burnt-umber black, never #000
--muted         #6E5F53   secondary text
--line          #D9CDBD   hairline
--rule          #211915   hard section break
--clay-shadow   rgba(33,25,21,0.08)   used exactly once, on the primary tile
```

Dark mode ("kiln at night"): `--paper #191410`, `--ink #F0E7DB`,
`--line #332A22`, and `--clay` lifts to `#D9805A` so it glows rather than muddies.

**Discipline:** terracotta appears at most ~3 places per viewport. The rest is
paper + ink + muted + hairline. The restraint is the premium. Terracotta
everywhere = startup-orange soup.

**No red for errors.** Danger sits too close to terracotta. The marketing site
has almost no destructive state; form errors use ink + an underline + a small
mark, not colour. (Dashboard keeps its own semantic palette.)

**Texture:** the existing ~2KB SVG paper grain at ~5% opacity. Nothing else —
no decorative tile motifs (kitsch risk).

---

## 2 · Where the Indian-language transition appears

Not sprinkled. Three placements, ranked:

1. **Primary — the hero eyebrow.** A short brand phrase above the headline
   cycles through Indian scripts, one every ~4s. First thing seen; sets the
   tone instantly. This is *the* signature.
2. **Secondary — the closing statement**, beside the final CTA. A short
   "let's begin" phrase in a rotating script — an emotional beat right at the
   conversion moment. Offset from the eyebrow so two things aren't cycling in
   sync on screen.
3. **Tertiary — the footer line.** Always on, very slow (~8s), quiet.

The headline itself stays English (legibility, layout stability, meaning).
Everywhere else the script is decorative-but-real, never a selector.

**Phrase:** a single warm, universally-translatable word/short phrase. Leading
candidate: **"welcome"** (हार्दिक स्वागत / a warm, hospitable opening — very
Indian, *atithi devo bhava*). Alternatives: "made with care", "your work,
online". Accurate native translations sourced and **reviewed by native
speakers before ship** — never invented. `VIS-B1` logs this.

**Transition:** crossfade + 6px vertical rise, 500ms ease-out, ~4s hold. One
at a time. Not a ticker. Pauses on tab-hidden and on `prefers-reduced-motion`
(freezes on one — ideally the viewer's regional script via `navigator.language`).

---

## 3 · Which scripts cycle, and font strategy

Twelve, ordered for visual rhythm — alternating barred / angular / round so
the cycle feels rich:

Devanagari (Hindi) → Bengali → Tamil → Telugu → Malayalam → Kannada →
Gujarati → Gurmukhi (Punjabi) → Odia → Assamese (Bengali script) →
Marathi (Devanagari) → Urdu (Nastaliq) → loop.

- **Anek** (free, variable superfamily) covers 10 of these in one consistent
  design: Latin, Devanagari, Bangla, Tamil, Telugu, Kannada, Malayalam,
  Gujarati, Gurmukhi, Odia. Assamese uses Bengali script (covered). Marathi
  uses Devanagari (covered).
- **Urdu** needs **Noto Nastaliq Urdu** (a separate face) — worth it; Nastaliq
  is the calligraphic peak of the set.
- **Weight:** each face is **subset to only the glyphs in the phrase** (~3–8KB
  each). English paints first; Indic subsets stream in progressively and swap
  as they arrive. On `save-data`: load only Devanagari + the regional script,
  cycle just those.

---

## 4 · The tile system — square, kept, elevated

Keep the square geometry (it becomes identity — **not everything gets
rounded**). Kill the "pricing component" feel. It becomes an **art-directed
modular grid on a 12-column field**:

- **Unequal tiles.** The primary offer (free trial) is a large tile —
  spans ~7 of 12 columns, taller, its own breathing room, slightly offset. It
  holds the primary CTA and is the **one filled tile** (`--clay-blush`, or
  ink-inverted) with the **one** `--clay-shadow`.
- The **3 commissioned tiers** are small, tight, secondary — ~4 columns each,
  shorter, hairline-bordered squares on `--paper`, no fill, no shadow. They
  are visibly "the other way to work with us".
- **Big gutters** — 32–48px, not 16. Negative space is the material.
- **Asymmetry:** tiles do not all top-align. The large tile extends above and
  below the row of small ones — a "torn from a layout" feel.
- **Typography inside** is editorial: a large index numeral (cycling script or
  mono), tier name in the display face, price in mono, one line in Anek. Never
  "PLAN / ₹X / ✓✓✓✓ / BUTTON".
- **Grid marks** (borrowed from the "Workshop" idea): faint column numbers or
  dimension ticks in the gutters — "this is a designed grid".
- **Motion:** border draws on scroll-in with a 20ms stagger; on hover the
  border thickens to 2px `--clay` and the → advances 4px; the filled tile
  lifts 2px.
- **Mobile:** collapses to **one big tile + a 3-row index** — clean, keeps the
  hierarchy.

---

## 5 · The primary conversion moment — free trial

Goal: *"This looks interesting, I'll try it"* — not *"this site is selling
hard."* Building the initial user base matters more than pushing paid now.

- **One action, three placements, escalating context:**
  1. **Hero CTA** — terracotta fill, the one loud element. Copy warm and
     low-commitment: *"Try it — free"* / *"Make one now"* (not "Sign up free").
     One quiet line under it does all the reassurance in a breath:
     *"Two minutes. No card. You'll have a live site to look at."*
  2. **The primary tile** in the grid repeats the exact same CTA + line.
  3. **The closing section** frames it with the honest early-days angle:
     *"We're just starting. Early sites get our full attention."*
- **What we never do:** countdowns, "X people signed up today", fake social
  proof, exit-intent popups. A *tasteful* dismissible one-line sticky CTA on
  mobile after the hero is allowed (not scammy — genuine UX).
- **Flexibility:** CTA label, target, and supporting line live in one config
  (`src/lib/cta.ts`). The funnel copy iterates without touching layout.

---

## 6 · The trust / anti-scam feature — where it lives

**Core principle: a fixture, not an interruption.** Always in the same spot
(discoverable, ownable, never a jump-scare), small, it *responds* rather than
*demands*, voice is dry not shouty. Three candidate forms — §11 Fork B:

**A · The Margin Note.** A proofreader's mark + a short line, anchored
bottom-left desktop, in the editorial world's own visual language. Text
changes by context. Click → an inline **transparency panel** unfolds like a
footnote (no dimming modal). Quietest; most "of the world".

**B · The Stamp.** A terracotta rubber-stamp / seal (culturally legible —
every Indian shop receipt has one), pressed into the paper, bottom-right.
Text on it cycles: "NOT A ROBOT", "NO FAKE COUNTDOWNS". Hover → it re-stamps
(tiny ink-press). Strong, ownable object; risk of reading as a badge if not
executed with restraint (monochrome ink, terracotta only on press, imperfect
letterpress edge, never animates unprompted).

**C · The Colophon.** A book's "how this was made / by whom" note. A minimal
chip fades in bottom-left ~2s after load, states one line, then *stays* — no
pulse, no re-trigger. Click → full colophon: real names/roles, the promises,
a transparency-page link. Most restrained; risk of being *too* quiet to land
the personality.

**Recommendation — "The Mark" (A + B hybrid):** a small fixture in the
proofreader's-mark / editorial-stamp language, bottom-left on desktop,
**always present**, carrying one dry line that changes by context. Interaction
→ a quick press/flip (250ms) to the next line; click → inline transparency
panel (who we are, what we will never do, link out). Fades in **once**, ~2s
after load; never pulses or re-appears; state changes swap text silently.
Mobile: **not floating** — an inline line just after the hero, plus a tappable
footer entry.

---

## 7 · Making the trust feature delightful, not annoying

- It moves/changes **only on your interaction** or **silently on the next
  natural render** — never an unprompted animation.
- It fades in **exactly once**. No pulse, no bounce, no "hey look at me".
- Same position every time → it becomes furniture you *notice*, like a
  well-placed footnote, not a popup you *dodge*.
- Dry, self-aware voice — admits smallness, never over-claims.
- `prefers-reduced-motion` → no flip; text swaps; panel opens instantly.
- Mobile → in the flow, not floating. Zero overlay.
- One and only one of these on the page. Ever.

**State model** (config-driven, `src/lib/trust-mark.ts`):

```
context: "arrive" | "browsing" | "near-cta" | "signing-up" | "returning"
```

Each maps to a pool of lines (config, editable freely). Triggers: scroll
depth, time-on-page, section-in-view, `localStorage` for "returning". Line
values may later be `(signals) => string` so real data (onboarding %,
community count, transparency stats) can feed in without a redesign. The
transparency-panel content (`people`, `promises`, `href`) is also config.

---

## 8 · Motion language — "ink settling + letterpress"

Everything feels like type being set and ink pressed, not UI sliding.

- **Type sets on scroll-in:** display headings fade up 8px while
  `font-variation-settings` weight settles ~480 → ~600 over 500ms. (The
  variable-weight signature.)
- **Hairlines draw:** section rules animate width 0 → 100% on enter, ~600ms.
- **Language cycle:** crossfade + 6px rise, 500ms, 4s hold — the one "alive"
  element, distinct from all the settling.
- **Tiles:** border-draw on enter (20ms stagger); hover thickens border +
  advances →; filled tile lifts 2px.
- **CTA:** hover deepens to `--clay-fired` + `translateY(1px)` — a stamp
  press. Click → a CSS radial ink-ripple from the pointer.
- **Cursor (desktop, optional):** near a link, its 2px terracotta underline
  extends to meet the cursor. Not a blob. Off on touch / reduced-motion.
- **Load:** wordmark weight-settles → eyebrow cycles in → headline sets. ~400ms
  choreography, once. Not a loader.
- **Reduced-motion:** all of the above → instant / none. Cycle freezes on one.
  Nothing essential lost.
- **Budget:** CSS + `font-variation-settings` + GSAP ScrollTrigger only. No
  WebGL. Hero-interactive JS < 30KB beyond the framework.

---

## 9 · Unmistakably human

- **Real names** in the colophon / transparency panel — "Built by [name], in
  Coimbatore." A signature scan, even.
- **The voice** everywhere: dry, first-person-plural, admits limits — "We're
  small. That's kind of the point."
- **No stock anything** — no hero illustration, no team photos, no
  off-the-shelf icon set. Hand-draw a tiny icon set or use none.
- **Honest numbers or none.** A count appears only when it is real.
- **Hand-set imperfection:** the grain, a very slightly irregular hairline,
  the stamp's rough edge. Nothing sterile.
- **Copy addresses the actual reader** — "you run a shop, you don't have time
  for this" — never "empower your business journey".
- Later: a visible "shipped this week" note — live humans.

---

## 10 · Mobile without clutter

- Language cycle: **eyebrow only**, slower (5s).
- TrustMark: **inline after hero + footer entry**, never floating.
- Pricing: **one big tile + 3 index rows**.
- Optional single-line dismissible sticky CTA after the hero (safe-area aware).
- Display type stays bold (h1 ~44–52px) tuned to never overflow 360px;
  tracking loosens slightly.
- Motion: scroll-sets kept (cheap); cursor off; cycle slower; TrustMark flip
  off (text swap only).
- Fonts: English first paint always; Indic subsets stream; on `save-data`,
  only Devanagari + the regional script.
- Primary CTA always inside the thumb zone (hero high, sticky low).

---

## 11 · Forks — resolve before the mock is updated

**Fork A — Does the home page fully reorient around the free trial?**
Proposed: yes. The hero + primary tile + closing all drive one action (start a
trial site). The 4 commissioned tiers demote to "…or, if you'd rather we build
it." Confirm, or keep the 4 tiers co-equal with the trial.

**Fork B — Trust feature form:** "The Mark" (A+B hybrid, recommended) · pure
Margin Note (A) · pure Stamp (B) · Colophon (C).

**Fork C — Language cycle transition:** crossfade + rise (recommended,
restrained) · a typographic "retype" (letters resolve) · a horizontal slide ·
a soft blur-morph. Pick the feel.

**Fork D — The cycling phrase:** "welcome" (recommended) · "made with care" ·
"your work, online" · something else.

**Fork E — Free vs trial, finally.** Earlier we said 14-day trial + soft
badge; then "free for students / distribution". This section assumes
**free-to-start trial** as the CTA. Confirm that's the model, or say "free,
full stop" — it changes the supporting copy, not the layout.

---

## 12 · What changes in code (when it's built)

- New `DESIGN.md` from this doc; `globals.css` tokens rebuilt on the terracotta
  system; two variable fonts self-hosted + subset.
- New components: `<LanguageCycle>`, `<TrustMark>` + `useTrustContext()`,
  `<TierGrid>` (the modular grid), `<TrialCTA>`.
- New config: `src/lib/cta.ts`, `src/lib/trust-mark.ts`,
  `src/lib/languages.ts` (script → font → translated phrase).
- `gsap` added. `framer-motion` stays.
- Rework: `/`, `/pricing`, `/portfolio`, header, footer, button primitive.
- Rough estimate unchanged: ~3 build sessions for the full public surface;
  ~1 for the home page alone as a coded prototype.

## 13 · Blockers logged

- **VIS-B1** — native-speaker review of the 12 translated phrases before ship.
- **VIS-B2** — real people/promises copy for the transparency panel + a
  transparency page (`/transparency` or `/colophon`) — needs the operator's
  real name(s) and the actual list of "things we will never do".
- **VIS-B3** — the free-vs-trial model (Fork E) also affects `pricing.ts` and
  the SiteGen architecture doc; reconcile once resolved.
