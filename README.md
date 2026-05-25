# open20

A monorepo for D&D 5e 2024 tools.

## Packages

| Package | Path | Description |
|---------|------|-------------|
| [`open20-core`](./packages/core) | `packages/core` | Headless TypeScript game engine — rules, spells, monsters, dice, characters. Zero UI dependencies, publishable to npm. |
| [`@open20/spellbook`](./packages/spellbook) | `packages/spellbook` | React spellbook web app — spell search, preparation, slot tracking. Deployed to GitHub Pages. |

## Getting Started

```bash
pnpm install
pnpm build      # builds core first, then spellbook (turbo handles order)
pnpm test       # 826 core tests + 30 spellbook tests
```

## Development

```bash
pnpm dev        # start all dev servers in parallel (turbo)

# or target a specific package:
pnpm --filter open20-core dev
pnpm --filter @open20/spellbook dev
```

## Other Commands

```bash
pnpm lint        # lint all packages
pnpm typecheck   # type check all packages
```

## CI

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | push/PR to main | typecheck, lint, build, test all packages + core artifact tests |
| `deploy-spellbook.yml` | push to main (spellbook or core paths) | build + deploy to GitHub Pages |
| `release-core.yml` | tag `core-v*` | full core validation + GitHub Release with `.tgz` |

## Repository Layout

```
open20/
├── packages/
│   ├── config/        # @open20/config (shared tsconfig + eslint presets)
│   ├── core/          # open20-core (npm-publishable library)
│   └── spellbook/     # @open20/spellbook (web app)
├── turbo.json                  # build pipeline
├── pnpm-workspace.yaml
└── package.json
```
