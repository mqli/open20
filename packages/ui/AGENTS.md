# AI Agent Guidelines — @open20/ui

## Monorepo Context

This package lives at `packages/ui/` inside the [open20 monorepo](../../agent.md). Read `../../agent.md` for repo-wide conventions (turbo pipeline, shared configs, CI).

**Dependencies**:

- `open20-core` — workspace dependency (`"open20-core": "workspace:*"`). Imports types like `Spell`, `Character`, etc. Do NOT put game logic here — it belongs in core.
- `@open20/config` — dev dependency for shared tsconfig/eslint.

---

## Package Overview

**@open20/ui** is the shared UI component library for Open20 projects. It provides reusable, themeable React components following shadcn/ui patterns: cva variants, Radix UI primitives, Tailwind styling.

**Tech Stack**: React 19 + TypeScript + Tailwind CSS v3 + class-variance-authority (cva) + Radix UI + lucide-react

**Design Principle**: Atomic, composable components. Zero app-specific business logic. Every component is independently usable and Storybook-documented.

## Internationalization

- Read [`../../.agents/ui/i18n.md`](../../.agents/ui/i18n.md) before changing translation keys, `I18nProvider`, or i18n hooks.
- Treat [`../../.agents/ui/i18n.md`](../../.agents/ui/i18n.md) as the source of truth for current i18n API usage (`translationsSet`, `initialLocale`) and base key structure.
- When updating i18n behavior in `src/i18n/` or i18n-enabled components, update `../../.agents/ui/i18n.md` in the same change.

---

## Directory Structure

```
packages/ui/
├── AGENTS.md                        # This file
├── package.json                     # ESM, private package
├── tsconfig.json                    # Dev mode (noEmit)
├── tsconfig.build.json              # Build config (output dist/)
├── tailwind.config.js                # Extends @open20/config base
├── postcss.config.js
├── .storybook/                      # Storybook config
├── src/
│   ├── index.ts                     # Barrel export for all components + types
│   ├── lib/cn.ts                    # clsx + tailwind-merge utility
│   ├── styles/
│   │   ├── design-tokens.ts          # All cva variant classes (single source of truth)
│   │   └── index.css                # Theme variables (@theme + dark overrides)
│   └── components/
│       ├── CardSurface/              # Shared clickable card wrapper (accessibility + glow)
│       ├── CardMetaItem/             # Shared icon+label inline meta component
│       ├── [ComponentName]/         # Each follows Three-File Rule (ComponentName.tsx, index.ts, ComponentName.stories.tsx)
│       ├── Dialog/                  # Radix UI wrappers (namespace exports)
│       ├── feat/                    # FeatCard component
│       ├── spell/                   # Spell-specific components (e.g., SpellCard)
│       └── ...                      # Other shared UI components
└── dist/                            # Build output
```

---

## Component Patterns (MUST FOLLOW)

Full code examples: [`../../.agents/ui/component-patterns.md`](../../.agents/ui/component-patterns.md)

### 1. Three-File Rule

Every component has exactly 3 files: `ComponentName.tsx`, `index.ts`, `ComponentName.stories.tsx`.

### 2. cva + cn Pattern

Define variants with `cva()`, type props with `VariantProps`, render with `cn(cva(...), className)`. See `component-patterns.md` for full example.

### 3. Design Tokens — Single Source of Truth

All variant class strings live in **`src/styles/design-tokens.ts`**, not inline. Import tokens and pass to cva.

**Naming convention**:

- Domain-specific → prefix (`badgeVariants`, `spellSchoolVariants`)
- Generic/cross-cutting → no prefix (`chipBase`, `sectionDivider`)
- Single class strings → `CamelCaseClasses` (`overlayClasses`)
- Variant objects → `camelCaseVariants` (`buttonVariants`)

**When to extract a token** (see [`../../.agents/ui/design-tokens.md`](../../.agents/ui/design-tokens.md)):

- ✅ Used in 3+ places, complex classname (3+ utilities), or variant object used by cva
- ❌ Single utility used once, or trivial 2-class combos

### 4. Radix UI Wrappers

Use namespace exports (`Dialog.Root`, `Dialog.Trigger`, etc.) plus flat aliases in `src/index.ts`. See `component-patterns.md`.

### 5. Reuse Existing Components

Prefer composition over raw divs. Available primitives: `Surface`, `Text`, `Badge`, `IconButton`, `Button`, `Input`, `EmptyState`, `SectionHeader`, `SlotPips`.

**Shared card primitives** (use these instead of duplicating card logic):

- `CardSurface` — clickable card wrapper (accessibility: `role`/`tabIndex`/`onKeyDown`), optional glow, `density` gap variant. Used by `SpellCard`, `FeatCard`, and any future card.
- `CardMetaItem` — icon + label inline pair for meta rows. Replaces hand-rolled icon+text spans.

### Accessibility (A11y)

Keyboard operable, visible `focus-visible` states, appropriate ARIA roles, Storybook a11y stories. Prefer Radix primitives for built-in a11y.

### Testing

Unit tests (vitest + @testing-library/react) in `__tests__/` folder within each component directory. Storybook for edge cases. Pre-merge: `typecheck && lint && build`.

### ForwardRef & typing

Use `forwardRef` + `VariantProps`. See `component-patterns.md` for example.

### Forbidden

❌ Inline classnames in components — always use design tokens.

---

## Commands

From `packages/ui/` or root with `--filter @open20/ui`:

```bash
pnpm run typecheck    # tsc --noEmit
pnpm run build        # tsc -p tsconfig.build.json → dist/
pnpm run lint         # eslint src/
pnpm run storybook    # Storybook dev server at :6006
```

**Minimum before commit**:

```bash
pnpm run typecheck && pnpm run lint && pnpm run build
```

---

## Adding a New Component

1. Create `src/components/ComponentName/` with 3 files (see §Component Patterns)
2. If needed, add variant classes to `src/styles/design-tokens.ts`
3. Barrel-export in `src/index.ts`:
   ```ts
   export { ComponentName } from './components/ComponentName/index';
   export type { ComponentNameProps } from './components/ComponentName/index';
   ```
4. Write at least 2 Storybook stories (default + variant)
5. Run `typecheck && lint && build` before committing

---

More on tokens: [`../../.agents/ui/design-tokens.md`](../../.agents/ui/design-tokens.md)

## DO / DON'T

### DO

- ✅ Follow the 3-file pattern for every component
- ✅ Use cva + cn() for all component styling
- ✅ Put variant classes in `design-tokens.ts`
- ✅ Reuse existing components (`Surface`, `Text`, `Badge`, `CardSurface`, `CardMetaItem`)
- ✅ For any new card-like component, use `CardSurface` (not raw `Surface`) to get clickable accessibility + glow for free
- ✅ Write Storybook stories for every component
- ✅ Import types from `open20-core` (NOT copy/duplicate)
- ✅ Run `typecheck && lint && build` before committing
- ✅ Use `lucide-react` for icons

### DON'T

- ❌ Put game logic in this package — it belongs in `open20-core`
- ❌ Hardcode classnames inline in components — use design tokens
- ❌ Create new documentation files (\*.md) unless explicitly asked
- ❌ Add app-specific concerns (routing, stores, API calls)
- ❌ Use `any` type — strict TypeScript only
- ❌ Create components without Storybook stories

---

## Quick Reference

| Task       | Command                                                 |
| ---------- | ------------------------------------------------------- |
| Type check | `pnpm run typecheck`                                    |
| Build      | `pnpm run build`                                        |
| Lint       | `pnpm run lint`                                         |
| Storybook  | `pnpm run storybook`                                    |
| All checks | `pnpm run typecheck && pnpm run lint && pnpm run build` |

| File                           | Purpose                          |
| ------------------------------ | -------------------------------- |
| `src/styles/design-tokens.ts`  | All cva variant class strings    |
| `src/lib/cn.ts`                | `clsx + tailwind-merge` utility  |
| `src/index.ts`                 | Package barrel export            |
| `src/components/CardSurface/`  | Shared clickable card wrapper    |
| `src/components/CardMetaItem/` | Shared icon+label meta component |
| `tailwind.config.js`           | Extends `@open20/config` base    |
| `.storybook/`                  | Storybook config                 |

---

_Last updated: 2026-05-25_
