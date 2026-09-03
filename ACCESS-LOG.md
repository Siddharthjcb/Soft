# Access log

A trace of everything Claude touched, appended after every implementation task.

**Rules this log enforces (see CLAUDE.md → Conventions):**

- Work stays inside this project folder. Anything outside it — including the
  home directory, `~/.ssh`, `~/Library`, `/tmp` — requires asking the operator
  first, and gets recorded under "Outside the project" below.
- Never modify anything at the OS root level. Never `sudo`.
- Every task entry lists: files added/modified/deleted, dependencies installed,
  commands with side effects, and anything outside the project (normally
  "None").

Entry format:

```
## <task id> — <short description>  (<commit sha>)
Inside the project:  A/M/D <path>
Dependencies:        <packages added, or None>
Side effects:        <installs, git pushes, generated migrations, or None>
Outside the project: None   ← anything else requires prior permission
```

---

## Retroactive: session of 2026-09-03 (Phases 1–7)

Reconstructed from git history. Per-task file lists below; everything is inside
the project unless called out in the "Outside the project" section at the end.

### 1.1 — Next.js + Tailwind v4 tokens + Prisma schema (`46a11e8`)
- **A** `prisma/schema.prisma`, `prisma/migrations/20260903000000_init/migration.sql`, `prisma/migrations/migration_lock.toml`, `src/lib/prisma.ts`
- **M** `package.json`, `package-lock.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- **D** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- **Dependencies:** `prisma@6.19.3` (dev), `@prisma/client@6.19.3`
- **Side effects:** `prisma generate`; init migration generated offline via `prisma migrate diff`

### 1.2 — Clerk auth + role-gated middleware (`4d6f585`)
- **A** `src/middleware.ts`, `src/lib/auth.ts`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/api/webhooks/clerk/route.ts`, `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`
- **M** `.env.example`, `src/app/layout.tsx`, `package.json`, `package-lock.json`
- **Dependencies:** `@clerk/nextjs@7`, `svix`

### 2.1 — Home page + marketing shell + CI route-types fix (`1d97894`)
- **A** `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/ui/button.tsx`, `src/components/ui/container.tsx`, `src/lib/pricing.ts`, `src/lib/categories.ts`, `src/lib/format.ts`
- **M** `.github/workflows/ci.yml`, `package.json`
- **D** `src/app/page.tsx`

### 2.2 — Pricing and portfolio pages (`2cc7008`)
- **A** `src/app/(marketing)/pricing/page.tsx`, `src/app/(marketing)/portfolio/page.tsx`

### 3.1 — /order/new multi-step order form (`29ba94f`)
- **A** `src/app/(marketing)/order/new/page.tsx`, `src/app/api/orders/route.ts`, `src/app/api/upload/route.ts`, `src/app/order/[id]/pay/page.tsx`, `src/components/order/order-form.tsx`
- **M** `src/lib/pricing.ts`, `package.json`, `package-lock.json`
- **Dependencies:** `@vercel/blob`

### 3.2 — Razorpay checkout + webhook (`b3f26a1`)
- **A** `src/lib/razorpay.ts`, `src/app/api/payments/create/route.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/components/order/pay-button.tsx`
- **M** `src/app/order/[id]/pay/page.tsx`, `package.json`, `package-lock.json`
- **Dependencies:** `razorpay`

### 3.3 — PDF receipt + Resend emails on payment (`6621c31`)
- **A** `src/lib/receipt.tsx`, `src/lib/email.ts`
- **M** `src/app/api/webhooks/razorpay/route.ts`, `src/lib/pricing.ts`, `package.json`, `package-lock.json`
- **Dependencies:** `@react-pdf/renderer`, `resend`

### 4.1 — Customer portal (`0675d48`)
- **A** `src/app/dashboard/layout.tsx`, `src/app/dashboard/orders/[id]/page.tsx`, `src/app/api/orders/[id]/receipt/route.ts`, `src/app/api/orders/[id]/revision/route.ts`, `src/components/order/revision-request.tsx`, `src/components/portal-header.tsx`, `src/components/ui/status-badge.tsx`, `src/lib/order-display.ts`
- **M** `CLAUDE.md`, `prisma/schema.prisma`, `prisma/migrations/.../migration.sql`, `src/app/dashboard/page.tsx`
- **Side effects:** added `Order.revisionNote`; migration + client regenerated

### 5.1 — Admin queue + detail + status control (`892a48c`)
- **A** `src/app/admin/orders/[id]/page.tsx`, `src/app/api/admin/orders/[id]/route.ts`, `src/components/admin/admin-order-controls.tsx`
- **M** `CLAUDE.md`, `prisma/schema.prisma`, `prisma/migrations/.../migration.sql`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/ui/status-badge.tsx`, `src/lib/email.ts`, `src/lib/order-display.ts`
- **Side effects:** added `Order.deliveredUrl`; migration + client regenerated

### 6.1 — Hosting subscription, manual v1 (`bee5012`)
- **A** `src/app/api/admin/orders/[id]/hosting/route.ts`, `src/app/api/admin/hosting/[subId]/payment-link/route.ts`, `src/components/admin/hosting-controls.tsx`
- **M** `CLAUDE.md`, `prisma/schema.prisma`, `prisma/migrations/.../migration.sql`, `src/app/admin/orders/[id]/page.tsx`, `src/app/api/webhooks/razorpay/route.ts`
- **Side effects:** added `HostingSubscription` model; migration + client regenerated

### 7.1 — Visual QA pass against DESIGN.md (`4d75158`)
- **M** `src/app/globals.css`, `src/components/order/order-form.tsx`, `src/components/order/revision-request.tsx`

### 7.2 — Loading / error / empty states + 404 (`ef177d4`)
- **A** `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/ui/feedback.tsx`, and `loading.tsx` for `/dashboard`, `/dashboard/orders/[id]`, `/admin`, `/admin/orders/[id]`, `/order/[id]/pay`, `/order/new`

---

## Phase 9 — Hardening

### 9.1 — zod validation + consistent error envelope
- **A** `src/lib/api.ts`, `src/lib/schemas.ts`
- **M** `src/app/api/orders/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/payments/create/route.ts`, `src/app/api/orders/[id]/revision/route.ts`, `src/app/api/orders/[id]/receipt/route.ts`, `src/app/api/admin/orders/[id]/route.ts`, `src/app/api/admin/orders/[id]/hosting/route.ts`, `src/app/api/admin/hosting/[subId]/payment-link/route.ts`, `src/app/api/webhooks/clerk/route.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/lib/pricing.ts` (removed dead `isValidSelections`), `package.json`, `package-lock.json`
- **Dependencies:** `zod@4`
- **Side effects:** `npm install zod`; no DB schema change, no migration
- **Outside the project:** None

### 9.2 — Rate limiting on public write routes
- **A** `src/lib/rate-limit.ts`
- **M** `prisma/schema.prisma` (added `RateLimit` model), `prisma/migrations/20260903000000_init/migration.sql`, `src/app/api/orders/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/orders/[id]/revision/route.ts`, `src/app/api/payments/create/route.ts`
- **Dependencies:** None
- **Side effects:** init migration + Prisma client regenerated. No new external service — counters live in Postgres
- **Outside the project:** None

### 9.3 — Revision history + webhook replay protection
- **A** `src/lib/webhook.ts`
- **M** `prisma/schema.prisma` (added `RevisionRequest`, `ProcessedWebhookEvent`, `RevisionStatus`; dropped `Order.revisionNote`), `prisma/migrations/20260903000000_init/migration.sql`, `CLAUDE.md`, `src/lib/schemas.ts`, `src/app/api/orders/[id]/revision/route.ts`, `src/app/api/webhooks/clerk/route.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/app/dashboard/orders/[id]/page.tsx`, `src/app/admin/orders/[id]/page.tsx`
- **Dependencies:** None
- **Side effects:** init migration + Prisma client regenerated
- **Outside the project:** None

---

## Phase 10 — Reliability & operations

### 10.1 — Payment reliability + order integrity
- **A** `src/lib/payments.ts`, `src/lib/client-error.ts`, `src/app/api/payments/verify/route.ts`
- **M** `prisma/schema.prisma` (added `Order.idempotencyKey`), `prisma/migrations/20260903000000_init/migration.sql`, `src/lib/pricing.ts`, `src/lib/razorpay.ts`, `src/lib/schemas.ts`, `src/lib/rate-limit.ts`, `src/app/api/orders/route.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/components/order/order-form.tsx`, `src/components/order/pay-button.tsx`, `src/components/order/revision-request.tsx`, `src/components/admin/admin-order-controls.tsx`, `src/components/admin/hosting-controls.tsx`
- **Dependencies:** None
- **Side effects:** init migration + Prisma client regenerated
- **Outside the project:** None

### 10.2 — Admin operations upgrade
- **A** `src/app/admin/customers/page.tsx`, `src/app/admin/customers/loading.tsx`, `src/app/admin/customers/[id]/page.tsx`, `src/app/admin/customers/[id]/loading.tsx`
- **M** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `BLOCKERS.md` (added B-12)
- **Dependencies:** None
- **Side effects:** None (no schema change)
- **Outside the project:** None

### 10.3 — Customer billing page + SEO
- **A** `src/app/dashboard/billing/page.tsx`, `src/lib/site.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`
- **M** `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/app/(marketing)/pricing/page.tsx`, `src/app/(marketing)/portfolio/page.tsx`, `src/app/(marketing)/order/new/page.tsx`, `src/lib/order-display.ts`, `BLOCKERS.md` (added B-13)
- **Dependencies:** None
- **Side effects:** None (no schema change)
- **Outside the project:** None

---

## Outside the project — session of 2026-09-03

Done **before** this logging rule existed. Nothing at OS root; no `sudo` was
ever run by Claude (the one `sudo xcodebuild -license` was run by the operator).

| Path | Access | Reason |
|---|---|---|
| `~/.nvm/versions/node/v22.23.2/` | **Wrote** — installed Node 22 | Node 23 (the machine default) is rejected by Prisma. Matches `.nvmrc` and CI. Reversible: `nvm uninstall 22` |
| `~/.claude/projects/…-sideproj/memory/` | **Wrote** — 3 memory notes | Session memory (project status, toolchain constraints, index). Deletable on request |
| `~/.ssh` | **Listed** (did not exist) | Diagnosing the failed `git push` — checking for an SSH key |
| `~/.ssh/known_hosts` | **Read** (did not exist) | Same — SSH host-key verification error |
| `git config credential.helper` | **Read** | Same — determining the auth path |
| `~/package.json`, `~/package-lock.json` | **Listed** (not read, not modified) | Turbopack was inferring the wrong workspace root from these |
| `/tmp/migdiff.err`, `/tmp/md.err`, `/tmp/pr-body.md` | **Wrote** — scratch files | Should have used the session scratchpad. Safe to delete |

**Going forward:** anything in this section requires asking the operator first.
