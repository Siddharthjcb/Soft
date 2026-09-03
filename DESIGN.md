# Design System — "Futuristic Monochrome"

Black and white only. No chromatic brand color. The aesthetic is precise,
high-contrast, and spacious — a well-made instrument, not a poster. Confidence
comes from restraint, sharp alignment, and generous negative space. If in doubt,
remove an element rather than add one.

**Stack note:** this project uses **Tailwind CSS v4**. There is no
`tailwind.config.js` — design tokens live in `src/app/globals.css` inside an
`@theme` block. The token *values* below are binding; the file format is v4 CSS.

## Theme

Dark is the signature surface; light is a full, equal counterpart. Both are
defined and the app is theme-aware (`prefers-color-scheme`, manual toggle later).
Never hard-code hex in components — use the tokens.

## Typography

System stack — real SF on Apple, Segoe/Roboto elsewhere. No webfont load.

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", "JetBrains Mono", Menlo,
  Consolas, monospace;
```

Mono is used deliberately for anything machine-like: prices, order IDs, status
labels, timestamps, form field hints, nav "eyebrow" labels. It is the one visual
tell that says "system", and it is free.

Scale (Tailwind defaults; hold this hierarchy):
- Display / hero: `text-6xl` desktop, `text-4xl` mobile, `font-semibold`, `tracking-tight`
- Section heading: `text-3xl`, `font-semibold`, `tracking-tight`
- Body: `text-base`, `font-normal`, `leading-relaxed`
- Caption / meta / eyebrow: `text-xs` or `text-sm`, mono, `uppercase`, `tracking-widest`, muted

Two weights max on a screen: `font-semibold` + `font-normal`. `font-medium` is
allowed on buttons and nav only.

## Color (monochrome — these are the only values)

```css
/* light */
--color-ink:      #0A0A0A;  /* primary text, primary button bg */
--color-paper:    #FFFFFF;  /* page background */
--color-surface:  #FAFAFA;  /* card / raised background */
--color-border:   #E4E4E4;  /* hairline */
--color-muted:    #6B6B6B;  /* secondary text */
--color-faint:    #F2F2F2;  /* subtle fills, hover, skeletons */

/* dark — prefers-color-scheme: dark */
--color-ink:      #FFFFFF;
--color-paper:    #0A0A0A;
--color-surface:  #141414;
--color-border:   #262626;
--color-muted:    #8A8A8A;
--color-faint:    #1C1C1C;
```

There is **no accent color**. The "accent" is maximum contrast: a solid `ink`
button on `paper`, or inverted. Links are `ink` with an underline offset, not a
color.

Functional-only colors (never decorative, never in marketing UI):

```css
--color-danger:  #E5484D;  /* destructive actions, error text, failed payment */
--color-success: #30A46C;  /* confirmed payment, delivered status */
```

Status pills may use `danger` / `success` sparingly; everything else is
monochrome (`muted` text on `faint` fill).

## Spacing & radius

Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 — Tailwind's default scale.
Never invent values.

Radius (tighter than default — the futuristic edge):
- Cards / panels / modals: `rounded-xl` (12px)
- Buttons / inputs / selects: `rounded-lg` (8px)
- Pills / tags / status badges: `rounded-md` (6px) — not fully round
- Avatars only: `rounded-full`

## Borders & elevation

Prefer a 1px `border` hairline over shadow. Elevation is communicated by border
plus a change of surface, not by a drop shadow.

At most one shadow, only on genuinely floating elements (dropdown, popover,
toast) — never on cards or buttons:

```css
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12);
```

No colored shadows. No glows.

## Motion

120–220ms, `ease-out`, `opacity` and `transform` only. No bounce, no spring.

```css
transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
```

Page / section reveals: fade + 8px rise, once — not on every scroll.

## Layout

- Max content width **1200px**, centered. Side padding: 20px mobile, 40px
  tablet, 64px+ desktop.
- Section vertical rhythm: 96–128px between major sections on desktop, 64px mobile.
- Optional structural device: a faint 1px vertical rule or column guide aligned
  to the grid — for structure, never decoration.
- Hero: one headline, one line of subhead, one primary CTA. No second CTA.

## Components

- **Buttons** — primary: solid `ink` bg, `paper` text. Secondary: transparent
  bg, 1px `border`, `ink` text. Height 44px, `rounded-lg`, `font-medium`,
  sentence case (no all-caps). Hover: primary → 90% opacity; secondary fills with
  `faint`. Focus: 2px `ink` ring, 2px offset.
- **Cards** — `surface` bg, 1px `border`, `rounded-xl`, 24–32px padding. No shadow.
- **Nav** — sticky; on scroll, `backdrop-blur-md` with `bg-paper/70`; 1px bottom
  `border`; no shadow. Link style: mono `uppercase text-xs tracking-widest`, or
  plain `text-sm` — pick one and keep it.
- **Forms** — label above input, mono `text-xs uppercase tracking-widest muted`.
  Input: 44px height, transparent bg, 1px `border`, `rounded-lg`. Focus = 2px
  `ink` ring, no color change. Errors: `danger` text below, `danger` border.
- **Status badge** — `rounded-md`, `text-xs`, mono, uppercase. Monochrome by
  default (`muted` on `faint`); `success` / `danger` only for delivered / failed.

## What to avoid

Chromatic accent colors. Gradients as decoration. Drop shadows on text or cards.
Glows. Stock "hero illustration" or 3D-blob graphics. Emoji in UI copy.
Rounded-everything (keep radii tight). Dense dashboards — when it feels crowded,
add whitespace before adding content.
