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

## Key Conventions

### File Structure

```
src/
├── components/
│   ├── ui/              # Wrapped Radix UI components (shared)
│   ├── layout/          # App shell, sidebar, header
│   ├── spell-library/   # Spell list, search, filters
│   ├── character-sheet/ # Character view, spell slots
│   └── character-setup/ # Character creation/editing
├── stores/              # Zustand stores
├── services/            # localStorage, API clients
├── utils/               # Helpers, formatters
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
pnpm build           # Production build (tsc -b + vite build)
pnpm test            # Run tests
pnpm typecheck       # Type check only
pnpm lint            # Lint code
```

Or from the monorepo root: `pnpm --filter @open20/spellbook <script>`

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
