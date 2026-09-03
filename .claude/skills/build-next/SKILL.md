---
name: build-next
description: Picks up the next unfinished task in BUILD_PLAN.md, implements it, verifies it builds, commits it, and checks it off. Use when asked to "do the next task", "continue the build plan", or when running the overnight queue.
---

# build-next

You are executing ONE task from `BUILD_PLAN.md` at the repo root, unattended.
Follow this procedure exactly — do not skip steps, do not do more than one
task.

1. Read `CLAUDE.md` and `DESIGN.md` at the repo root for full project context.
   These are the source of truth for architecture and visual style.
2. Read `BUILD_PLAN.md`. Find the FIRST unchecked (`- [ ]`) task, in file
   order. If none remain, stop and report "Build plan complete — nothing left
   to do."
3. Implement exactly what that task's prompt text describes. Do not expand
   scope, do not start the next task, do not refactor unrelated code.
4. Run the project's build/lint/typecheck commands (check `package.json`
   scripts — typically `npm run build`). If it fails, fix the failure before
   proceeding; do not check the task off on a broken build.
5. Stage and commit your changes with a message matching the task's short
   label, e.g. `git commit -m "1.2 Clerk auth + role-gated middleware"`.
   Never push to `main` — commit to the current branch only (the operator
   handles pushing/merging).
6. Append an entry to `ACCESS-LOG.md` using the format at the top of that
   file: files added/modified/deleted, dependencies installed, commands with
   side effects, and anything outside the project (normally "None"). Include
   it in the task commit from step 5, or amend it in.
7. Edit `BUILD_PLAN.md` to change that one task's checkbox from `- [ ]` to
   `- [x]`. Commit that as a small follow-up commit
   (`git commit -m "mark 1.2 done"`).
8. Report back in 2-3 sentences: which task you did, whether the build
   passed, and anything you were unsure about or had to assume.

If a task is ambiguous or you're missing an external credential (API key,
account not yet created), do NOT guess or fabricate one — stop, leave the
task unchecked, and clearly report what's blocking it instead of inventing a
workaround.

## Filesystem boundary (non-negotiable)

Stay inside the project folder. Reading or writing anything outside it — the
home directory, `~/.ssh`, `~/Library`, `~/Documents`, `/tmp`, another repo —
requires asking the operator for permission FIRST; if running unattended, stop
and report instead of proceeding. Never change anything at the OS root level
and never run `sudo`. Record every task's touched paths in `ACCESS-LOG.md`
(step 6).
