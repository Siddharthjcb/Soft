# Setup & pipeline

One-time steps to connect this project to GitHub and get the CI/CD pipeline
running. Repo: <https://github.com/Siddharthjcb/Soft>

## 0. Local prerequisites

```sh
sudo xcodebuild -license        # accept — git is disabled until you do this
nvm install 22 && nvm use 22    # match CI (see .nvmrc); Node 23 breaks some tooling
```

## 1. Connect the local project to the repo

From the project root:

```sh
git init -b main
git add -A
git commit -m "chore: scaffold Next.js app and CI pipeline"
git remote add origin git@github.com:Siddharthjcb/Soft.git   # or the https URL
git push -u origin main
```

## 2. Verify CI

Open the repo's **Actions** tab. The `CI` workflow (`.github/workflows/ci.yml`)
runs on every push to `main` and every PR into `main`:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

The first run (on the initial push to `main`) should go green.

## 3. Protect `main`

GitHub → repo **Settings → Branches → Add branch ruleset** (or classic branch
protection) for `main`:

- Require a pull request before merging.
- Require status checks to pass → select **verify**.
- (Optional) Require branches to be up to date before merging.

After this, all work happens on short-lived branches → PR → squash merge.

## 4. Hosting — Vercel (free Hobby tier)

1. <https://vercel.com/new> → import `Siddharthjcb/Soft`.
2. Framework preset: **Next.js** (auto-detected). Build/output settings: leave
   defaults. No environment variables needed yet.
3. Deploy. `main` becomes production; every PR gets its own preview URL.
4. Add a custom domain later under the Vercel project's **Domains** tab
   (the only sanctioned recurring cost).

Do **not** add deploy logic to GitHub Actions — Vercel owns deploys; Actions
only verifies.

## Daily workflow

```sh
git switch -c feat/<thing>
# ...work...
npm run lint && npm run typecheck && npm run build
git push -u origin feat/<thing>
# open PR → CI runs → preview deploy → review → squash merge
```
