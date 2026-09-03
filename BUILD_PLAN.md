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
- [ ] **7.1** "Full visual QA pass against DESIGN.md across every page built
      so far: font stack applied, spacing rhythm consistent, only one accent
      color in use, buttons/cards match spec, mobile responsive down to
      375px width. Fix any drift."
- [ ] **7.2** "Add basic empty/loading/error states to every data-fetching
      page. Add a simple 404 page matching the design system."

## Phase 8 — Buffer
Reserved for whatever broke, plus your first real category template
(build the actual portfolio/restaurant template outside this codebase, as a
separate delivery project — see CLAUDE.md: this platform doesn't generate
sites, it takes orders for them).
