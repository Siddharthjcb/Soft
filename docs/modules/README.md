# Module map

Each module is a PR-sized unit of work with its own spec and/or generated
prompt. Use the `module-prompt` skill to turn a module into an agent-ready
prompt.

Naming: `docs/modules/stage-<n>-<slug>.md` for a spec,
`docs/modules/stage-<n>-<slug>.prompt.md` for a generated prompt.

## Stage 0 — Foundation
| Module | Slug | Status |
|---|---|---|
| Repo + workflow scaffolding (templates, CODEOWNERS, dependabot; branch protection pending) | `stage-0-repo` | in progress — pending first push + GitHub branch-protection settings |
| Next.js app skeleton (App Router, TS, Tailwind, npm, lint/typecheck/build scripts) | `stage-0-app-skeleton` | done locally — pending first push |
| GitHub Actions CI (lint + typecheck + build on PRs and main) | `stage-0-ci` | done locally — pending first push to verify green |
| Vercel project + domain + env wiring | `stage-0-deploy` | not started |
| Design tokens (colors, type scale, spacing) + base layout shell | `stage-0-design-tokens` | not started |

## Stage 1 — Marketing core
| Module | Slug | Status |
|---|---|---|
| Landing page | `stage-1-landing` | not started |
| Services page (customizable offerings) | `stage-1-services` | not started |
| Pricing page (tiers) | `stage-1-pricing` | not started |
| About page | `stage-1-about` | not started |
| Contact page (static form target TBD) | `stage-1-contact` | not started |

## Stage 2 — Content
| Module | Slug | Status |
|---|---|---|
| MDX content pipeline | `stage-2-mdx` | not started |
| Case studies | `stage-2-case-studies` | not started |
| Testimonials | `stage-2-testimonials` | not started |
| Blog | `stage-2-blog` | not started |

## Stage 3 — Lead capture
| Module | Slug | Status |
|---|---|---|
| Quote-request flow | `stage-3-quote-flow` | not started |
| Contact form backend (serverless route + email) | `stage-3-form-backend` | not started |
| Lead persistence (free-tier Postgres) | `stage-3-lead-store` | not started |

## Stage 4 — Client portal (later)
| Module | Slug | Status |
|---|---|---|
| Auth | `stage-4-auth` | not started |
| Project status view | `stage-4-project-status` | not started |
| Invoices | `stage-4-invoices` | not started |

## Stage 5 — Polish
| Module | Slug | Status |
|---|---|---|
| SEO (metadata, sitemap, structured data) | `stage-5-seo` | not started |
| Analytics | `stage-5-analytics` | not started |
| Performance pass | `stage-5-perf` | not started |
| Regional languages | `stage-5-i18n` | not started |
