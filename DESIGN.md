# Design System

This project has **two deliberate surfaces**. Know which one you are working on
before you touch anything.

| Surface | Where | Character |
|---|---|---|
| **Editorial** — "The Broadsheet" | `(marketing)`: `/`, `/pricing`, `/portfolio`, `/order/new` | Terracotta, warm, typographic, square. The pitch. |
| **Functional** — monochrome | `/dashboard/*`, `/admin/*`, auth pages | Neutral, quiet, dense-ish. Tools, not marketing. |

Full rationale: `docs/DESIGN-DIRECTION.md`.

**Stack:** Tailwind CSS v4. There is no `tailwind.config.js` — tokens live in
`src/app/globals.css`.

---

## How the two surfaces coexist

The editorial palette is applied **by scope, never by replacing root tokens**.
The `(marketing)` layout carries `data-surface="editorial"`, and `globals.css`
redefines `--color-*`, `--radius-*` and the font vars under that selector.

Consequences you must respect:

- **Never change the root `@theme` token values.** That would repaint the
  dashboard.
- Shared primitives (`Button`, `Container`) automatically restyle inside
  marketing and stay monochrome outside it. Write them against tokens, never
  against literal colours.
- New editorial-only utilities (`bg-clay`, `text-clay-fired`,
  `bg-clay-blush`, `font-display`) are declared at root with neutral fallbacks
  so they are harmless if ever used outside the scope.

---

## Editorial surface — "The Broadsheet"

The site is a type specimen. Typography is the interface. The register is a
well-set newspaper and a hand-painted signboard, not Swiss minimalism — warm,
legible, and unmistakably *of India*.

### Colour — fired earth

```
--color-clay        #B4552D   identity
--color-clay-fired  #8F3F1F   hover / pressed
--color-clay-blush  #F3E4DA   fill of the ONE primary tile
--color-paper       #F6F0E8   the broadsheet column
--color-surface     #FBF7F1   a tile lifted off the page
--color-faint       #EFE7DB   ground outside the column
--color-ink         #211915   burnt-umber black — never #000
--color-muted       #6E5F53
--color-border      #D9CDBD   hairline
```

Dark ("kiln at night") — clay lifts to `#D9805A` so it glows rather than
muddies; paper `#191410`, ink `#F0E7DB`, border `#332A22`.

**The discipline rule: at most ~3 terracotta moments per viewport.** Typically
the CTA, one headline word, and the language cycle. Everything else is paper,
ink, muted and hairlines. Terracotta everywhere stops reading as premium and
becomes startup-orange.

**No red for errors here.** `--color-danger` sits too close to the identity
colour. Marketing form errors use ink + an underline + a mark. (The functional
surface keeps its semantic palette.)

### Typography

- **Display** — `font-display` (Bricolage Grotesque, variable). Headlines,
  tier names, the wordmark. Tight tracking (`-0.03em` at large sizes),
  line-height ~1.0.
- **Body** — `font-sans` (Anek Latin, variable). Everything else.
- **Functional** — `font-mono` (system). Prices, index numerals, specs.
- **Indic** — Anek covers Devanagari, Bangla, Tamil, Telugu, Kannada,
  Malayalam, Gujarati, Gurmukhi and Odia in one consistent superfamily; Urdu
  uses Noto Nastaliq. Loaded with `preload: false` — they must never block
  first paint.

Both Latin faces are self-hosted by `next/font` (`src/lib/fonts.ts`) and
exposed as CSS variables on `<html>`, consumed only inside the scope.

### Geometry

**Square. Nothing on this surface is rounded** — `--radius-*` are all `0`
inside the scope. The square is part of the identity.

Hairline borders over shadows. The page carries **exactly one** shadow, on the
primary tile. Elevation elsewhere is communicated by border + surface change.

### Grid and composition

12 columns, max 1240px, inside a bordered "broadsheet column". Content spans
**unequal** numbers of columns on purpose; headlines break the grid. Gutters
32–48px. Never a row of identical cards — see `<TierGrid>`: one large filled
primary tile plus three quiet secondary tiles that deliberately do not
top-align with it.

### Motion — "ink settling + letterpress"

CSS + variable-font weight + GSAP ScrollTrigger only. No WebGL.

- Headings **set** on scroll-in: fade up 8px while weight settles 480 → 600
  over 500ms (`<SetType>`).
- Section rules **draw**: width 0 → 100%, ~600ms (`<DrawRule>`).
- Language cycle: crossfade + 6px rise, 420ms, ~3.8s hold — the one "alive"
  element, offset between instances.
- CTA hover: deepen to clay-fired + `translateY(1px)` — a stamp press.
- Tiles: border draws in with a 20ms stagger; hover thickens to 2px clay.

**`prefers-reduced-motion` renders every final state immediately.** Nothing is
lost. This is not optional.

### Signature elements

1. **The language cycle** — a short phrase rotating through 12 Indian scripts
   in exactly three places (hero eyebrow, closing line, footer). Never the
   headline.
2. **The modular tile grid** — square, unequal, art-directed.
3. **The Mark** — the trust fixture, bottom-left on desktop, inline on mobile.
   Fades in once, never pulses, changes only on interaction or silently.

### What to avoid

Rounded cards · shadows on anything but the primary tile · a second accent
colour · gradients as decoration · stock illustration or icon sets · emoji in
UI copy · fake urgency, countdowns or invented numbers · any animation that
fires without the user doing something.

---

## Functional surface — monochrome

Unchanged. Neutral near-black/white, `--radius-md/lg/xl` at 6/8/12px, system
font stack, semantic `--color-danger` / `--color-success` for status. Quiet,
legible, gets out of the way. Do not bring terracotta, display type or motion
into the dashboard.

---

## Spacing (both surfaces)

Tailwind's default scale — 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Never invent
values. Editorial section rhythm is 96–128px desktop, 64px mobile; the
functional surface is tighter.

## Responsive

Mobile-first, down to 360px. Display type stays large but tuned never to
overflow. On mobile the tile grid collapses to one primary tile plus a
three-row index, the Mark moves inline, the language cycle runs in one place
only and slower, and cursor-dependent effects are off entirely.
