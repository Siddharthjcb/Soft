---
name: module-prompt
description: >-
  Generate a standardized, agent-ready implementation prompt for one module of
  the marketing website build. Use whenever the user asks to "build a prompt",
  "make a module prompt", "draft a prompt for <feature>", or wants to hand a
  self-contained task to an implementation agent. Produces a single prompt block
  with shared project context pre-loaded, scoped work, acceptance criteria, a
  test plan, and a fixed report-back format.
---

# Module prompt factory

You turn a short request ("build the pricing page", "set up GitHub CI") into a
complete prompt an implementation agent can run start to finish without needing
this chat's history.

## Steps

1. Read `CLAUDE.md` for north-star context (company, customer, stack,
   conventions, environments, cost discipline).
2. Read `docs/modules/README.md` for the stage/module map. If a spec file for
   this module exists in `docs/modules/`, read it and use it as the source of
   truth; reconcile any conflict with the user before writing the prompt.
3. Ask the user only for what is genuinely missing and would change the output
   (e.g. exact pricing numbers, copy, a design reference). Do not ask about
   things already fixed in `CLAUDE.md`.
4. Emit the prompt using the template below, filled in — no placeholders left.
5. Offer to save it to `docs/modules/<stage>-<slug>.prompt.md`.

## Output template

Emit exactly this structure inside one fenced block so the user can copy it:

    # Module: <name>  (Stage <n>)

    ## Context
    You are implementing one module of a Next.js (App Router, TypeScript,
    Tailwind, npm) marketing website for a solo software studio that sells
    websites and apps to small businesses in India (canonical customer: a small
    restaurant wanting an affordable, good-quality site). Hosting is Vercel
    Hobby; `main` is production; every PR gets a preview deploy; CI runs
    lint + typecheck + `next build` on PRs only. Conventional Commits.
    Mobile-first and accessible are required. Prefer free tiers; flag any new
    recurring cost. Full project context: read `CLAUDE.md` in the repo root.

    ## Objective
    <one or two sentences: the outcome, not the steps>

    ## In scope
    - <bullet>

    ## Out of scope
    - <bullet — things an agent might wrongly pull in>

    ## Design & UX notes
    - <layout, states, breakpoints, copy tone, references>

    ## Files to create / modify
    - `<path>` — <why>

    ## Implementation steps
    1. <ordered, concrete>

    ## Acceptance criteria
    - [ ] <verifiable statement>
    - [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass
    - [ ] Renders correctly at 375px and 1280px widths
    - [ ] No new recurring cost introduced (or: cost flagged and approved)

    ## Test plan
    - <what to check manually / what tests to add>

    ## Report back
    When done, reply with: branch name, list of files changed, how each
    acceptance criterion was verified, any deviations from this spec and why,
    and follow-ups you recommend.

## Rules

- One module = one prompt = one PR-sized unit of work. If a request is bigger,
  split it and say so.
- Never leave a placeholder in the emitted prompt. If you can't fill one, ask.
- Keep the prompt self-contained: an agent with only the repo and this prompt
  should be able to finish it.
- If the module depends on another module that isn't done, state the dependency
  at the top of the prompt.
