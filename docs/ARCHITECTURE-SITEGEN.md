# SiteGen — instant template sites

**Status:** DRAFT — awaiting decisions in §11 before implementation
**Ref:** `SG`
**Author:** drafted 2026-09-03

---

## 1. What we are building

A customer signs up, fills in a form, and within minutes has a real, hosted
website they can look at. They get a free trial. If they like it, they pay once
and keep it.

First category: **portfolio sites** (school and college students). Restaurant,
management and dashboard categories come later on the same machinery.

This becomes the primary feature of the dashboard.

## 2. How this changes the product

CLAUDE.md currently says the platform is "the ordering, payment and tracking
layer, NOT an automatic site generator". SiteGen contradicts that directly.

**Proposed reconciliation** — the two models coexist and map onto the existing
tier ladder rather than replacing it:

| Tier | Today | With SiteGen |
|---|---|---|
| 1 — "Pick a template, flat fee" | Operator builds by hand | **Self-serve, instant, trial then buy** |
| 2 — Template + customization | Operator builds | Unchanged (order flow) |
| 3 — Advanced features | Operator builds | Unchanged |
| 4 — Fully custom | Operator builds | Unchanged |

Tier 1 was *already* described as "pick a template" — SiteGen is that promise
delivered automatically instead of manually. Nothing about Tiers 2–4 changes.
The existing order/payment/admin machinery is reused, not discarded.

If this framing is accepted, CLAUDE.md is rewritten to describe a platform with
two delivery modes: **instant (self-serve)** and **commissioned (operator)**.

## 3. Requirements

### 3.1 Functional — customer

- **R-C1** Create a site from a guided form without talking to anyone.
- **R-C2** Choose a template and a colour scheme; see the effect immediately.
- **R-C3** Enter portfolio content: profile, projects, skills, education,
  experience, links, contact.
- **R-C4** Upload images (avatar, project shots) and a résumé file.
- **R-C5** Preview the site exactly as visitors will see it, before publishing.
- **R-C6** Publish to a real, shareable URL within minutes.
- **R-C7** Get a free trial (length TBD, §11 Q3) with no card up front.
- **R-C8** Edit and re-publish freely during the trial.
- **R-C9** See days remaining and what happens at expiry.
- **R-C10** Buy with one payment and keep the site.
- **R-C11** Change the template or palette later without re-entering content.
- **R-C12** Take their content with them (export) — no lock-in.

### 3.2 Functional — operator

- **R-O1** See every site: owner, template, state, trial expiry, revenue.
- **R-O2** Preview any customer site.
- **R-O3** Suspend a site (abuse, chargeback, takedown request).
- **R-O4** Extend a trial manually (sales lever).
- **R-O5** Add or update templates without touching customer data.
- **R-O6** Know which templates convert.

### 3.3 Non-functional

- **R-N1 Speed.** Form submit to live preview in **seconds**, not minutes. This
  rules out any per-site build or deploy step (§4.1).
- **R-N2 Cost.** Must run on the existing free tiers. Any change that triggers
  a bill is called out explicitly.
- **R-N3 Isolation.** One customer must never read or write another's content.
- **R-N4 Safety.** Customer-supplied content is untrusted and must not be able
  to inject script into a page we serve.
- **R-N5 Durability.** A template change must never silently break or alter a
  site a customer already paid for.
- **R-N6 No cron.** Free tier has no scheduler; anything time-based (trial
  expiry) must resolve lazily at request time.
- **R-N7 Reversibility.** Publishing is versioned; a bad publish can be rolled
  back.

### 3.4 Explicitly out of scope for v1

Custom domains · multi-page sites · a WYSIWYG drag-and-drop editor · customer
analytics · e-commerce on generated sites · non-portfolio categories.

## 4. Architectural decisions

Written ADR-style: decision, alternatives, why.

### 4.1 Sites are *rendered from data*, not built

**Decision.** One Next.js application renders every customer site on demand
from rows in Postgres. A "template" is a React component; a "site" is JSON
content plus a theme, passed to it.

**Alternatives rejected.**
- *Static export per site* (build HTML, push to Blob/CDN). Adds a build step
  measured in tens of seconds and a whole pipeline to operate. Fails R-N1.
- *A Vercel project per customer* (deploy via API). Slow, needs a paid plan,
  and turns every customer into an ops surface. Fails R-N1 and R-N2.

**Why.** Rendering from data makes creation and editing instantaneous, keeps
one deployable artifact, and means a template fix reaches every site at once.
It is how Carrd, Linktree and Notion Sites work. The cost is that our uptime is
their uptime — acceptable at this price point, and stated plainly to customers.

### 4.2 Path-based URLs first, subdomains later

**Decision.** v1 serves sites at `/{slug}` under a reserved namespace —
`ourdomain.com/s/aisha-k`.

**Alternatives.**
- *Subdomains* (`aisha-k.ourdomain.com`) read far better and are what customers
  expect. They need a wildcard domain and wildcard TLS. **On Vercel that
  requires a paid plan (~$20/mo).** A real cost decision, not a technical one —
  §11 Q2.
- *Custom domains* (`aisha.com`) — deferred entirely; needs the Vercel domains
  API plus a paid plan plus customer DNS support burden.

**Why.** Path-based costs nothing and ships now. The routing layer is written
so that resolving a site from a subdomain is a one-function change later — the
site lookup takes a slug, and where the slug comes from (path segment or Host
header) is isolated in a single resolver.

### 4.3 A template is a component + a manifest, held in a registry

**Decision.** Templates are code, not data. Each lives in
`src/templates/<id>/` and exports:

```
index.tsx      the React component: ({ content, theme }) => JSX
manifest.ts    id, name, version, description, thumbnail,
               contentSchema (zod), defaultContent, supportedThemes
```

A central registry maps id → module. Adding a template is adding a folder and
one registry line; no migration, no customer data touched (R-O5).

**Why not template-as-data** (storing JSX/HTML in the database): it makes
rendering untrusted markup the core of the product, which is a permanent
security liability (R-N4), and gives up type safety on content.

### 4.4 Content is validated JSON, typed per template

**Decision.** Site content is a single JSON column, validated by the
template's zod schema on write. Reads validate too, and fall back to defaults
for missing fields, so an older site never crashes a newer template.

**Why not columns per field.** Templates differ in what they need; a wide
sparse table would need a migration per template. JSON + zod gives us
per-template typing with no schema churn, and we already use zod everywhere.

### 4.5 Themes are token sets, not CSS

**Decision.** A theme is a named set of design tokens — background, ink, muted,
border, accent, plus a font pairing. Applied as CSS custom properties on the
site's root element. Templates only ever reference tokens.

**Why.** Any template × any theme, combinatorially, with no per-combination
code. Swapping palette is instant and cannot break layout. It is the same
mechanism our own site already uses (`globals.css @theme`).

### 4.6 Draft and published are separate; publishes are versioned

**Decision.** A site carries a **draft** content blob and a pointer to the
**published version**. Editing touches draft only. Publishing snapshots draft
into an immutable `SiteVersion` row and repoints the site.

**Why.** Preview must show unpublished work (R-C5). A live site must not
change mid-edit. Rollback becomes trivial (R-N7). Versions also pin
`templateId` + `templateVersion`, so a template upgrade cannot silently alter a
site someone paid for (R-N5) — upgrades become an explicit, opt-in republish.

### 4.7 Lifecycle is a state machine, evaluated lazily

States: `draft → trialing → active → expired → suspended` (+ `archived`).

```
draft ──publish──▶ trialing ──pay──▶ active
                      │                 │
                trial lapses      operator suspends
                      ▼                 ▼
                  expired ◀──────── suspended
                      │
                    pay ──▶ active
```

**Decision.** No scheduled job flips `trialing → expired`. The state is derived
at request time from `trialEndsAt`, and persisted opportunistically. Same
technique as our rate-limit sweep.

**Why.** R-N6 — there is no cron on the free tier, and a site that stays live
past its trial because a job did not fire is a revenue leak.

### 4.8 Untrusted content is rendered as text, never as markup

**Decision.** All customer strings render as React text nodes. No
`dangerouslySetInnerHTML` anywhere in a template. URLs are validated and
constrained to `http(s):` and `mailto:`. Uploads are type- and size-checked and
served from Blob's own origin. If rich text is ever needed, it will be a
constrained AST we control, never raw HTML.

**Why.** We serve customer content from our own domain. Script injection there
is an account-takeover vector against every other customer. Non-negotiable.

### 4.9 Published sites are cached; publishing invalidates

**Decision.** Public site routes use `revalidateTag(`site:${id}`)`, invalidated
on publish, suspend and expiry. Preview is always dynamic and never cached.

**Why.** Portfolio sites are read-heavy and change rarely — the ideal ISR
shape. Keeps us inside free-tier function budgets (R-N2).

### 4.10 Trial sites are not indexed

**Decision.** `noindex` until state is `active`; only then does the site enter
`robots.txt`/sitemap.

**Why.** Abandoned trials must not litter Google with dead links under our
domain, which would also drag down our own SEO.

## 5. Data model (additive — nothing existing changes)

```
Site
  id, ownerId → User, slug @unique, category
  templateId, themeId
  draftContent      Json
  publishedVersionId → SiteVersion?
  state             SiteState
  trialStartedAt, trialEndsAt, purchasedAt
  createdAt, updatedAt
  @@index([ownerId]) @@index([state])

SiteVersion            immutable publish snapshot
  id, siteId → Site
  templateId, templateVersion, themeId
  content           Json
  publishedAt, publishedBy
  @@index([siteId, publishedAt])

SiteAsset
  id, siteId → Site
  url, fileName, kind (image | document), bytes
  @@index([siteId])

SiteEvent              audit + funnel analytics (R-O6)
  id, siteId, type (created|published|previewed|trial_started|
                    purchased|expired|suspended), meta Json, createdAt
  @@index([siteId, createdAt])

enum SiteState { draft trialing active expired suspended archived }
```

**Reuse, not duplication:** purchase runs through the existing `Payment` +
`settleOrderPayment` path; recurring hosting reuses `HostingSubscription`.
A purchased Site links to the `Order` that paid for it.

## 6. Routing

| Route | Purpose | Auth | Rendering |
|---|---|---|---|
| `/s/[slug]` | the live customer site | public | cached, tag-invalidated |
| `/s/[slug]/preview` | draft as visitors would see it | owner or admin | dynamic, noindex |
| `/dashboard/sites` | my sites | customer | dynamic |
| `/dashboard/sites/new` | guided builder | customer | dynamic |
| `/dashboard/sites/[id]/edit` | edit + live preview | owner | dynamic |
| `/admin/sites` | every site | admin | dynamic |

`/s` is a reserved prefix. Slugs are validated against a reserved-word list
(`admin`, `api`, `dashboard`, `www`, `s`, `sign-in`, …) and are
lowercase-kebab, 3–40 chars, globally unique.

## 7. Template & theme catalogue (v1)

Three portfolio templates, deliberately different in structure so the choice is
meaningful rather than cosmetic:

1. **Monolith** — single column, huge type, text-forward. For writers and
   researchers with little imagery.
2. **Grid** — project-image-led masonry. For designers and photographers.
3. **Dossier** — two-column, sidebar profile + timeline. For CV-style
   engineering and academic profiles.

Five themes, each a token set — **Ink** (mono, our house style), **Paper**
(warm off-white/brown), **Nocturne** (dark, cool), **Bloom** (light, single
saturated accent), **Terracotta** (earthy). Every template must look correct in
every theme; that is the acceptance bar.

## 8. Security model

| Risk | Control |
|---|---|
| Cross-tenant read/write | Every query scoped by `ownerId`; ownership re-checked on every mutation, never trusting a client id |
| Script injection via content | Text-only rendering; no raw HTML; URL scheme allowlist (§4.8) |
| Slug squatting / impersonation | Reserved-word list; uniqueness; operator suspend (R-O3) |
| Upload abuse | Type + size limits, per-site quota, Blob-origin serving |
| Trial farming | Rate-limit site creation per user and per IP; cap sites per account |
| Stale trial served free | Lazy expiry evaluated on every public request (§4.7) |
| Bad publish reaching visitors | Versioned publishes + rollback (§4.6) |

## 9. Cost

Everything below stays on current free tiers: Postgres rows (Neon), Blob
storage for images (Vercel Blob), function invocations (Vercel Hobby), and the
existing Clerk/Razorpay/Resend usage.

The **only** cost trigger is subdomains or custom domains, which need Vercel
Pro at roughly $20/month (§4.2, §11 Q2). Path-based URLs cost nothing.

## 10. Delivery plan

Each phase ends buildable, tested and committed under ref `SG`.

| Phase | Scope | Depends on |
|---|---|---|
| **SG-1** | Data model + migration; slug rules; template registry + theme tokens; **one** template rendering hardcoded content at `/s/[slug]` | — |
| **SG-2** | Builder form (reuse the `/order/new` step pattern) + draft autosave + `/dashboard/sites` |  SG-1 |
| **SG-3** | Live preview, publish → `SiteVersion`, cache invalidation, rollback | SG-2 |
| **SG-4** | Trial lifecycle, lazy expiry, expired page, days-remaining UI | SG-3 |
| **SG-5** | Purchase → reuse Razorpay settlement; `active`; receipt | SG-4 |
| **SG-6** | Templates 2 and 3 + all five themes + template/theme switcher | SG-3 |
| **SG-7** | Admin: site list, preview, suspend, extend trial; `SiteEvent` funnel | SG-3 |
| **SG-8** | Image + résumé upload, quotas, content export (R-C12) | SG-2 |
| **SG-9** | Per-site SEO, OG images, noindex rules, sitemap inclusion when active | SG-5 |

Unit tests per phase; e2e for the public site render and the builder happy
path. Blockers logged as `SG-Bnn` in BLOCKERS.md.

## 11. Open decisions — needed before SG-1

1. **Q1 Product framing.** Confirm SiteGen becomes Tier 1 self-serve while
   Tiers 2–4 stay commissioned (§2), and that CLAUDE.md is rewritten to match.
2. **Q2 URLs.** Path-based (`/s/aisha`, free) for v1, or pay for Vercel Pro now
   to get subdomains (`aisha.ourdomain.com`, ~$20/mo)?
3. **Q3 Trial.** How long — 7 or 14 days? And at expiry: site goes offline
   entirely, or stays up with a footer badge until they buy?
4. **Q4 After purchase.** One-time fee and the site is frozen, or one-time fee
   plus a monthly hosting charge with editing kept open? This decides whether
   SiteGen produces a one-off sale or recurring revenue.
5. **Q5 Price.** Tier 1 is currently a ₹4,999 placeholder. Is a self-serve
   instant site the same price, or cheaper because there is no labour?
6. **Q6 Account requirement.** Must a visitor sign in *before* building, or can
   they build anonymously and sign in only to publish (as the order form does)?
