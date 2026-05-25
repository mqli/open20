# open20 — Agent Context

This is a pnpm monorepo for D&D 5e 2024 tools. Read this before touching anything.

---

## Repository Layout

```
open20/
├── packages/
│   ├── config/        # @open20/config: shared tsconfig + eslint presets
│   ├── core/          # open20-core: headless TS game engine (npm-publishable)
│   └── spellbook/     # @open20/spellbook: React web app (GitHub Pages)
├── turbo.json                  # build pipeline
├── pnpm-workspace.yaml
└── package.json                # root — turbo scripts only, no runtime code
```

## Package Dependency

```
@open20/spellbook  →  open20-core  (workspace:*)
```

`packages/spellbook/package.json` has `"open20-core": "workspace:*"`. pnpm symlinks directly to `packages/core`. spellbook imports from `'open20-core'` just like external consumers do — the workspace symlink is transparent.

**Core must build before spellbook.** turbo handles this automatically via `"dependsOn": ["^build"]` in `turbo.json`.

---

## Commands

### From the monorepo root (preferred)

```bash
pnpm install           # install all workspace deps; triggers `packages/core prepare` (builds core)
pnpm build             # turbo: builds core → spellbook
pnpm test              # turbo: tests all packages (after building deps)
pnpm lint              # turbo: lint all packages
pnpm typecheck         # turbo: typecheck all packages
pnpm dev               # turbo: all dev servers in parallel (--parallel)
```

### Targeting a single package

```bash
pnpm --filter open20-core <script>
pnpm --filter @open20/spellbook <script>

# Examples
pnpm --filter open20-core test
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
`packages/spellbook/eslint.config.js` — adds React hooks + react-refresh plugins.

Shared ESLint preset deps (`@eslint/js`, `typescript-eslint`, `globals`) live in `packages/config/package.json`.

---

## CI Workflows

| File | Trigger | Notes |
|------|---------|-------|
| `.github/workflows/ci.yml` | push/PR to `main` | Full build + test matrix (node 22, 24) + core artifact tests |
| `.github/workflows/deploy-spellbook.yml` | push to `main`, paths: `packages/spellbook/**` or `packages/core/**` | Deploys spellbook to GitHub Pages |
| `.github/workflows/release-core.yml` | tag `core-v*` | Full validation + GitHub Release + `.tgz` |

**Tag convention for core releases**: `core-v0.2.2` (not `v0.2.2`) — monorepo uses package-scoped tags.

---

## Known Gotchas

### 1. vitest 4.x requires vite 6+
`packages/core` uses vitest 4.x, which has `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"` as a peer dep. `packages/spellbook` uses vite 5. pnpm would pair core's vitest 4 with spellbook's vite 5 (wrong).

**Fix in place**: `packages/core/package.json` has `"vite": "^6.0.0"` in devDependencies so pnpm resolves vitest 4 with vite 6 in core's context.

### 2. `@testing-library/jest-dom` in pnpm virtual store
jest-dom declares no peer dep on vitest. pnpm doesn't wire vitest into jest-dom's resolution. When `jest-dom/vitest.mjs` does `import { expect } from 'vitest'`, it finds a different instance than the test runner → `expect.extend()` silently extends the wrong object.

**Fix in place**: `packages/spellbook/vitest.config.ts` has `server.deps.inline: ['@testing-library/jest-dom']` — vitest inlines it, ensuring the same `expect` instance. The tsconfig also has `@testing-library/jest-dom` in `types` for TS augmentation.

### 3. `Spellcasting.type` → `Spellcasting.preparationTiming`
The workspace version of `open20-core` removed `Spellcasting.type` in favour of `preparationTiming`. Spellbook was written against the older GitHub-pinned version.

**Fix in place**: `packages/spellbook/src/core/character-service.ts` uses `preparationTiming === 'long_rest'` / `'level_up'` instead of the old `type === 'preparation'` / `'known'`.

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
Each package has its own `agent.md` with package-specific conventions. Read it before working in that package.

- `packages/core/agent.md` — architecture, immutable patterns, test conventions, spell data
- `packages/spellbook/agent.md` — component structure, Zustand stores, requirements workflow
