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
├── lib/                  # Pure app-level helpers (point-buy / standard-array tables)
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

## PRD & Implementation Tasks

- `PRD.md` — full product requirements (64 functional requirements, FR-100~163, across 19 feature groups).
- `Wireframe_Design.md` — UI wireframes and core-integration patterns.
- `tasks/` — **implementation task specs for agents.** Start at `tasks/README.md`: it carries the verified API surface (core/ui/content), the golden-path architecture, corrections to the PRD/wireframe, and the phased task index (`phase-0-foundation.md` → `phase-3-p2.md`). Read it before implementing any feature.

## Task Progress Tracking

**Each task in the phase files carries a status marker** — append one of these to the task header line (e.g., `### T-101 — HpBar — ✅ done`):

| Marker | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| (none) | Pending — not started                                      |
| `⏳`   | In progress — one agent owns it                            |
| `✅`   | Done — code committed, tests green, typecheck + lint clean |
| `🔒`   | Blocked — blocked by an unfinished dependency              |

**Agents must update the task marker in the phase file when they:**

1. Claim a task → add `⏳`
2. Complete a task (code + tests + verify) → change to `✅`
3. Hit a blocker → add `🔒` with a note

**Before starting a task**, check: is it already claimed (`⏳`)? Is every task in its "Depends on" list marked `✅`? Is it gated by a Phase 0.5 extension that isn't done? If any of these is true, pick a different task or resolve the dependency.

### Current Progress (2026-08-03)

**Phase 0 (Foundation):**

- ✅ T-001 PWA config
- ✅ T-002 breakpoint hook
- ✅ T-003 App providers + bootstrap
- ✅ T-004 AppShell scaffold
- ✅ T-005 ContentResolver
- ✅ T-006 rollAdapter
- ✅ T-007 StorageService
- ✅ T-008 characterStore
- ✅ T-009 test fixtures

**Phase 0.5 (Core extensions):** ALL COMPLETE (T-010–T-016)

**Phase 1 (P0 UI):**

- ✅ T-101 HpBar
- ✅ T-102 DeathSavesTracker
- ✅ T-103 Ability Scores
- ✅ T-104 SkillRow
- ✅ T-105 SkillsList (extracted component from ContentArea)
- ✅ T-106 SavingThrows
- ✅ T-107 CombatStatCard
- ✅ T-108 CombatStatsBar
- ✅ T-109 WeaponAttackCard
- ✅ T-110 WeaponAttacksList (dual-roll via rollWeaponAttack in adapter)
- ✅ T-111 SpeciesPanel
- ✅ T-112 BackgroundPanel
- ✅ T-114 SpellcastingHeader
- ✅ T-115 SpellSlotRow
- ✅ T-118 RestActions (including LongRestDialog)
- ✅ T-113 Feats (FeatCard + list)
- ✅ T-116 PreparedSpellList (Prepared/Known toggle, class groups, feat spells, cast button)
- ✅ T-117 ConcentrationBanner (amber banner, CON save prompt, end concentration)
- ✅ T-119 CharacterSelector (multi-character modal with create/switch/delete)
- ✅ T-120 CharacterCreateWizard (3 steps; point buy / standard array / manual)
- ✅ T-121 CharacterEditDialog (edit any character field — completes CRUD alongside T-120)
- ✅ T-122 DeleteConfirm (confirmation dialog for character deletion)
- ✅ T-127 Sheet assembly (accordion layout)
- ✅ T-128 App states (loading skeleton, reduced-motion, error polish)
- ��� 4 remaining P0 tasks: T-123~T-126

**Phase 2 (P1) and Phase 3 (P2):** Not started.

### Unblocked tasks to pick up next

The highest-value unblocked P0 tasks, in recommended order:

| Task        | What                                             | Why first                                                             |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| T-123–T-126 | HeroCard / HeroStrip / Sidebar / MobileBottomBar | Already built and wired — they need tests plus small spec gaps closed |

All Phase 0.5 core extensions (T-010–T-016) are done, so T-219 (inspiration), T-208 (exhaustion) and T-215 (senses) are **unblocked**.
