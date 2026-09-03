# Blockers

Anything that stopped a task from being *fully* finished. Each entry says what
is stubbed, where the placeholder lives, and exactly what is needed to close it.

Status: `open` · `needs-operator` (waiting on Siddharth) · `closed`

When a task cannot be completed, do NOT guess or fabricate — write a skeleton
with a `// BLOCKED(B-nn):` comment pointing at the entry here, log it, and move
on.

---

## B-01 — No live database · `needs-operator`
Nothing has run against Postgres. Schema, migration and every query are
untested at runtime.
**To close:** create a Neon project, put `DATABASE_URL` + `DIRECT_URL` in
`.env`, run `npm run db:migrate`.
**Note:** the migration is still a single regenerated init migration (safe only
because no DB exists yet). After the first real migrate, schema changes must use
`prisma migrate dev` to create additive migrations.

## B-02 — Clerk not configured · `needs-operator`
Auth, the sign-in/up pages, route gating and the user-sync webhook have never
run. `.env` holds a syntactically valid dummy publishable key so the app builds.
**To close:** create a Clerk project, paste real keys, add the webhook endpoint
`<APP_URL>/api/webhooks/clerk`, set `CLERK_WEBHOOK_SECRET`.

## B-03 — Razorpay not configured · `needs-operator`
Checkout, order creation, the webhook and payment links are all untested.
**To close:** Razorpay test keys in `.env`, webhook endpoint
`<APP_URL>/api/webhooks/razorpay` (needs a public URL — Vercel preview or
ngrok), `RAZORPAY_WEBHOOK_SECRET`.

## B-04 — Resend not configured · `needs-operator`
No email has been sent. Order confirmation, PDF receipt attachment, admin
new-order alert and status-change emails are unverified.
**To close:** Resend API key, a verified sender domain, `ADMIN_EMAIL`.

## B-05 — Vercel Blob not configured · `needs-operator`
File upload in the order form has never run.
**To close:** create a Blob store on the Vercel project, set
`BLOB_READ_WRITE_TOKEN`.

## B-06 — Prices are placeholders · `needs-operator`
Every amount in `src/lib/pricing.ts` is provisional (Tier 1 ₹4,999 → Tier 4
from ₹39,999, rush +₹2,000, hosting ₹499/mo). Add-on baselines (₹500 / ₹1,000)
do match CLAUDE.md.
**To close:** confirm real numbers; they live in one file.

## B-07 — No admin user exists · `needs-operator`
`/admin` is gated on `User.role === 'admin'` and nothing sets it.
**To close:** after first sign-in, set `role = 'admin'` on your row
(`npm run db:studio`), or set `publicMetadata.role = "admin"` in Clerk so the
sync webhook writes it.

## B-08 — Portfolio has no real work · `needs-operator`
`/portfolio` renders a dashed placeholder grid.
**To close:** supply real case studies (client, category, screenshot, outcome,
permission to publish).

## B-09 — Automated tests · `open` (partly closed)
Vitest is set up and runs in CI; 49 unit tests cover pricing maths, INR
formatting, Razorpay signature verification, the webhook replay window, every
zod schema, and API error parsing (task 11.1).
**Still open:** behavioural tests against a mocked Prisma (settlement
idempotency, rate-limit windows, order idempotency key) — task 11.2 — and a
Playwright smoke run over the credential-free surfaces — task 11.3.

## B-10 — Next 16 deprecates `middleware.ts` · `open`
Build warns that the convention is now `proxy.ts`. Kept as `middleware.ts`
because that is what Clerk documents.
**To close:** revisit when Clerk documents `proxy.ts`, or run
`npx @next/codemod@canary middleware-to-proxy .` and verify auth still gates.

## B-13 — Brand identity and domain are placeholders · `needs-operator`
`src/lib/site.ts` drives every SEO surface (metadata, OpenGraph, sitemap,
robots, JSON-LD) and currently uses "Website Ordering Platform" and
`http://localhost:3000`. There is also no OG image or favicon.
**To close:** decide the business name, buy the domain, set
`NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL` in Vercel, and supply a logo /
OG image. Marked in code with `BLOCKED(B-13)`.

## B-12 — `/admin/customers` totals computed in memory · `open`
The customer list pulls every user's orders and sums `priceTotal` in JS. Fine
at operator scale, wrong shape once there are many customers or orders.
**To close:** replace with a `prisma.order.groupBy({ by: ['userId'] })`
aggregate plus pagination. See the comment in
`src/app/admin/customers/page.tsx`.

## B-11 — npm audit: 3 high, dev-only · `open`
Inside the `prisma` / `razorpay` dependency trees (`mysql2`, `deepmerge-ts`).
Not in the runtime path; the offered "fix" downgrades Prisma.
**To close:** re-check when Prisma 6.x ships updated transitive deps.
