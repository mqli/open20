# Open20 Monorepo — Naming Conventions

> **Last updated**: 2026-06-10
> **Applies to**: `packages/core`, `packages/ui`, `packages/spellbook`

---

## File & Directory Naming

| Type                        | Convention     | Example                | Rationale                         |
| --------------------------- | -------------- | ---------------------- | --------------------------------- |
| **React Components (.tsx)** | PascalCase     | `SpellCard.tsx`        | React ecosystem standard          |
| **Component Directories**   | PascalCase     | `SpellCard/`           | Matches `@open20/ui` package      |
| **Feature Directories**     | kebab-case     | `spell-library/`       | Readability for multi-word names  |
| **Hooks (.ts)**             | camelCase      | `useBreakpoint.ts`     | React hooks must start with `use` |
| **Stores (.ts)**            | camelCase      | `characterStore.ts`    | Zustand convention                |
| **Services/Utils (.ts)**    | kebab-case     | `character-service.ts` | Consistent with core package      |
| **Test Files**              | `*.test.ts(x)` | `SpellCard.test.tsx`   | Vitest convention                 |
| **Test Directories**        | `__tests__/`   | `__tests__/`           | Colocate tests with code          |
| **Index Files**             | `index.ts(x)`  | `index.ts`             | Barrel export standard            |
| **Types (.ts)**             | camelCase      | `types.ts`             | TypeScript convention             |

---

## Package-Specific Patterns

### `packages/core/` (Headless Engine)

```
src/
├── types/              # Type definitions (lowercase)
│   ├── ability.ts
│   ├── spell.ts
│   └── index.ts
├── dice/               # Pure functions (lowercase)
│   ├── core.ts
│   └── index.ts
├── engine/             # Rule calculations (lowercase)
│   ├── ability-modifier.ts
│   └── spell-slots.ts
├── character/          # Entity state (lowercase)
│   ├── create.ts
│   ├── mutate.ts
│   └── index.ts
└── spells/             # Spell queries (lowercase)
    ├── query.ts
    └── index.ts
```

**Naming Rules**:

- Directories: lowercase (single word)
- Files: kebab-case
- Functions: `calculate*` or `get*` (engine), `create*` or `modify*` (entities)

---

### `packages/ui/` (Component Library)

```
src/
├── components/
│   ├── base/                  # Base UI components (lowercase)
│   │   ├── Button/            # Component directory (PascalCase)
│   │   │   ├── Button.tsx
│   │   │   ├── index.ts
│   │   │   ├── storybook/
│   │   │   └── __tests__/
│   │   ├── Dialog/            # Radix wrapper (PascalCase)
│   │   │   ├── Dialog.tsx
│   │   │   └── index.ts
│   │   └── Surface/
│   ├── spell/                 # Feature directory (lowercase)
│   │   ├── SpellCard/
│   │   └── SpellEditor/
│   └── rules/                 # Feature directory (lowercase)
│       ├── FeatCard/
│       └── GlossaryTerm/
├── hooks/                     # Hooks (lowercase directory)
│   └── useTranslation.ts
├── styles/                    # Design tokens (lowercase)
│   └── design-tokens.ts
└── lib/                       # Utilities (lowercase)
    └── cn.ts
```

**Naming Rules**:

- Base components: `Button/`, `Dialog/` (PascalCase)
- Feature groups: `spell/`, `rules/` (lowercase)
- Every component: 4-file pattern (`.tsx`, `index.ts`, `storybook/`, `__tests__/`)

---

### `packages/spellbook/` (Web Application)

```
src/
├── components/
│   ├── character/             # Feature directory (lowercase)
│   │   ├── CharacterModal/    # Component (PascalCase)
│   │   │   ├── CharacterModal.tsx
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   ├── CharacterSheet/    # Component (PascalCase)
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── index.ts
│   │   │   ├── ClassSpellSection.tsx
│   │   │   └── __tests__/
│   │   └── CharacterBar.tsx  # Standalone component
│   ├── spell/                 # Feature directory (lowercase)
│   │   ├── SpellCard.tsx
│   │   └── SpellCardActions.tsx
│   ├── spell-library/         # Feature directory (kebab-case)
│   │   ├── FilterChips.tsx
│   │   ├── SearchBar.tsx
│   │   └── SpellDetailFlyout.tsx
│   └── ui/                    # Shared UI wrappers (lowercase)
│       └── LanguageSwitcher.tsx
├── hooks/                      # Hooks (lowercase directory)
│   ├── useBreakpoint.ts
│   ├── useSpellCapabilities.ts
│   └── useSpellCastLevel.ts
├── stores/                     # Zustand stores (lowercase directory)
│   ├── characterStore.ts
│   ├── spellStore.ts
│   ├── rollStore.ts
│   └── uiStore.ts
├── core/                       # Service layer (lowercase directory)
│   ├── character-service.ts
│   ├── spell-service.ts
│   └── storage-service.ts
├── utils/                      # Utilities (lowercase directory)
│   └── helpers.ts
└── i18n/                      # Internationalization (lowercase)
    └── index.tsx
```

**Naming Rules**:

- Hooks: camelCase (`useBreakpoint.ts`, not `use-breakpoint.ts`)
- Stores: camelCase (`characterStore.ts`, not `character-store.ts`)
- Services: kebab-case (`character-service.ts`)
- Feature directories: kebab-case for multi-word (`spell-library/`)
- Component directories: PascalCase (`CharacterModal/`)

---

## Import Path Conventions

### Using `@/` Alias (spellbook)

```typescript
// Hooks
import { useBreakpoint } from '@/hooks/useBreakpoint';

// Stores
import { useCharacterStore } from '@/stores/characterStore';

// Services
import { characterService } from '@/core/character-service';

// Components
import { CharacterSheet } from '@/components/character/CharacterSheet';
```

### Using Relative Paths (core)

```typescript
// Within same directory
import { calculateModifier } from './ability-modifier';

// Parent directory
import { Character } from '../types';

// Test files (always use relative)
import { calculateModifier } from '../../src/engine/ability-modifier';
```

---

## Test File Conventions

### File Naming

```
ComponentName.test.tsx        # Component tests
hook-name.test.ts             # Hook tests (use the file name, not camelCase)
service-name.test.ts          # Service tests
```

### Directory Placement

```
# Option A: Colocated __tests__/ directory (preferred)
components/Button/__tests__/Button.test.tsx

# Option B: Mirror src/ structure in tests/ directory
tests/engine/ability-modifier.test.ts
```

**Current usage**:

- `packages/core`: `tests/` mirror structure
- `packages/ui`: `__tests__/` colocated
- `packages/spellbook`: `__tests__/` colocated

---

## Migration Log

### 2026-06-10 (spellbook)

**Renamed for consistency**:

- `hooks/use-breakpoint.ts` → `hooks/useBreakpoint.ts`
- `stores/character-store.ts` → `stores/characterStore.ts`
- `stores/spell-store.ts` → `stores/spellStore.ts`
- `stores/roll-store.ts` → `stores/rollStore.ts`
- `stores/ui-store.ts` → `stores/uiStore.ts`
- `components/character/CharacterSheet.tsx` → `components/character/CharacterSheet/index.tsx`

**Updated documentation**:

- Added "Naming Conventions" section to `packages/spellbook/AGENTS.md`
- Created `.agents/naming-conventions.md` (this file)

---

## Enforcement

### Lint Rules

Add to `packages/config/eslint/`:

```javascript
// Enforce hook naming (must start with "use")
rules: {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
}

// Enforce camelCase for hooks
plugins: ['unicorn'],
rules: {
  'unicorn/filename-case': ['error', {
    cases: {
      hook: 'camelCase',
      store: 'camelCase',
      component: 'PascalCase',
    }
  }]
}
```

### Pre-commit Hooks

Already configured via `lint-staged` in `packages/spellbook/package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

---

## Checklist for New Code

- [ ] File name follows convention (PascalCase/camelCase/kebab-case)
- [ ] Directory name follows convention (PascalCase/lowercase/kebab-case)
- [ ] Import paths use `@/` alias (spellbook) or relative paths (core)
- [ ] Test file created with `*.test.ts(x)` naming
- [ ] Component follows 4-file pattern (if in `packages/ui/`)
- [ ] No `any` types (run `pnpm typecheck`)
- [ ] No lint errors (run `pnpm lint`)

---

## References

- React Naming Conventions: https://reactjs.org/docs/components-and-props.html
- TypeScript Naming: https://typescript.tv/naming-conventions/
- Zustand Stores: https://docs.pmnd.rs/zustand/getting-started/introduction
- Vitest Naming: https://vitest.dev/guide/#writing-tests
