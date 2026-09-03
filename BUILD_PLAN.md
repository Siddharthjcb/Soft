# Build Plan — Ordering Platform MVP

Target: 1–2 weeks. Each task is scoped to be ONE Claude Code prompt. Do them in
order — later tasks depend on earlier ones. Check the box when a task is
committed and builds cleanly.

How to run a task manually: `claude` then paste the prompt.
How to run unattended: see `scripts/overnight-run.sh` — it walks this file,
finds the first unchecked task, runs its prompt via `claude -p`, and checks it
off on success. Or just use the `/build-next` skill interactively/headlessly.

---

## Phase 0 — Setup (do this yourself, not via prompt)
- [x] Repo initialized, CI/CD confirmed working on a trivial change
- [ ] Neon Postgres project created, connection string in `.env`
- [ ] Clerk project created, keys in `.env`
- [ ] Razorpay account created (test mode keys in `.env`)
- [ ] Resend account + API key in `.env`
- [x] Copy CLAUDE.md and DESIGN.md into repo root; copy `.claude/skills/build-next/`
      into your repo's `.claude/skills/`

## Phase 1 — Foundation
- [x] **1.1** "Set up a Next.js 14+ App Router TypeScript project with Tailwind
      configured using the tokens in DESIGN.md (colors, font stack, radius).
      Add Prisma with a Postgres datasource. Create the schema from the data
      model in CLAUDE.md (User, Order, Asset, Payment, Receipt) and run the
      initial migration. Confirm `npm run build` passes."
- [x] **1.2** "Integrate Clerk for auth. Add sign-in/sign-up pages. Add
      middleware so `/dashboard/*` requires login and `/admin/*` requires
      login AND role === 'admin' (store role on the User model, sync on
      Clerk webhook or first login). Confirm both redirects work."

## Phase 2 — Public site
- [x] **2.1** "Build the home/pitch page per DESIGN.md: hero with headline +
      one CTA to /order/new, a section listing the 4 tiers with pricing, a
      section listing the 4 categories with short descriptions, a simple
      footer. Static content is fine for now — no CMS."
- [x] **2.2** "Build /pricing as a dedicated page: clear tier comparison
      (table or cards), delivery-speed add-on, customization add-on, security
      add-on, all pricing in ₹. Build /portfolio as a placeholder grid (empty
      state is fine — we'll fill it with real work later)."

## Phase 3 — Order flow
- [x] **3.1** "Build /order/new as a multi-step form: (1) pick category, (2)
      pick tier, (3) pick delivery speed + add-ons — show running total price,
      (4) requirements text area + file upload (Vercel Blob) for assets, (5)
      review + confirm. On confirm, create an Order row with status
      pending_payment and redirect to a payment step. Require login before
      step 5 (send anonymous users to sign-in, preserve their form state)."
- [x] **3.2** "Integrate Razorpay: create a Razorpay order server-side for the
      computed total, open Razorpay Checkout client-side, and implement the
      webhook endpoint that verifies the signature and marks the Payment row
      success + flips the Order to status 'new'. Use test mode keys."
- [x] **3.3** "On successful payment, generate a PDF receipt (react-pdf) with
      the order line items and email it via Resend along with an order
      confirmation. Also send an email notification to the admin address for
      every new order."

## Phase 4 — Customer portal
- [x] **4.1** "Build /dashboard listing the logged-in user's orders with
      status badges. Build /dashboard/orders/[id] showing full order detail,
      uploaded assets, a receipt download link, and a 'request revision'
      button that sets status to revision_requested with a note field."

## Phase 5 — Admin
- [x] **5.1** "Build /admin: a list of all orders groupable/filterable by
      status, newest first. Build /admin/orders/[id]: full detail view,
      status dropdown (updating it emails the customer via Resend), and a
      field to paste the delivered site URL when marking 'delivered'."

## Phase 6 — Hosting fee (manual v1)
- [x] **6.1** "Add a HostingSubscription model (orderId, monthlyFee,
      nextBillingDate, status). Add an admin action to create one for a
      delivered order and to generate a Razorpay Payment Link for that
      month's fee on demand — no automated recurring billing yet, just a
      button the operator clicks manually each month."

## Phase 7 — Polish
- [x] **7.1** "Full visual QA pass against DESIGN.md across every page built
      so far: font stack applied, spacing rhythm consistent, only one accent
      color in use, buttons/cards match spec, mobile responsive down to
      375px width. Fix any drift."
- [x] **7.2** "Add basic empty/loading/error states to every data-fetching
      page. Add a simple 404 page matching the design system."

## Phase 8 — Buffer
Reserved for whatever broke, plus your first real category template
(build the actual portfolio/restaurant template outside this codebase, as a
separate delivery project — see CLAUDE.md: this platform doesn't generate
sites, it takes orders for them).

## Phase 9 — Hardening (v1.1)

Three headless modules, run in order on the `claude` branch. 9.2 and 9.3 add
tables; while there is still no live database they regenerate the single init
migration (as earlier phases did). If the DB is already migrated by the time
these run, generate real additive migrations with `prisma migrate dev` instead.

- [x] **9.1** "Add request validation to every API route. Install zod. Create
      `src/lib/api.ts` with `jsonError(status, code, message)` returning a
      consistent `{ error: { code, message } }` envelope, and
      `parseJson(schema, request)` / `parseParams(schema, params)` helpers built
      on zod. Write schemas for the body and params of every route under
      `src/app/api` (orders, upload, payments/create, orders/[id]/revision,
      orders/[id]/receipt, admin/orders/[id], admin/orders/[id]/hosting,
      admin/hosting/[subId]/payment-link, webhooks/clerk, webhooks/razorpay)
      and replace the ad-hoc `JSON.parse` + manual checks. Preserve existing
      status codes where sensible. Do NOT change the DB schema. Confirm
      `npm run build` passes."

- [x] **9.2** "Add fixed-window rate limiting to the public write routes: POST
      `/api/orders`, POST `/api/upload`, POST `/api/orders/[id]/revision`, POST
      `/api/payments/create`. Add a `RateLimit` model to `schema.prisma`
      (id, key, windowStart DateTime, count Int, `@@unique([key, windowStart])`)
      and regenerate the migration. `src/lib/rate-limit.ts`:
      `rateLimit(key, limit, windowSeconds)` keyed by Clerk `userId` when
      present else client IP (`x-forwarded-for`), atomic upsert+increment,
      returning `{ ok, retryAfter }`. On exceed, return 429 with a
      `Retry-After` header via the `jsonError` envelope. No new external
      service. Confirm `npm run build` passes."

- [x] **9.3** "Replace the single `Order.revisionNote` with a `RevisionRequest`
      model (id, orderId, note, createdAt, status `open` | `addressed`).
      Add a `ProcessedWebhookEvent` model (provider, eventId,
      `@@unique([provider, eventId])`, processedAt). Regenerate the migration.
      Update POST `/api/orders/[id]/revision` to append a row (not overwrite)
      and keep the `-> revision_requested` transition. Show the full revision
      history newest-first on `/dashboard/orders/[id]` and
      `/admin/orders/[id]`. Harden both webhooks: reject events whose timestamp
      (`svix-timestamp` for Clerk, `payload` created_at / event time for
      Razorpay) is more than 5 minutes old, and skip events already in
      `ProcessedWebhookEvent`. Drop the unused `revisionNote` column and its
      CLAUDE.md reference. Confirm `npm run build` passes."

## Phase 10 — Reliability & operations (v1.2)

Anything that cannot be finished without a live service gets a skeleton with a
`// BLOCKED(B-nn):` comment and an entry in `BLOCKERS.md` — never a guess.

- [x] **10.1** "Payment reliability and order integrity. Extract the payment
      settlement logic (mark Payment success, flip Order pending_payment ->
      new, set deadlineDate, create the Receipt, send customer + admin email)
      out of the Razorpay webhook into `src/lib/payments.ts`
      `settleOrderPayment()`, idempotent, and call it from both the webhook and
      a new POST `/api/payments/verify`. The verify route takes
      `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` from the
      Checkout handler and verifies `HMAC_SHA256(order_id|payment_id,
      RAZORPAY_KEY_SECRET)`, so payment confirms instantly instead of waiting
      on the webhook. Add `deliveryDays()` to pricing and set `Order.deadlineDate`
      on settlement (rush 2 days, standard 7). Add an `idempotencyKey` (unique,
      nullable) to Order so a double-submitted order form returns the existing
      order instead of creating a second one; send it from the client. Update
      PayButton to call verify then route to the order page. Confirm
      `npm run build` passes."

- [x] **10.2** "Admin operations upgrade. Add an overview strip to `/admin`:
      counts per status, orders awaiting action (new + revision_requested),
      and this month's settled revenue — all from one grouped query. Add a
      search box filtering by order id or customer email (query param, server
      side) that composes with the existing status filter. Add
      `/admin/customers` listing users with their order count and lifetime
      total, and `/admin/customers/[id]` showing that customer's orders.
      Keep DESIGN.md: monochrome, mono labels, no new colours. Confirm
      `npm run build` passes."

- [x] **10.3** "Customer billing page and SEO. Build `/dashboard/billing`
      (it is in the CLAUDE.md route map but unbuilt): payment history with
      amount, type (order/hosting), status and a receipt download link where
      one exists, plus hosting subscription state and next billing date.
      Then SEO: per-page `metadata` with titles and descriptions on every
      public page, `src/app/sitemap.ts`, `src/app/robots.ts`, and JSON-LD
      Organization + Service structured data on the home page. Use
      NEXT_PUBLIC_APP_URL for absolute URLs. Confirm `npm run build` passes."

## Phase 11 — Tests (v1.3)

Closes B-09. Nothing was verified beyond compiling.

- [x] **11.1** "Set up Vitest (node environment, `src/**/*.test.ts`, tsconfig
      path aliases) with `npm test` / `npm run test:watch`, and add a Test step
      to CI between typecheck and build. Write unit tests for the pure logic
      that matters: `formatINR` (Indian grouping, paise only when needed),
      pricing (catalog integrity, `computeOrderTotal` across every tier/plan
      combination, line items always summing to the total, `deliveryDays`),
      Razorpay signature verification (valid, tampered, wrong secret, wrong
      length, unconfigured), `isStaleEvent` replay window, every zod schema's
      accept/reject cases, and `apiErrorMessage` envelope parsing."

- [x] **11.2** "Behavioural tests for the settlement path with a mocked Prisma
      client: `settleOrderPayment` marks a payment success exactly once under
      concurrent calls, flips a pending order to `new`, sets `deadlineDate`
      from the delivery plan, rolls a hosting subscription forward instead of
      touching order status, and returns `unknown_reference` for an unmatched
      id. Also cover `rateLimit` window boundaries and the `/api/orders`
      idempotency-key short-circuit."

- [ ] **11.3** "Playwright smoke test over the surfaces that need no
      credentials: home, /pricing, /portfolio render with expected headings and
      a working nav; /order/new advances category -> tier -> add-ons with the
      running total updating; /dashboard and /admin redirect an anonymous
      visitor to sign-in. Run against `next build && next start` with the
      placeholder env. Add to CI only if it stays under ~2 minutes."
