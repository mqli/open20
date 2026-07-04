# Open20 Spellbook

A D&D 5e 2024 spellbook web app — spell search, preparation tracking, and spell slot management.

Part of the [open20 monorepo](../../README.md).

## Tech Stack

- React 19 + TypeScript + Vite
- Zustand (state), Radix UI (components), Tailwind CSS v3
- `open20-core` (workspace) — all game logic

## Development

From the monorepo root:

```bash
pnpm --filter @open20/spellbook dev      # dev server
pnpm --filter @open20/spellbook build    # production build
pnpm --filter @open20/spellbook test     # run tests
```

Or from this directory:

```bash
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

> `open20-core` must be built first. Running `pnpm install` from the monorepo root handles this automatically via the `prepare` hook.

## Deploy

### GitHub Pages (Staging)

Automatically deployed to GitHub Pages on push to `main` via `.github/workflows/deploy-spellbook.yml`.

URL: `https://<user>.github.io/open20/spellbook/`

### Cloudflare Pages (Production)

Manually deployed to `https://spellbook.open-20.com` via `.github/workflows/deploy-spellbook-cloudflare.yml`.

**Trigger**: Only via `workflow_dispatch` (manual trigger) in the GitHub Actions tab.

#### Prerequisites

1. **Create a Cloudflare Pages project**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages
   - Choose "Upload assets" and create a project named `open20-spellbook`

2. **Create an API Token**:
   - Cloudflare Dashboard → My Profile → API Tokens → Create Token → Custom token
   - Permission: `Account` → `Cloudflare Pages` → `Edit`
   - Account Resources: select your account

3. **Add GitHub Secrets** (in repo Settings → Secrets and variables → Actions):

   | Secret                  | Value                                                   |
   | ----------------------- | ------------------------------------------------------- |
   | `CLOUDFLARE_API_TOKEN`  | Your API Token from step 2                              |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID (found in Dashboard sidebar) |

4. **Configure custom domain** (one-time setup):
   - After the first successful deploy, go to Cloudflare Dashboard → Workers & Pages → `open20-spellbook` → Custom domains
   - Add `spellbook.open-20.com` — Cloudflare will auto-provision DNS and SSL

#### Trigger a deploy

1. Go to GitHub Actions → "Deploy Spellbook to Cloudflare Pages"
2. Click "Run workflow" → "Run workflow"

## Documentation

- [`PRD.md`](./PRD.md) — Product requirements
- [`UI_Design_Spec.md`](./UI_Design_Spec.md) — Visual design and color tokens
- [`docs/tech-design/`](./docs/tech-design/) — Technical architecture docs
- [`requirements/`](./requirements/) — Feature requirement specs (FR-001 onwards)
- [`agent.md`](./agent.md) — Guide for AI agents
