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

Deployed to GitHub Pages via `.github/workflows/deploy-spellbook.yml` on push to `main`.

## Documentation

- [`PRD.md`](./PRD.md) — Product requirements
- [`UI_Design_Spec.md`](./UI_Design_Spec.md) — Visual design and color tokens
- [`docs/tech-design/`](./docs/tech-design/) — Technical architecture docs
- [`requirements/`](./requirements/) — Feature requirement specs (FR-001 onwards)
- [`agent.md`](./agent.md) — Guide for AI agents
