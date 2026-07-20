# @open20/character-sheet — AGENTS.md

Character sheet web application for D&D 2024. Standalone React SPA.

---

## Package Role

`@open20/character-sheet` is a **standalone React web app** for managing D&D 2024 character sheets. It is NOT an evolution of `@open20/spellbook` — it is a separate application.

## Dependencies

```
@open20/character-sheet → @open20/ui, open20-core, @open20/content, @open20/content-srd
```

## Tech Stack

- **Runtime**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4 + `@open20/ui` design tokens
- **State**: Zustand 5
- **Icons**: lucide-react (NEVER use emojis as icons)
- **Routing**: react-router-dom 7

## Conventions

### File Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component
├── index.css             # Tailwind + ui styles
├── components/
│   ├── character/        # Character sheet UI components
│   │   ├── CharacterSheet/       # Full character sheet view
│   │   ├── HPManager/            # HP & death saves
│   │   ├── AbilityScores/        # 6 ability scores grid
│   │   ├── Skills/               # 18 skills list
│   │   ├── SavingThrows/         # 6 saving throws
│   │   ├── CombatStats/          # AC, initiative, speed, etc.
│   │   ├── WeaponAttacks/        # Weapon attack list
│   │   ├── Equipment/            # Inventory management
│   │   ├── Currency/             # CP/SP/EP/GP/PP tracker
│   │   ├── Conditions/           # Condition toggles
│   │   └── LevelUp/              # Level-up wizard
│   ├── layout/           # App shell, navigation
│   ├── dice/             # Dice rolling overlay
│   └── shared/           # Reusable UI primitives
├── stores/               # Zustand stores
│   └── characterStore.ts # Character state management
├── core/                 # Core integration layer
│   └── content-resolver.ts  # Content pack resolution
└── types/                # App-specific types
```

### Component Patterns

- Follow `@open20/ui` patterns: use `Card`, `Surface`, `Badge`, `Button`, `Tabs`, etc.
- Components receive data via props; state lives in Zustand stores
- Use `cn()` from `@open20/ui` for className merging
- Use `I18nProvider` from `@open20/ui` for i18n

### Core Integration

- All game logic comes from `open20-core` (types, mutations, engine functions, rolls)
- Content data comes from `@open20/content-srd` (species, backgrounds, feats, equipment)
- Do NOT re-implement game logic in the app layer

### State Management

- Zustand stores for character state, UI state, dice results
- Character mutations call `open20-core` functions, then update local state
- Persist to localStorage via storage adapters

### Testing

- Unit tests: Vitest + Testing Library for components
- Core integration: mock `open20-core` functions
- Test from user perspective: tap buttons, verify displayed values

## Commands

```bash
pnpm --filter @open20/character-sheet dev        # Start dev server
pnpm --filter @open20/character-sheet build      # Production build
pnpm --filter @open20/character-sheet test       # Run tests
pnpm --filter @open20/character-sheet typecheck  # Type-check only
pnpm --filter @open20/character-sheet lint       # Lint
```

## Design System

See `packages/spellbook/UI_Design_Spec.md` for the shared design system (Arcane Purple primary, Stone Gray neutral, Inter font). The character sheet app inherits the same design tokens via `@open20/ui`.

## PRD

See `PRD.md` for the full product requirements document (52 functional requirements across 18 feature groups).
