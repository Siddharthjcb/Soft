# Project: Company marketing & services website

## What this is
A marketing website for a solo software studio. The studio builds and sells
websites and apps (and related services) to small businesses in India — the
canonical customer is a small restaurant (e.g. a local waffle house) that wants
a good-quality site at an affordable price. The website's job is to market the
studio's products and services, show customizable offerings, and present pricing
tiers, then capture leads.

## Positioning
- Audience: non-technical small-business owners in India.
- Promise: good quality, fair price, fast turnaround, handed over cleanly.
- Tone: clear, concrete, no jargon. Show real outcomes and prices.

## Stack
- Next.js (App Router), TypeScript.
- Styling: Tailwind CSS.
- Content: MDX files in-repo (no CMS until there's a reason).
- Hosting: Vercel Hobby (free). `main` = production. Every PR gets a preview URL.
- CI: GitHub Actions on PRs only — install, lint, typecheck, `next build`.
  Vercel owns deploys; Actions never deploys.
- Package manager: npm.

## Environments
- Production: Vercel deploy from `main`.
- "Staging": per-PR Vercel preview deploys. No separate paid staging env.
- Local: `npm run dev`. Use Node 22 (`.nvmrc`); `nvm use` to match CI.

## Conventions
- Short-lived feature branches → PR → squash merge to `main`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`).
- Every PR must pass CI (lint + typecheck + build) before merge.
- Keep components small and server-first; add `"use client"` only when needed.
- No secrets in the repo. Use Vercel/GitHub environment variables.
- Accessibility and mobile-first are not optional — most visitors are on phones.

## Cost discipline
This is a side hustle. Prefer free tiers. Only sanctioned recurring cost is the
domain. Flag anything that would introduce a bill before adding it.

## Roadmap (stages)
0. Foundation — repo, tooling, CI, deploy pipeline, design tokens.
1. Marketing core — landing, services, pricing, about, contact.
2. Content — case studies, testimonials, blog (editable via MDX, no code).
3. Lead capture — quote-request flow, contact form, email/CRM hookup.
4. Client portal (later) — project status, invoices.
5. Polish — SEO, analytics, performance, regional languages.

See `docs/modules/` for the module map and per-module specs.
