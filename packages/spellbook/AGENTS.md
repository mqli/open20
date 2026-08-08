# AI Agent Guidelines - Open20 Spellbook

## Monorepo Context

This package lives at `packages/spellbook/` inside the [open20 monorepo](../../AGENTS.md). Read `../../AGENTS.md` for repo-wide conventions before working here.

`open20-core` is a **workspace dependency** (`"open20-core": "workspace:*"`), not an external npm package. It lives at `packages/core/` in this same repo. Changes to core are immediately visible to spellbook — no publish step needed. However, keep changes scoped: UI concerns stay in spellbook, game logic changes go in core.

---

## Project Overview

**Open20 Spellbook** is a D&D 5e spellbook web application. It's a thin UI shell over `open20-core` for spell search, preparation tracking, and slot management.

**Tech Stack**: React 19 + TypeScript + Vite + Zustand + Radix UI + Tailwind CSS v3

**Architecture Principle**: Headless Core + UI Shell

- `open20-core` handles all game logic, rule calculations, and data management
- UI layer renders state and dispatches actions to the core library

---

## Documentation Structure

Always read the relevant documentation before implementing. The docs are split by concern:

| Document                                   | Purpose                                 | When to Read                     |
| ------------------------------------------ | --------------------------------------- | -------------------------------- |
| `PRD.md`                                   | Product requirements, user stories      | Understanding what to build      |
| `UI_Design_Spec.md`                        | Visual design, color tokens, components | UI implementation                |
| `docs/tech-design/README.md`               | Index of all tech design docs           | Start here for technical context |
| `docs/tech-design/01-architecture.md`      | Tech stack, Radix UI, UI library        | Architecture decisions           |
| `docs/tech-design/02-project-structure.md` | Folder structure                        | Creating new files               |
| `docs/tech-design/03-core-integration.md`  | open20-core integration                 | Using core functions             |
| `docs/tech-design/04-state-management.md`  | Zustand stores                          | State management                 |
| `docs/tech-design/05-ui-states.md`         | UI state machines                       | Page state logic                 |
| `docs/tech-design/06-components.md`        | Component specs                         | Building components              |
| `requirements/README.md`                   | Requirement tracking                    | Picking up tasks                 |
| `requirements/TEMPLATE.md`                 | Template for new requirements           | Creating requirements            |

### i18n Documentation

- For any translation-related work, read [`../../.agents/ui/i18n.md`](../../.agents/ui/i18n.md) first.
- Follow the current `@open20/ui` i18n API exactly (`I18nProvider` with `translationsSet` and `initialLocale`).
- If spellbook i18n behavior changes (keys, locale wiring, provider usage), update `../../.agents/ui/i18n.md` in the same change.

---

## Development Workflow

### 1. Picking Up a Requirement

1. Check `requirements/README.md` for available tasks (status: 📋 Planned)
2. Read the requirement folder: `requirements/FR-XXX/spec.md`
3. Update status to 🚧 In Progress in `requirements/README.md`
4. Read relevant tech design docs based on the requirement
5. Implement following the specifications
6. Write tests (80%+ coverage for P0)
7. Update status to ✅ Completed
8. Commit with prefix `[FR-XXX]`

### 2. Commit Message Format

```
[FR-XXX] Brief description of change

- Detailed change 1
- Detailed change 2

Closes FR-XXX
```

### 3. Creating New Requirements

1. Create folder: `requirements/FR-XXX/`
2. Copy template: `requirements/TEMPLATE.md` to `requirements/FR-XXX/spec.md`
3. Fill in the specification
4. Add to `requirements/README.md` tracking table
5. Set priority (P0/P1/P2)

---

## Naming Conventions

> **Updated**: 2026-06-10 - Unified naming across all packages.

**→ Full reference**: [`.agents/naming-conventions.md`](../../.agents/naming-conventions.md)

Key patterns:

- **Components**: PascalCase (`SpellCard.tsx`, `CharacterModal/`)
- **Hooks**: camelCase (`useBreakpoint.ts`)
- **Stores**: camelCase (`characterStore.ts`)
- **Services**: kebab-case (`character-service.ts`)
- **Feature dirs**: kebab-case (`spell-library/`)

### Migration Notes (2026-06-10)

Renamed for consistency:

- `hooks/use-breakpoint.ts` → `hooks/useBreakpoint.ts`
- `stores/character-store.ts` → `stores/characterStore.ts`
- `stores/spell-store.ts` → `stores/spellStore.ts`
- `stores/roll-store.ts` → `stores/rollStore.ts`
- `stores/ui-store.ts` → `stores/uiStore.ts`
- `components/character/CharacterSheet.tsx` → `components/character/CharacterSheet/index.tsx`

---

## Key Conventions

### File Structure

```
src/
├── components/
│   ├── ui/              # Wrapped Radix UI components (shared)
│   ├── layout/          # App shell, sidebar, header
│   ├── spell-library/   # Spell list, search, filters
│   ├── spell/           # Spell card display
│   ├── spell-slots/     # Spell slot management
│   ├── character/       # Character sheet, character modal
│   ├── class/           # Class-related components
│   └── dice/            # Dice rolling UI
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── hooks/               # Custom React hooks
```

### UI Component Library

**Always use wrapped UI components from `src/components/ui/`** - never use Radix UI directly in app components.

Available wrapped components:

- `Dialog` - Modal dialogs, flyouts
- `DropdownMenu` - Dropdown menus
- `Tabs` - Tab navigation
- `Tooltip` - Hover tooltips
- `Slider` - Range inputs
- `Switch` - Toggle switches
- `Button` - Button variants (primary, secondary, ghost, danger)
- `Badge` - Status badges, labels
- `Input` - Form inputs
- `Select` - Select dropdowns

### State Management

- Use Zustand stores from `src/stores/`
- UI state goes in `useUIStore`
- Character data goes in `useCharacterStore`
- Spell data goes in `useSpellStore`

### Code Splitting

- Modals (CustomSpellModal, CustomClassModal, ImportSpellsDialog, CharacterImportDialog, CharacterModal) are lazy-loaded with `React.lazy` + `<Suspense fallback={null}>`
- `DiceRollOverlay` from `@open20/ui` is lazy-loaded in `App.tsx`
- `exportCharacter` uses dynamic `import()` for heavy character import/export utilities
- All lazy boundaries are in `SpellLibraryLayout.tsx` (modals) and `App.tsx` (DiceRollOverlay)

### Bootstrap

- `initContent()` runs in parallel with React render in `main.tsx` — app shell renders immediately
- `SpellLibraryLayout` shows its own loading spinner while content initializes (`isLoading` state)
- `spellService` handles uninitialized state gracefully (`isReady()` check, returns `[]`)

## Performance

### Build Configuration

- `build.target: 'es2020'` — modern browser target
- `build.modulePreload.polyfill: false` — native module preload supported by all modern browsers
- `build.rollupOptions.output.manualChunks` — vendor separation for long-term browser caching:
  - `vendor-core`: `open20-core` (~107 KB)
  - `vendor-content`: `@open20/content-srd` (~705 KB)
  - `vendor-ui`: `@open20/ui` (~529 KB)

### Preconnect Hints

- `index.html` has `<link rel="preconnect" href="https://www.googletagmanager.com">` for Google Analytics

### Bundle Splits

| Chunk                         | Size (gzip)     | When loaded                       |
| ----------------------------- | --------------- | --------------------------------- |
| Main entry (index)            | 280 KB (85 KB)  | Always                            |
| vendor-core                   | 107 KB (30 KB)  | Always (cached)                   |
| vendor-content                | 705 KB (157 KB) | Always (cached)                   |
| vendor-ui                     | 529 KB (147 KB) | Always (cached)                   |
| DiceRollOverlay               | —               | First dice roll (from @open20/ui) |
| CustomSpellModal              | 4 KB (2 KB)     | Create/Edit custom spell          |
| CustomClassModal              | 18 KB (5 KB)    | Class Manager                     |
| ImportSpellsDialog            | 6 KB (2 KB)     | Import spells                     |
| CharacterImportDialog         | 8 KB (2 KB)     | Import character                  |
| CharacterModal                | —               | Mobile: Edit character            |
| character-import-export-utils | 5 KB (2 KB)     | Export character                  |

### ESLint

- `dev-dist/**` is in top-level `ignores` (PWA plugin generated files)

### Styling

- Use Tailwind CSS utility classes
- Use `class-variance-authority` (cva) for defining UI component variants (e.g. sizes, colors)
- Reference `UI_Design_Spec.md` for design tokens
- Color tokens: `--color-bg-*`, `--color-text-*`, `--color-primary-*`
- Never hardcode colors - use design tokens or Tailwind classes

### TypeScript

- Strict mode enabled
- Define types in `src/types/`
- Use `type` not `interface` for object shapes
- Export types from `src/types/index.ts`

---

## Important Rules

### DO NOT

- ❌ Create new documentation files (\*.md) unless explicitly asked
- ❌ Put game logic in spellbook that belongs in `open20-core` (`packages/core`)
- ❌ Use Radix UI directly in app components (use wrapped components)
- ❌ Hardcode colors or break design system
- ❌ Commit without reading the relevant spec
- ❌ Skip tests for P0 requirements

### DO

- ✅ Read `requirements/FR-XXX/spec.md` before implementing
- ✅ Use wrapped UI components from `src/components/ui/`
- ✅ Follow existing patterns in the codebase
- ✅ Write tests with 80%+ coverage for P0
- ✅ Use TypeScript strictly (no `any`)
- ✅ Update `requirements/README.md` when starting/completing tasks
- ✅ Use `cn()` utility alongside `cva` for conditional classes and variants

---

## Quick Reference

### Common Commands

```bash
pnpm dev             # Start dev server
pnpm dev:tunnel      # Start dev server with public tunnel URL + QR code for mobile testing
pnpm build           # Production build (tsc -b + vite build)
pnpm test            # Run tests
pnpm typecheck       # Type check only
pnpm lint            # Lint code
```

Or from the monorepo root: `pnpm --filter @open20/spellbook <script>`

### Mobile Testing

Use `pnpm dev:tunnel` (or `TUNNEL=true pnpm dev`) to start a Cloudflare tunnel with a public URL and terminal QR code. The tunnel is configured via `createTunnelPlugins()` from `@open20/config/vite` — no per-package setup needed beyond the `dev:tunnel` script and devDependencies (`vite-plugin-cloudflare-tunnel`, `qrcode`).

### Key Files to Read First

1. `requirements/README.md` - What to build
2. `docs/tech-design/README.md` - Technical context
3. `docs/tech-design/02-project-structure.md` - Where to put files
4. `UI_Design_Spec.md` - How it should look

### Dependency Graph

```
FR-001 (spell data) → FR-004 (search) → FR-005 (filtering)
FR-006 (character) → FR-007 (spell slots) → FR-010 (slot usage)
FR-008 (preparation) depends on FR-006 + FR-004
```

---

## Asking for Help

If you're unsure about:

- **What to build**: Read `PRD.md` and `requirements/FR-XXX/spec.md`
- **How to build it**: Read `docs/tech-design/` docs
- **How it should look**: Read `UI_Design_Spec.md`
- **Where to put files**: Read `docs/tech-design/02-project-structure.md`

If still unsure, ask the user for clarification before implementing.
