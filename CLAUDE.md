# Project: [Your Platform Name] — Website-as-a-Service Ordering Platform

Read this file at the start of every session. It is the single source of truth for
architecture, data model, and conventions. If BUILD_PLAN.md and this file ever
disagree, this file wins — update BUILD_PLAN.md to match.

## What this is

A platform where small businesses (cloud kitchens, local vendors) and individuals
(school/college students) get a website or system, pay online, and track it.

There are **two delivery modes**:

1. **Instant (self-serve) — "SiteGen".** The customer picks a template and a
   colour scheme, fills in a form, and gets a real hosted site within minutes.
   Free for 14 days, then they buy it. Fully automated, no operator labour.
   Sites are *rendered from data* by this same application — there is no
   per-customer build or deploy. This is the primary dashboard feature.
   Architecture: `docs/ARCHITECTURE-SITEGEN.md`.
2. **Commissioned (operator-built).** The customer places an order describing
   what they need, pays, and we build and deliver it manually/semi-manually.
   This is the original ordering, payment and tracking flow.

Mode 1 covers Tier 1. Mode 2 covers Tiers 2–4.

## Tiers (priced in ₹, INR only — never USD)

| Tier | What it is | Delivery |
|---|---|---|
| 1 | Pick a template, flat fee | **Instant, self-serve** (SiteGen) |
| 2 | Tier 1 + customized features | Commissioned |
| 3 | Advanced features | Commissioned |
| 4 | Fully custom project/requirements | Commissioned |

Tier 1 (SiteGen): one-time fee **below** the commissioned tiers because it
consumes no operator time, plus the standard monthly hosting fee. Customers keep
editing their site for as long as hosting is active.

Delivery speed add-ons: 2-day rush vs 1-week standard (different fee).
Add-ons: customization (+₹500 baseline, varies), security hardening (+₹1000 baseline).
Recurring: hosting/maintenance fee, billed monthly (manual for v1 — see BUILD_PLAN Phase 6).

## Categories

Portfolio (school/college students) · Restaurant ordering (cloud kitchens) ·
Management system (small vendors) · Dashboard/other custom.

Each category will eventually have its own delivery template — not built yet.
This platform only needs to let customers select a category when ordering.

## Stack

- Next.js (App Router) + TypeScript
- Postgres via Neon + Prisma ORM
- Auth: Clerk
- Payments: **Razorpay** (not Stripe — Indian customers, UPI required)
- File uploads: Vercel Blob
- Email: Resend
- Receipts: server-generated PDF (react-pdf), NOT Razorpay's default invoice
- Hosting/deploy: Vercel

## Data model (Prisma) — source of truth, keep schema.prisma in sync with this

- **User** — id, name, email, phone, role (`customer` | `admin`)
- **Order** — id, userId, category, tier (1-4), deliveryPlan, addons (json),
  requirementsText, status (`pending_payment` → `new` → `in_progress` →
  `revision_requested` → `delivered`), deliveredUrl, deadlineDate, priceTotal
- **Asset** — id, orderId, fileUrl, fileName
- **Payment** — id, orderId, razorpayOrderId, razorpayPaymentId, amount,
  type (`order` | `hosting`), status
- **Receipt** — id, paymentId, receiptNumber, issuedAt
- **HostingSubscription** — id, orderId, monthlyFee (paise), nextBillingDate,
  status (`active` | `paused` | `cancelled`) — manual monthly billing (Phase 6)
- **RevisionRequest** — id, orderId, note, status (`open` | `addressed`),
  createdAt — append-only history, never overwritten
- **ProcessedWebhookEvent** — id, provider, eventId, processedAt — webhook
  replay protection; an event id is claimed once
- **RateLimit** — id, key, windowStart, count — fixed-window counters

## Route map

Public: `/`, `/pricing`, `/portfolio`, `/order/new` (multi-step order form)
Auth: `/sign-in`, `/sign-up` (Clerk)
Customer: `/dashboard`, `/dashboard/orders/[id]`, `/dashboard/billing`
Admin (role-gated): `/admin`, `/admin/orders/[id]`

## Design system

See DESIGN.md. Summary: Apple-esque — system font stack, neutral near-black/white
palette with one accent color, generous whitespace, 12-16px radii, subtle motion.
Every UI task must follow DESIGN.md tokens — do not introduce ad-hoc colors,
fonts, or spacing values.

## Conventions

- One task = one git commit. Commit message = the task's short description.
- Never push directly to `main`. Work on `nightly` (or a feature branch); the
  operator reviews and merges each morning.
- Run `npm run build` (or `lint`/`typecheck` if configured) before marking any
  task complete — a task that doesn't build is not done.
- Keep components small and colocated; prefer server components by default,
  client components only where interactivity requires it.
- All money values stored as integers (paise), never floats.

## Filesystem boundary (non-negotiable)

- **Stay inside this project folder.** Reading or writing anything outside it —
  the home directory, `~/.ssh`, `~/Library`, `~/Documents`, `/tmp`, another
  repo — requires asking the operator for permission FIRST. Do not assume
  earlier permission carries over to a new path or a new session.
- **Never change anything at the OS root level. Never run `sudo`.** If a task
  appears to need it, stop and report what is blocking instead.
- **Append to `ACCESS-LOG.md` after every implementation task**: files
  added/modified/deleted, dependencies installed, commands with side effects,
  and anything outside the project (normally "None"). Commit it with the task.

## Blockers

Never guess or fabricate around a missing credential, price, or decision. When
something cannot be finished:

1. Write a working skeleton (types, route, UI shell) so the build stays green.
2. Mark the exact spot with `// BLOCKED(B-nn): <one line>`.
3. Add or update the entry in `BLOCKERS.md` — what is stubbed, where, and
   precisely what is needed to close it.
4. Keep going with the rest of the task.
