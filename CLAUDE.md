# Project: [Your Platform Name] — Website-as-a-Service Ordering Platform

Read this file at the start of every session. It is the single source of truth for
architecture, data model, and conventions. If BUILD_PLAN.md and this file ever
disagree, this file wins — update BUILD_PLAN.md to match.

## What this is

A platform where small businesses (cloud kitchens, local vendors) and individuals
(school/college students) order a website/system from us, pay online, track their
order, and receive the finished product. We (the operator) fulfil each order
manually/semi-manually using category templates — this platform is the ordering,
payment, and tracking layer, NOT an automatic site generator.

## Tiers (priced in ₹, INR only — never USD)

| Tier | What it is |
|---|---|
| 1 | Pick a template, flat fee |
| 2 | Tier 1 + customized features |
| 3 | Advanced features |
| 4 | Fully custom project/requirements |

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
  `revision_requested` → `delivered`), deadlineDate, priceTotal
- **Asset** — id, orderId, fileUrl, fileName
- **Payment** — id, orderId, razorpayOrderId, razorpayPaymentId, amount,
  type (`order` | `hosting`), status
- **Receipt** — id, paymentId, receiptNumber, issuedAt

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
