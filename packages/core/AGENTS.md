# Agent Context Document

> **Purpose**: This document provides essential context, conventions, and guidelines for AI agents (Codex, Claude, etc.) working on the Open20 Core project. Read this before making any changes.

---

## 0. Monorepo Context

This package lives at `packages/core/` inside the [open20 monorepo](../../AGENTS.md). Read `../../AGENTS.md` for repo-wide conventions (turbo pipeline, shared configs, CI).

**Working directory**: `packages/core/` (or use `--filter open20-core` from root).  
**Release tags**: `core-v*` (e.g. `core-v0.2.2`) — not bare `v*`.

---

## 1. Project Overview

**Project**: Open20 Core - Headless D&D 5e 2024 Game Engine  
**Goal**: A TypeScript library for D&D 5e 2024 rules engine, spell management, and character management. No UI - pure logic, testable via unit tests, usable by any framework.  
**Status**: S1-S21 complete (653 tests passing)

### Key Design Decisions

- **Headless**: Zero UI dependency. Pure functions, immutable state.
- **Immutable State**: All Character fields are `readonly`. Modifications return new objects via spread operator. No Immer/Immutable.js.
- **ESM**: Project uses `"type": "module"`. Uses native ESM JSON imports (vitest supports `import data from './file.json'`).
- **Zod Schemas**: Runtime validation for all data structures.
- **Content Separation**: SRD content lives in the `@open20/content-srd` package. Core provides type interfaces and content pack utilities.

### Package Dependencies

- `open20-core` (this package): Pure engine, no content data
- Consumers (e.g., `spellbook`, `rulebook`): Install core + content packs, use content pack registration from `@open20/content`

---

## 2. Architecture & Module Dependencies

### 2.1 Layered Architecture

The codebase is organized into 4 layers with unidirectional dependencies:

```
L1: Foundation  ←  L2: Mechanics  ←  L3: Entities  ←  L4: Application
types/, dice/        engine/, spells/    character/,        rolls/
                                       monster/
```

**Dependency Rules**:

- **L1 (Foundation)**: No dependencies on other modules
- **L2 (Mechanics)**: Can import from L1 only
- **L3 (Entities)**: Can import from L1 and L2 only
- **L4 (Application)**: Can import from L1, L2, and L3

### 2.2 Dependency Matrix

| Module       | CAN Import From                                                   | CANNOT Import From                                       |
| ------------ | ----------------------------------------------------------------- | -------------------------------------------------------- |
| `types/`     | (nothing)                                                         | (anything)                                               |
| `dice/`      | `types/`                                                          | `engine/`, `spells/`, `character/`, `monster/`, `rolls/` |
| `engine/`    | `types/`, `dice/`                                                 | `spells/`, `character/`, `monster/`, `rolls/`            |
| `spells/`    | `types/`, `dice/`                                                 | `engine/`, `character/`, `monster/`, `rolls/`            |
| `character/` | `types/`, `dice/`, `engine/`, `spells/`                           | `monster/`, `rolls/`                                     |
| `monster/`   | `types/`, `dice/`, `engine/`, `spells/`                           | `character/`, `rolls/`                                   |
| `rolls/`     | `types/`, `dice/`, `engine/`, `spells/`, `character/`, `monster/` | (nothing - top layer)                                    |
| `storage/`   | `types/`, `character/`                                            | `engine/`, `spells/`, `monster/`, `rolls/`               |

**Import path convention**: Use relative paths (e.g., `../types`, `../../engine/ability-modifier`). Do NOT use `@/` aliases in test files (Vitest doesn't resolve them reliably).

---

## 3. Directory Structure

```
packages/core/                  # path inside monorepo
├── AGENTS.md                   # This file
├── PRD.md                     # Product Requirements Document
├── package.json                # ESM, vitest, typescript
├── tsconfig.json               # Strict, noUncheckedIndexedAccess
├── vitest.config.ts            # Test config
├── scripts/
│   ├── bundle.mjs             # Browser bundle builder (esbuild)
│   └── release.mjs            # Release automation
├── spec/
│   ├── high-level-design.md    # HLD v3.0 (Layered Architecture)
│   ├── data-model.md           # TypeScript interfaces & JSON schema
│   └── test-plan.md           # Test plan and coverage goals
├── requirements/
│   └── README.md               # R1-R26 requirements traceability
├── src/
│   ├── index.ts                # Barrel export
│   │
│   ├── types/                  # L1: Foundation - Type definitions (zero dependencies)
│   │   ├── ability.ts
│   │   ├── skill.ts
│   │   ├── damage.ts
│   │   ├── attack.ts          # BaseAttack (shared)
│   │   ├── character.ts
│   │   ├── species.ts
│   │   ├── background.ts
│   │   ├── class.ts
│   │   ├── feat.ts
│   │   ├── equipment.ts
│   │   ├── spell.ts
│   │   ├── resource.ts
│   │   ├── monster.ts         # MonsterSize, MonsterType, etc.
│   │   └── index.ts           # Barrel export
│   │
│   ├── dice/                   # L1: Foundation - Pure dice rolling (zero dependencies)
│   │   ├── core.ts
│   │   └── index.ts
│   │
│   ├── engine/                 # L2: Mechanics - Pure rule calculations (depends on L1)
│   │   ├── ability-modifier.ts
│   │   ├── proficiency-bonus.ts
│   │   ├── skill-bonus.ts
│   │   ├── saving-throw.ts
│   │   ├── ac-calculator.ts
│   │   ├── hp-calculator.ts
│   │   ├── spell-slots.ts
│   │   ├── initiative.ts
│   │   ├── passive-perception.ts
│   │   ├── attack-calculator.ts
│   │   ├── damage-calculator.ts
│   │   └── index.ts
│   │
│   ├── spells/                 # L2: Mechanics - Spell queries (depends on L1)
│   │   ├── query.ts           # getSpell(), searchSpells(), etc.
│   │   └── index.ts
│   │
│   ├── character/              # L3: Entities - Character state & mutations (depends on L1, L2)
│   │   ├── create.ts          # createCharacter()
│   │   ├── mutate/            # Mutation functions (by domain)
│   │   │   ├── hp.ts
│   │   │   ├── conditions.ts
│   │   │   ├── currency.ts
│   │   │   ├── equipment.ts
│   │   │   ├── resources.ts
│   │   │   ├── spells.ts
│   │   │   └── index.ts
│   │   ├── rest.ts            # shortRest(), longRest()
│   │   ├── level-up.ts        # levelUp()
│   │   ├── validate.ts        # validateCharacter()
│   │   ├── recompute.ts       # recomputeDerivedStats()
│   │   ├── spells-init.ts     # Spell initialization
│   │   └── index.ts           # Barrel export
│   │
│   ├── monster/               # L3: Entities - Monster state & queries (depends on L1, L2)
│   │   ├── types.ts           # Monster interface
│   │   ├── calculator.ts      # getMonsterProficiencyBonus(), etc.
│   │   ├── combat.ts          # applyDamage(), addCondition(), etc.
│   │   └── index.ts           # Barrel export
│   │
│   ├── rolls/                  # L4: Application - Apply mechanics to entities (depends on L1+L2+L3)
│   │   ├── character.ts       # rollCharacterSkillCheck(), etc.
│   │   ├── monster.ts         # rollMonsterAttack(), etc.
│   │   └── index.ts
│   │
│   ├── content/                # Content pack types & utilities
│   │   ├── types.ts           # ContentPack, ContentPackMeta interfaces
│   │   └── index.ts           # Barrel export
│   │
│   └── storage/                # Persistence (interface + implementations)
│       ├── interface.ts        # ICharacterStorage interface
│       ├── serializer.ts       # JSON serialize/deserialize
│       ├── memory.ts           # InMemoryStorage (for tests)
│       └── index.ts           # Barrel export
│
├── dist/                      # Build output
│
└── tests/
    ├── engine/                   # L2: Mechanics unit tests
    ├── character/                # L3: Character tests
    ├── monster/                  # L3: Monster tests
    ├── rolls/                    # L4: Application tests
    ├── spells/                   # L2: Spell tests
    ├── storage/                  # Persistence tests
    └── integration/              # Integration tests
```

---

## 4. TypeScript Conventions

### 4.1 Strict Settings

- `strict: true`
- `noUncheckedIndexedAccess: true` → **ALL array/object accesses return `T | undefined`**
- `moduleResolution: "bundler"` (NOT "Node16" - avoids forcing `.js` extensions)

### 4.2 Handling `noUncheckedIndexedAccess`

**WRONG** (will cause TypeScript error):

```typescript
const bonus = array[index]; // Type: number | undefined
const value = obj[key]; // Type: number | undefined
```

**RIGHT**:

```typescript
const bonus = array[index] ?? 0;  // Provide default
const value = obj[key]!;          // Non-null assertion (only if you're SURE it exists)
const value = obj[key] ?? default; // Safe access with fallback
```

### 4.3 Immutable Update Pattern

ALL mutation functions MUST return a new object. Use spread operator:

```typescript
// ✅ CORRECT
export function modifyHP(char: Character, delta: number): Character {
  return {
    ...char,
    hitPoints: {
      ...char.hitPoints,
      current: Math.max(0, char.hitPoints.current + delta),
    },
    updatedAt: new Date().toISOString(),
  };
}

// ❌ WRONG - mutates original object
export function modifyHP(char: Character, delta: number): Character {
  char.hitPoints.current += delta; // MUTATION!
  return char;
}
```

### 4.4 Function Naming Conventions (by Layer)

#### L1: Foundation

- `types/`: Type definitions only (no functions)
- `dice/core.ts`: `rollDie()`, `rollDice()`, `parseDiceExpression()`, etc.
  - Pure dice rolling, no game logic

#### L2: Mechanics

- `engine/`: `calculate*` (pure calculations), `get*` (lookups)
  - `calculateAC()`, `getModifier()`, `getSkillBonus()`, etc.
- `spells/`: `get*` (queries), `search*` (filter operations)
  - `getSpell()`, `searchSpells()`, etc.

#### L3: Entities

- `character/`: `create*` (creation), `modify*` (mutations), `apply*` (apply effects)
  - `createCharacter()`, `modifyHP()`, `applyDamage()`, etc.
- `monster/`: `get*` (queries), `apply*` (apply effects)
  - `getMonster()`, `applyDamage()`, `addCondition()`, etc.

#### L4: Application

- `rolls/`: `rollCharacter*()`, `rollMonster*()`, `rollSpell*()`
  - `rollCharacterSkillCheck()`, `rollMonsterAttack()`, `rollSpellDamage()`, etc.
  - Thin orchestration layer, no complex logic

### 4.5 Export Syntax

**WRONG**:

```typescript
export const { TypeA, TypeB } from './types';  // Invalid!
```

**RIGHT**:

```typescript
export type { TypeA, TypeB } from './types'; // For types
export { value1, value2 } from './types'; // For values
```

---

## 5. Common Pitfalls & Fixes

### 5.1 ESM JSON Loading

**Problem**: `require()` doesn't work in ESM.
**Fix**: Use native ESM imports (vitest/Vite supports JSON imports natively):

```typescript
// ✅ RIGHT - Native ESM JSON import
import data from './file.json';

// ❌ WRONG - Don't use createRequire in test files
import { createRequire } from 'node:module';
```

### 5.2 Test File Imports

**Problem**: `@/` path aliases don't work in test files.
**Fix**: Use relative paths:

```typescript
// ❌ WRONG
import { calculateModifier } from '@/src/engine/ability-modifier';

// ✅ RIGHT
import { calculateModifier } from '../../src/engine/ability-modifier';
```

### 5.3 Per-Class Spell Tracking (New in v0.x)

**Context**: Spell data is now tracked PER CLASS, not on the character directly.

**Old way (WRONG)**:

```typescript
// ❌ WRONG - These fields no longer exist on CharacterSpells
const dc = char.spells.spellSaveDC;
const known = char.spells.knownSpells;
```

**New way (CORRECT)**:

```typescript
// ✅ RIGHT - Access per-class data
const classSpellData = char.spells.classSpellcasting[classId];
if (classSpellData) {
  const dc = classSpellData.spellSaveDC;
  const known = classSpellData.knownSpells;
  const prepared = classSpellData.preparedSpells;
}

// Or use query functions
const classData = getClassSpellData(char, 'wizard');
const knows = knowsSpellForClass(char, 'wizard', 'fireball');
```

**Key changes**:

- `classSpellcasting: Record<string, ClassSpellData>` - keyed by classId
- `spellSlots` is still a unified pool (correct for D&D 5e multiclassing)
- Use `getClassSpellData()`, `knowsSpellForClass()`, `isSpellPreparedForClass()` for queries
- Use `prepareSpellForClass()`, `unprepareSpellForClass()` for mutations

---

## 6. How to Run Tests & Build

> **CRITICAL**: Before committing, you MUST run the same validation steps as CI (see `../../.github/workflows/ci.yml`).

Run from `packages/core/` or from the monorepo root with `--filter open20-core`:

```bash
# Install dependencies (first time, from monorepo root)
pnpm install

# Run all tests
pnpm test

# Run specific test file
pnpm exec vitest run tests/engine/ability-modifier.test.ts

# Lint (MUST pass before committing)
pnpm run lint
pnpm run lint:fix

# Type check (MUST pass before committing)
pnpm run typecheck

# Run tests with coverage
pnpm run test:coverage

# Build Node.js bundle
pnpm run build

# Build browser bundles
pnpm run build:bundle

# Test Node.js artifact
pnpm run test:artifact

# Test browser artifact
pnpm run test:browser-artifact

# Minimum required before commit:
pnpm run typecheck && pnpm run lint && pnpm test

# Full CI validation:
pnpm run typecheck && pnpm run lint && pnpm test && pnpm run build && pnpm run build:bundle && pnpm run test:artifact && pnpm run test:browser-artifact
```

### 6.1 CI Validation Steps

| Step | Command                             |
| ---- | ----------------------------------- |
| 1    | `pnpm install` (from monorepo root) |
| 2    | `pnpm run typecheck`                |
| 3    | `pnpm run lint`                     |
| 4    | `pnpm test`                         |
| 5    | `pnpm run build`                    |
| 6    | `pnpm run build:bundle`             |
| 7    | `pnpm run test:artifact`            |
| 8    | `pnpm run test:browser-artifact`    |

**Minimum required before commit**:

```bash
pnpm run typecheck && pnpm run lint && pnpm test
```

**Target**: 100% coverage for `engine/` and `character/` modules.

---

## 7. How to Add New Features

### 7.1 Adding a New Engine Function

1. Create `src/engine/new-function.ts`
2. Implement as pure function with `calculate*` or `get*` prefix
3. Add export to `src/engine/index.ts` (if exists) or `src/index.ts`
4. Write tests in `tests/engine/new-function.test.ts`
5. Update `spec/high-level-design.md` S-xx status

### 7.2 Adding a New Mutation Function

1. Add function to the appropriate file in `src/character/mutate/`
2. Follow immutable update pattern (see §4.3)
3. Update return type `Character`
4. Write tests in `tests/character/mutate.test.ts`
5. Export via `src/character/mutate/index.ts`

### 7.3 Adding New Static Data (SRD 5.2)

> **Note**: SRD content lives in `packages/content-srd/`. See `packages/content-srd/AGENTS.md` for instructions on adding/updating SRD data.

1. Update JSON schema in `spec/data-model.md`
2. Add or update data in `packages/content-srd/data/*.json`
3. Ensure `source: 'SRD 5.2'` tag on all content
4. Write data integrity tests in the `content-srd` package

### 7.4 Creating Content Packs (Homebrew/Official)

Content pack creation and management is handled by the `@open20/content` package.
See `packages/content/AGENTS.md` (if available) or `packages/content/DESIGN.md` for the content management API.

Core provides the foundational types for content packs in `src/content/types.ts`
(`ContentPack`, `ContentPackMeta` interfaces), but registration, editing, and
storage are implemented in `@open20/content`.

### 7.5 Adding Spell Data

Spell data lives in `packages/content-srd/`. See that package's AGENTS.md for
instructions on importing and validating spell data.

---

## 8. Spell Data Management

### Current Status

- SRD 5.2 spell data lives in `packages/content-srd/data/spells.json`
- Spell query functions are in `src/spells/query.ts`
- See `packages/content-srd/AGENTS.md` for data import/management

### Adding New Spells

Add or update spell data in the `content-srd` package, then verify query
functions work with the updated data:

```bash
pnpm --filter open20-core test
```

### Spell Data Format Rules

1. **ID format**: kebab-case (`fire-bolt`, not `FireBolt`)
2. **Ability names**: Use full names (`Strength`, not `Str`)
3. **Components**: `{ V?: boolean; S?: boolean; M?: string | boolean }`
4. **Damage**: `{ dice?: string; type?: DamageType; scale?: 'cantrip' | 'level' }`
5. **Source**: Include full source string for attribution

---

## 9. Requirement Management

### 9.1 Requirement Tracking System

Requirements are tracked in `requirements/README.md` with IDs R1-R26:

```markdown
### R11: Spell Query Functions

**Description**: Provide functions to query spell data
**Status**: ✅ Completed
**对应源码**:

- `src/spells/query.ts` - Query functions
- `tests/spells/query.test.ts` - Tests
```

### 9.2 Requirement Status Indicators

- ✅ **Completed**: Fully implemented with tests
- 📋 **Planned**: Documented but not started
- 🚧 **In Progress**: Partially implemented
- ❌ **Blocked**: Cannot implement due to dependencies

### 9.3 How to Mark a Requirement as Complete

1. Implement all functionality described in the requirement
2. Write tests covering the requirement
3. Update `requirements/README.md`:
   - Change status to ✅
   - Add "对应源码" section with file paths
4. Update `spec/high-level-design.md` S-xx status if applicable
5. Run `npm test` to verify all tests pass
6. Commit with prefix `[Rx]` (e.g., `[R11]`)

### 9.4 How to Add a New Requirement

1. Add entry to `requirements/README.md` with format:

   ```markdown
   ### Rxx: [Requirement Name]

   **Description**: [What it does]
   **Status**: 📋 Planned
   ```

2. Create directory `requirements/Rxx-name/` if detailed spec needed
3. Update `spec/high-level-design.md` if it affects architecture
4. Add to PRD.md if it's a user-facing feature

### 9.5 Requirement Implementation Checklist

- [ ] Code implemented in `src/`
- [ ] Unit tests written in `tests/`
- [ ] All tests pass (`npx vitest run`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated
- [ ] Requirement marked as ✅ in `requirements/README.md`
- [ ] `对应源码` links added

### 9.6 Traceability Matrix

Keep requirements traceable through implementation:

| Requirement | Specification | Source Files          | Tests                        |
| ----------- | ------------- | --------------------- | ---------------------------- |
| R1          | S1            | `src/engine/*.ts`     | `tests/engine/*.test.ts`     |
| R11         | S14           | `src/spells/query.ts` | `tests/spells/query.test.ts` |

Update this matrix in `requirements/README.md` when adding new requirements.

---

## 10. Documentation Maintenance

### 10.1 Documentation Suite Overview

| Document                    | Purpose                  | Update Frequency         |
| --------------------------- | ------------------------ | ------------------------ |
| `PRD.md`                    | Product requirements     | Major features only      |
| `spec/high-level-design.md` | Technical architecture   | Every S1-S20 change      |
| `spec/data-model.md`        | TypeScript interfaces    | Every type change        |
| `requirements/README.md`    | Requirement traceability | Every R1-R26 change      |
| `AGENTS.md`                 | AI agent guidelines      | Every convention/pitfall |
| `README.md`                 | User-facing docs         | Every public API change  |

### 10.2 When to Update Each Document

#### `PRD.md`

- Project scope or positioning changes
- New major features added
- Target audience changes
- Release planning updates

#### `spec/high-level-design.md`

- Added/modified/removed any S1-S20 functionality
- Changed function signatures (update §12 function list)
- Changed module dependencies
- Update status column (✅/📋/🚧)
- Update test count after adding tests

#### `spec/data-model.md`

- Changed TypeScript interfaces in `src/types/index.ts`
- Changed JSON schema in content pack data files
- Added/removed fields from core types

#### `requirements/README.md`

- Implemented a new requirement (mark Rxx as ✅)
- Changed requirement scope
- Add "对应源码" links when implementing
- Update status indicators regularly

#### `AGENTS.md` (This File)

- New common pitfalls discovered
- New conventions established
- Project structure changed
- New tooling added
- Test count changes
- New sections needed (like this one!)

### 10.3 Documentation Sync Checklist

After completing any code change:

1. **Identify affected documents** (see §10.2)
2. **Update specification status** (S-xx, R-xx)
3. **Update test counts** if tests added/removed
4. **Update directory structure** if files added/removed
5. **Add new pitfalls** discovered during implementation
6. **Cross-reference check**: Ensure links between documents work
7. **Build and verify**: `npm run lint && npm run typecheck && npx vitest run`

### 10.4 Writing Guidelines for Documentation

- **Be concise**: No narration, get to the point
- **Use examples**: Code snippets speak louder than words
- **Keep tables readable**: Don't let them get too wide
- **Update the "Last updated" line** at bottom of each document
- **Use status indicators**: ✅ 📋 🚧 ❌ for quick visual scanning
- **Link to source**: Use "对应源码" sections for traceability

### 10.5 Common Documentation Mistakes to Avoid

- ❌ Forgetting to update test counts after adding tests
- ❌ Not marking requirements as complete in `requirements/README.md`
- ❌ Letting `AGENTS.md` get out of date with actual project structure
- ❌ Not updating function signatures in `spec/high-level-design.md` §12
- ❌ Breaking markdown table formatting (triple pipes `|||`)

---

## 11. Testing Patterns

### 11.1 Unit Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { functionUnderTest } from '../../src/module/file';

describe('functionUnderTest', () => {
  it('should do X when Y', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case Z', () => {
    const result = functionUnderTest(edgeCase);
    expect(result).toEqual(expected);
  });
});
```

### 11.2 Testing Immutable Updates

```typescript
it('should return new object without mutating original', () => {
  const original = createTestCharacter();
  const modified = modifyHP(original, 5);

  // New object
  expect(modified).not.toBe(original);

  // Original unchanged
  expect(original.hitPoints.current).toBe(oldValue);

  // Modified has changes
  expect(modified.hitPoints.current).toBe(oldValue + 5);

  // updatedAt changed
  expect(modified.updatedAt).not.toBe(original.updatedAt);
});
```

### 11.3 Testing Spell Queries

```typescript
it('should filter spells by school and level', () => {
  const spells = searchSpells({
    school: 'Evocation',
    level: [1, 2, 3],
  });

  expect(spells.length).toBeGreaterThan(0);
  spells.forEach((spell) => {
    expect(spell.school).toBe('Evocation');
    expect(spell.level).toBeLessThanOrEqual(3);
  });
});
```

---

## 12. Git Commit Guidelines

Since this project uses AI agents, commit messages should be:

- **Clear**: What changed, why
- **Atomic**: One logical change per commit
- **Prefixed**: `[Sxx]` for specification item, `[Fix]` for bug fixes, `[Docs]` for documentation

Examples:

```
[S11] Implement attack calculator engine function
[Fix] Handle undefined access in hp-calculator (noUncheckedIndexedAccess)
[Docs] Update PRD to reflect headless engine direction
[S12] Add species.json with 12 species
[Spells] Import 560+ SRD spells from dnd-data repo
```

**Release tags**: Use `core-v<version>` (e.g. `core-v0.2.2`), not bare `v<version>`. This is a monorepo — bare version tags are reserved for the root.

---

## 13. Quick Reference

| Task               | Command                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint               | `pnpm run lint`                                                                                                                                           |
| Lint with auto-fix | `pnpm run lint:fix`                                                                                                                                       |
| Type check         | `pnpm run typecheck`                                                                                                                                      |
| Run all tests      | `pnpm test`                                                                                                                                               |
| Run single test    | `pnpm exec vitest run tests/path/to/test.test.ts`                                                                                                         |
| Install deps       | `pnpm install` (from monorepo root)                                                                                                                       |
| Check coverage     | `pnpm run test:coverage`                                                                                                                                  |
| Full CI validation | `pnpm run typecheck && pnpm run lint && pnpm test && pnpm run build && pnpm run build:bundle && pnpm run test:artifact && pnpm run test:browser-artifact` |

| File                        | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `PRD.md`                    | Product Requirements Document           |
| `AGENTS.md`                 | This file - read first!                 |
| `spec/high-level-design.md` | Technical architecture (S1-S20)         |
| `spec/data-model.md`        | TypeScript interfaces & JSON schema     |
| `requirements/README.md`    | Requirements traceability (R1-R26)      |
| `src/types/index.ts`        | All core types                          |
| `src/content/types.ts`      | ContentPack, ContentPackMeta interfaces |

---

## 14. Contact / Escalation

If you're stuck or unsure:

1. Read `spec/high-level-design.md` for architecture context
2. Check `tests/` for usage examples
3. Look at existing implementations in `src/` for patterns
4. If still stuck, ask the user for clarification

**Remember**: When in doubt, follow existing patterns in the codebase. Consistency is more important than perfection.

---

_Last updated: 2026-06-30 (AGENTS.md audit — removed stale references, test count 653)\*
\_Maintained by: AI agents working on this project_
