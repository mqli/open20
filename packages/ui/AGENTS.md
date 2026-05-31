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
├── package.json                    # ESM, private package
├── tsconfig.json                   # Dev mode (noEmit)
├── tsconfig.build.json             # Build config (output dist/)
├── tailwind.config.js              # Extends @open20/config base
├── postcss.config.js
├── .storybook/                     # Storybook config
├── src/
│   ├── index.ts                    # Barrel export for all components + types
│   ├── lib/cn.ts                   # clsx + tailwind-merge utility
│   ├── styles/design-tokens.ts     # All cva variant classes (single source of truth)
│   └── components/
│       ├── Badge/                  # 3 files: Badge.tsx, index.ts, Badge.stories.tsx
│       ├── Button/
│       ├── Dialog/                 # Radix wrapper (namespace: Dialog.Root, Dialog.Trigger, ...)
│       ├── DropdownMenu/
│       ├── EmptyState/
│       ├── FilterChip/
│       ├── IconButton/
│       ├── Input/
│       ├── SectionHeader/
│       ├── Select/
│       ├── Sheet/
│       ├── Slider/
│       ├── SlotPips/               # Spell slot pip indicator
│       ├── spell/                   # Spell-specific components
│       │   └── SpellCard/          # 3 files: SpellCard.tsx, index.ts, SpellCard.stories.tsx
│       ├── Surface/                # Generic card/panel container
│       ├── Switch/
│       ├── Tabs/
│       ├── Text/                   # Typography with variant/size/color/weight
│       ├── Toggle/
│       └── Tooltip/
└── dist/                           # Build output
```

---

## Component Patterns (MUST FOLLOW)

### 1. Three-File Rule

Every component has exactly 3 files:

```
ComponentName/
├── ComponentName.tsx        # Implementation + Props + cva
├── index.ts                 # Barrel: export { ComponentName }, export type { ComponentNameProps }
└── ComponentName.stories.tsx # Storybook stories
```

### 2. cva + cn Pattern

```tsx
// 1. Define variants with cva, referencing design-tokens
const myVariants = cva('base classes', {
  variants: {
    variant: someVariantClasses, // from design-tokens
    size: someSizeClasses,
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

// 2. Props = HTMLAttributes + VariantProps
export interface MyProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof myVariants> {
  children: ReactNode;
}

// 3. Render: cn(cva(...), className) — always merge user className last
export function MyComponent({ variant, size, className, children, ...props }: MyProps) {
  return (
    <div className={cn(myVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}
```

### 3. Design Tokens — Single Source of Truth

All variant class strings live in **`src/styles/design-tokens.ts`**, not inline in components. Components import tokens and pass them to cva.

```ts
// ✅ CORRECT — in design-tokens.ts
export const myComponentVariants = {
  primary: 'bg-primary-600 text-white',
  secondary: 'bg-bg-tertiary text-text-primary',
} as const;

// ✅ CORRECT — in component
import { myComponentVariants } from '../../styles/design-tokens';
const myVariants = cva('base', { variants: { variant: myComponentVariants } });

// ❌ WRONG — inline class strings in component
const myVariants = cva('base', {
  variants: { variant: { primary: 'bg-primary-600 text-white', ... } }
});
```

**Naming convention for tokens**:

- Domain-specific → prefix (`badgeVariants`, `spellSchoolVariants`)
- Generic/cross-cutting → no prefix (`chipBase`, `sectionDivider`, `iconSizes`, `collapseToggle`, `inlineMeta`)
- Single class strings → `CamelCaseClasses` (`overlayClasses`, `inputBaseClasses`)
- Variant objects → `camelCaseVariants` (`buttonVariants`, `surfacePaddingVariants`)

### 4. Radix UI Wrappers

Radix components use namespace exports:

```tsx
// Component file
export const Dialog = {
  Root: DialogPrimitive.Root,
  Trigger: DialogPrimitive.Trigger,
  Content: ForwardRefComponent,
  // ...
};

// index.ts — also re-export flat aliases in src/index.ts
export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
```

### 5. Reuse Existing Components

Prefer composition over duplication. SpellCard uses `Surface` + `Text`, not raw divs.

Available primitives: `Surface` (card), `Text` (typography), `Badge` (chip), `IconButton`, `Button`, `Input`, `EmptyState`, `SectionHeader`, `SlotPips`.

### Accessibility (A11y)

- Keyboard: all interactive components must be operable via keyboard (focus, Enter/Space).
- Focus styles: include visible focus-visible states; prefer Radix primitives for built-in a11y.
- ARIA: apply appropriate roles/aria-labels and semantic HTML where needed.
- Stories: include notes or stories demonstrating keyboard and screen-reader behavior.

### Testing

- Unit tests: use vitest + @testing-library/react. Place tests in a **tests** folder adjacent to the component.
- Storybook: add stories for keyboard/edge cases; run visual regression checks where available (Chromatic).
- Pre-merge checks: run `pnpm run typecheck && pnpm run lint && pnpm run build`.

### ForwardRef & typing (example)

```tsx
import React, { forwardRef } from 'react';
import { VariantProps } from 'class-variance-authority';

const buttonVariants = {
  /*...*/
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants(props as any), className)} {...props} />
));
Button.displayName = 'Button';
```

### Forbidden inline-classes (example)

❌ Wrong:

```tsx
<div className="bg-blue-500 px-2 py-1 rounded">...</div>
```

✅ Right (use design token):

```tsx
<div className={cn(buttonVariants({ variant: 'primary' }))}>...</div>
```

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

## Design Token Guidelines

### When to extract a token

- ✅ Used in 3+ places
- ✅ Complex classname string (3+ utilities)
- ✅ Variant object used by cva
- ❌ Single Tailwind utility used once
- ❌ Trivial 2-class combos like `flex items-center gap-1` — just inline

### Current token categories

| Token                                                                     | Type                 | Usage                   |
| ------------------------------------------------------------------------- | -------------------- | ----------------------- |
| `badgeVariants`, `buttonVariants`, `textVariants`, `surfaceVariants`      | Variant objects      | cva variants            |
| `overlayClasses`, `inputBaseClasses`, `dropdownContentClasses`            | String               | Single DOM element      |
| `spellSchoolVariants`                                                     | Variant object       | 8 D&D school colors     |
| `chipBase`, `inlineMeta`, `sectionDivider`, `collapseToggle`, `iconSizes` | Generic              | Cross-component reuse   |
| `closeButtonClasses`, `slider*Classes`, `slotPipStateVariants`            | Domain string/object | Single component family |

---

More on tokens: [`../../.agents/ui/design-tokens.md`](../../.agents/ui/design-tokens.md)

## DO / DON'T

### DO

- ✅ Follow the 3-file pattern for every component
- ✅ Use cva + cn() for all component styling
- ✅ Put variant classes in `design-tokens.ts`
- ✅ Reuse existing components (`Surface`, `Text`, `Badge`)
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

| File                          | Purpose                         |
| ----------------------------- | ------------------------------- |
| `src/styles/design-tokens.ts` | All cva variant class strings   |
| `src/lib/cn.ts`               | `clsx + tailwind-merge` utility |
| `src/index.ts`                | Package barrel export           |
| `tailwind.config.js`          | Extends `@open20/config` base   |

---

_Last updated: 2026-05-25_
