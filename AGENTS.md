# open20 — Agent Context

This is a pnpm monorepo for D&D 5e 2024 tools. Read this before touching anything.

---

## Repository Layout

```
open20/
├── packages/
│   ├── config/        # @open20/config: shared tsconfig + eslint presets
│   ├── core/          # open20-core: headless TS game engine (npm-publishable)
│   ├── spellbook/     # @open20/spellbook: React web app (GitHub Pages)
│   └── ui/            # @open20/ui: shared React component library
├── turbo.json                  # build pipeline
├── pnpm-workspace.yaml
└── package.json                # root — turbo scripts only, no runtime code
```

## Package Dependency

```
@open20/spellbook  →  @open20/ui   (workspace:*)
                 └→  open20-core   (workspace:*)
@open20/ui         →  open20-core   (workspace:*)
```

`packages/spellbook/package.json` has `"@open20/ui": "workspace:*"` and `"open20-core": "workspace:*"`. `packages/ui/package.json` also depends on `"open20-core": "workspace:*"`. pnpm symlinks directly to workspace packages, so imports work like external consumers with transparent local linking.

**Core must build before spellbook.** turbo handles this automatically via `"dependsOn": ["^build"]` in `turbo.json`.

---

## Commands

### From the monorepo root (preferred)

```bash
pnpm install           # install all workspace deps; triggers `packages/core prepare` (builds core)
pnpm build             # turbo: builds dependency graph (config/core/ui/spellbook)
pnpm test              # turbo: tests all packages (after building deps)
pnpm lint              # turbo: lint all packages
pnpm typecheck         # turbo: typecheck all packages
pnpm dev               # turbo: all dev servers in parallel (--parallel)
```

### Targeting a single package

```bash
pnpm --filter open20-core <script>
pnpm --filter @open20/ui <script>
pnpm --filter @open20/spellbook <script>

# Examples
pnpm --filter open20-core test
pnpm --filter @open20/ui storybook
pnpm --filter @open20/spellbook dev
pnpm --filter open20-core build:bundle   # browser bundle (not in turbo pipeline)
```

### Running from inside a package directory

All package scripts use `pnpm run <script>` — identical to running from root with `--filter`.

---

## Shared Configs

### `@open20/config/tsconfig/base.json`

All packages extend this base via package exports. Contains: `module`, `moduleResolution: bundler`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `resolveJsonModule`.

Each package's own tsconfig adds what's unique: `core` adds `types`, `outDir`; `spellbook` adds `jsx`, `noEmit`, `lib: [DOM]`.

### `@open20/config/eslint`

All packages import from this shared preset package. Contains: `@eslint/js` recommended + `typescript-eslint` recommended + shared rules, plus `browserConfig`.

`packages/core/eslint.config.js` — adds test-file rules.  
`packages/ui/eslint.config.js` — applies shared TS + browser config for UI package.  
`packages/spellbook/eslint.config.js` — adds React hooks + react-refresh plugins.

Shared ESLint preset deps (`@eslint/js`, `typescript-eslint`, `globals`) live in `packages/config/package.json`.

---

## CI Workflows

| File                                     | Trigger                                                                                                                                 | Notes                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.github/workflows/ci.yml`               | push/PR to `main`                                                                                                                       | Full build + test matrix (node 22, 24) + core artifact tests |
| `.github/workflows/deploy-spellbook.yml` | push to `main`, paths: `packages/spellbook/**`, `packages/core/**`, `packages/ui/**`, `packages/config/**`, or the workflow file itself | Deploys spellbook to GitHub Pages                            |
| `.github/workflows/release-core.yml`     | tag `core-v*`                                                                                                                           | Full validation + GitHub Release + `.tgz`                    |

**Tag convention for core releases**: `core-v0.2.2` (not `v0.2.2`) — monorepo uses package-scoped tags.

---

## Known Gotchas

### 1. Keep vitest and vite aligned across workspace packages

Vitest 4 requires Vite 6+ (and Node 20+ for test runs). To avoid peer-resolution drift in pnpm workspaces, keep shared versions centralized in `pnpm-workspace.yaml` catalog and avoid package-level divergence unless absolutely necessary.

**Current baseline**: workspace catalog pins `vitest` to `^4.1.7` and `vite` to `^6.4.2`, and spellbook/ui consume them via `catalog:`.

---

## Working in This Repo

### Adding a new package

1. Create `packages/<name>/` with its own `package.json`
2. Add `"extends": "@open20/config/tsconfig/base.json"` (or another exported tsconfig) to its tsconfig
3. Import shared presets from `@open20/config/eslint` in its eslint config
4. Add turbo `build`/`test` scripts to its `package.json`
5. Run `pnpm install` from root

### Modifying shared config (`packages/config/**`)

Changes affect all packages — run `pnpm build && pnpm test` from root to verify nothing broke.

### Releasing `open20-core`

1. Bump version in `packages/core/package.json`
2. Commit and push
3. Tag: `git tag core-v<version> && git push origin core-v<version>`
4. CI runs `release-core.yml` and creates the GitHub Release

### Per-package docs

Each package has its own `AGENTS.md` with package-specific conventions. Read it before working in that package.

- `packages/core/AGENTS.md` — architecture, immutable patterns, test conventions, spell data
- `packages/spellbook/AGENTS.md` — component structure, Zustand stores, requirements workflow
- `packages/ui/` — currently no package-level `AGENTS.md`; follow root `AGENTS.md` and existing patterns
