# Refactor Plan: Remove DataLoader and Keep Core Compute-Only

**STATUS: COMPLETE** ✅

All phases have been implemented and verified. The refactoring is complete.

## Summary of Changes

- `DataLoader` removed from `open20-core`
- Core functions now accept `RecomputeDerivedStatsDeps` (explicit resolved inputs)
- `content-srd` owns content pack merge + query/lookup
- Spellbook consumer migrated to use new API
- All tests pass (1005 tests across all packages)

## Verification

```bash
pnpm build    # ✅ Passes
pnpm test     # ✅ 1005 tests pass (663 core + 197 content-srd + 34 ui + 111 spellbook)
pnpm lint     # ✅ Passes (warnings only, no errors)
```

## Goal

Enforce a strict boundary:

- `@open20/content-srd` handles content pack merge + query/lookup.
- `open20-core` handles computation/state transitions only.
- Core APIs must accept explicit resolved inputs (spell/feat/class/armor/weapon/etc.), never `DataLoader` or `ContentPack`.

`DataLoader` is removed from `open20-core`.

---

## Architectural Rules (Required)

1. Merge happens in consumer-side content layer:

- Use `mergeContentPacks(...)` in `@open20/content-srd`.
- Core must not import `content-srd`.

2. Resolve happens before core calls:

- Consumers (spellbook/tests/other apps) query `content-srd` and pass resolved values to core.
- Core functions accept only exactly what they need.

3. No `ContentPack` in core compute APIs:

- Do not replace `DataLoader` with `ContentPack` in core public APIs.
- If a core function currently needs lookups, split into:
  - a pure compute function that accepts resolved inputs,
  - optional consumer helper outside core if convenience is needed.

---

## New Consumer Pattern

```ts
import {
  srdContentPack,
  mergeContentPacks,
  findSpecies,
  findClass,
  findBackground,
  findFeat,
  findSpell,
  findWeapon,
  findArmor,
} from '@open20/content-srd';
import {
  createCharacter,
  recomputeDerivedStats,
  castSpell,
  type RecomputeDerivedStatsDeps,
} from 'open20-core';

// 1) Merge packs in content layer (consumer side)
const merged = mergeContentPacks([srdContentPack]);

// 2) Resolve entities in content layer
const species = findSpecies('human', merged);
const klass = findClass('wizard', merged);
const background = findBackground('sage', merged);
const fireball = findSpell('fireball', merged);

// 3) Pass resolved objects to core
const char = createCharacter({ name: 'Gandalf', species, class: klass, background });

// 4) For recompute, pass explicit dependency bag (no pack)
// Use Record<string, T> maps for O(1) lookup by ID
const deps: RecomputeDerivedStatsDeps = {
  species,
  background,
  classes: { [klass.id]: klass },
  subclasses: {},
  feats: {},
  weapons: { quarterstaff: findWeapon('quarterstaff', merged)! },
  armors: { 'mage-armor': findArmor('mage-armor', merged)! },
  spells: { fireball: fireball },
};

const recomputed = recomputeDerivedStats(char, deps);
const cast = castSpell(recomputed, fireball, 3);
```

---

## Phase 1 — `content-srd` query + merge API

### `packages/content-srd/src/merge.ts` (new)

- `mergeContentPacks(packs: ContentPack[]): ContentPack`

**Merge semantics (spec)**:

- Input order determines priority: later packs override earlier packs for same `id`.
- Optional: sort inputs by `meta.priority` (ascending) before merging, so higher-priority packs win. Default: use input order as-is.
- Per-field merge strategy:
  - Array fields (`species`, `classes`, `spells`, `monsters`, `feats`, `weapons`, `armor`, `gear`, `glossary`): concatenate all arrays, then dedup by `id` (keep last occurrence).
  - `meta`: merge shallow (last pack wins for each key), or keep `meta` from highest-priority pack.
  - `version`: keep from highest-priority pack.
- Result: single `ContentPack` with all entities from all input packs, conflicts resolved deterministically.

### `packages/content-srd/src/query/spells.ts`

All query functions take `ContentPack` (the merged pack), NOT `DataLoader`.

- `findSpell(id: string, pack: ContentPack): Spell | undefined`
- `searchSpells(filter: SpellFilter, pack: ContentPack): Spell[]`
- `getSpellsByClass(classId: string, pack: ContentPack): Spell[]`

### `packages/content-srd/src/query/monsters.ts`

- Move monster query functions from core.
- All functions take `ContentPack`, not `DataLoader`.

### `packages/content-srd/src/query/glossary.ts`

- Move glossary query functions from core.
- All functions take `ContentPack`, not `DataLoader`.

### `packages/content-srd/src/query/catalog.ts`

All functions take `ContentPack` (the merged pack), NOT `DataLoader`.

- Add missing catalog lookup helpers:
  - `findSpecies(id: string, pack: ContentPack): Species | undefined`
  - `findSpeciesSubtype(...)` (similar signature)
  - `findClass(id: string, pack: ContentPack): Class | undefined`
  - `findSubclass(id: string, pack: ContentPack): Subclass | undefined`
  - `getSubclassesForClass(classId: string, pack: ContentPack): Subclass[]`
  - `findBackground(id: string, pack: ContentPack): Background | undefined`
  - `findFeat(id: string, pack: ContentPack): Feat | undefined`
  - `getFeatsByCategory(category: FeatCategory, pack: ContentPack): Feat[]`
  - `findWeapon(id: string, pack: ContentPack): Weapon | undefined`
  - `findArmor(id: string, pack: ContentPack): Armor | undefined`
  - `findGearItem(id: string, pack: ContentPack): GearItem | undefined`

### `packages/content-srd/src/index.ts`

- Export merge + all query functions/types.

### `packages/content-srd/src/query/resolve.ts` (new, convenience helper)

- `resolveCharacterDeps(char: Character, pack: ContentPack): RecomputeDerivedStatsDeps`
  - Resolves all entities referenced by the character (species, classes, subclasses, feats, equipment, spells) from the merged pack.
  - Returns a fully-built `RecomputeDerivedStatsDeps` bag ready for `recomputeDerivedStats`.
  - This is a convenience helper for consumers; core does NOT import this.

---

## Phase 2 — Core API redesign to explicit deps

### `packages/core/src/character/create.ts`

**BREAKING CHANGE**: `CreateCharacterParams` changes from ID-based (`speciesId`, `classId`) + `DataLoader` to resolved-object API. This is intentional — `Character` creation requires resolved objects, and the caller is responsible for resolution.

New signature:

- `species: Species`
- `background: Background`
- `class: Class`
- `feats?: Feat[]`
- `additionalClasses?: Array<{ class: Class; level: number; subclass?: Subclass }>`
- Remove `DataLoader` parameter.

### `packages/core/src/character/recompute.ts`

Replace:

```ts
recomputeDerivedStats(char, dataLoader);
```

With explicit deps bag:

```ts
interface RecomputeDerivedStatsDeps {
  // Singular resolved objects (no mapping needed)
  species?: Species
  background?: Background

  // Maps keyed by ID for O(1) lookup by CharacterClass.classId, etc.
  classes: Record<string, Class>
  subclasses?: Record<string, Subclass>
  feats?: Record<string, Feat>

  // Equipment maps keyed by ID for resolving Character.equipment[].itemId
  weapons?: Record<string, Weapon>
  armors?: Record<string, Armor>
  gear?: Record<string, GearItem>

  // Spells map keyed by ID
  spells?: Record<string, Spell>
}

recomputeDerivedStats(char: Character, deps: RecomputeDerivedStatsDeps): Character
```

Notes:

- No lookups inside core. Engine maps `char.classes[].classId` → `deps.classes[classId]` (O(1)).
- Caller builds maps via `_.keyBy(array, 'id')` or equivalent.
- `Character` type stays ID-based (serializable). Deps bag is the resolution moment.

---

## Phase 3 — Internal engine functions (explicit only)

### `packages/core/src/engine/ac-calculator.ts`

- `calculateAC(..., armors: readonly Armor[], ...)`

### `packages/core/src/engine/attack-calculator.ts`

- `calculateAttacks(..., weapons: readonly Weapon[], ...)`

### `packages/core/src/engine/spell-slots.ts`

- `calculateSpellSlots(classData: Class, classLevel: number)`
- `calculateSpellSlotsFromClasses(classes: CharacterClass[], classData: readonly Class[])`

### `packages/core/src/engine/spell-data.ts`

- Accept `classData/subclassData/spells` explicitly.

### `packages/core/src/engine/damage-calculator.ts`

- Damage defense APIs accept explicit resolved `species/classes/feats/features` inputs.

### `packages/core/src/engine/hp-calculator.ts`

- Accept class hit-die data explicitly (`Class[]` / map), not loader/pack.

### `packages/core/src/character/utils.ts`

- `gatherAllFeatures(classes, classData, subclassData)`

### `packages/core/src/character/resource-builder.ts`

- `extractAllClassResources(classes, abilityScores, classData, subclassData)`
- `recomputeResources(resources, classes, abilityScores, classData, subclassData)`

---

## Phase 4 — Character mutation API cleanup

All functions drop `DataLoader`/`ContentPack` and accept explicit resolved args.

- `levelUp(char, options, deps)` where `deps` contains only class/subclass/feat/spell data actually needed.
- `shortRest(char, ...)` and `longRest(char, ...)` accept only explicit data if required.
- `validateCharacter(char, deps)` where deps include resolved entities referenced by IDs in `char`.
- `addFeat(char, feat, deps)`; feat prerequisite checks accept explicit `classData/subclassData/featureData`.
- `validateFeatPrerequisites(char, feat, deps)` (no hidden lookups).

### `packages/core/src/character/spell-casting.ts`

- `castSpell(char, spell, slotLevel)`
- `canCastAsRitual(char, spell)`
- `castAsRitual(char, spell)`

### `packages/core/src/character/mutate/equipment.ts`

- `equipItemAndRecompute(char, item, recomputeDeps)`
- `unequipItemAndRecompute(char, itemId, recomputeDeps)`

### `packages/core/src/character/mutate/spells.ts`

- Pure state updates stay id-based.
- Any validation requiring spell/class data takes explicit `spell/class` args.

### `packages/core/src/character/mutate/conditions.ts`

- `makeConcentrationCheck` should not require lookup; use existing character state only.
- If any external data is truly required, take it explicitly via arg.

---

## Phase 5 — Spells, monster, rolls modules

### `packages/core/src/spells/query.ts`

Split responsibilities:

- Move content querying (`getSpell`, `searchSpells`, `getSpellsByClass`) to `content-srd`.
- Keep character-centric selectors in core and require resolved arrays:
  - `getSpellsForCharacter(char, spells)`
  - `getPreparedSpells(char, spells)`
  - `getKnownSpellsForClass(char, classId, classData, spells)`

### `packages/core/src/spells/capabilities.ts`

- `getCasterType(char, classData)`
- `getCasterTypeForClass(classData)`
- `getSpellcastingLevel(char, classData)`
- `getMaxPreparedSpells(char, classData)`

### `packages/core/src/monster/*`

- Remove loader usage.
- Monster calculators/combat accept `monster` + explicit aux inputs only where required.
- Content query functions move to `content-srd`.

### `packages/core/src/rolls/*`

- `applyDamageWithDefenses(char, damage, damageType, deps)` where deps are explicit defenses sources.
- `MonsterFullAttackParams` drops loader.

---

## Phase 6 — Spellbook Consumer Migration (Required)

**NOTE**: This phase MUST complete before Phase 8 (DataLoader removal). All consumers must be migrated before deleting DataLoader.

### Remove loader pattern

- Delete `packages/spellbook/src/core/data-loader.ts`.
- Remove all `DataLoader` imports/casts from spellbook.

### Add content resolver layer in spellbook

Create `packages/spellbook/src/core/content-resolver.ts`:

- Build merged pack via `mergeContentPacks([srdContentPack, ...userPacks])`.
- Expose typed lookup helpers used by app services.
- Expose helper to construct `RecomputeDerivedStatsDeps` from a character.

### Update `character-service.ts`

- Replace all core calls that pass loader with explicit resolved deps.
- Example updates:
  - `createCharacter(...)` uses resolved `species/class/background/feats`.
  - `recompute(...)` passes `RecomputeDerivedStatsDeps`.
  - `longRest/shortRest/castSpell` pass explicit spell/class/etc. args as required by new core signatures.

### Update spellbook tests

- Replace loader bootstrapping with resolver fixtures.

---

## Phase 7 — Tests and Verification

### Core tests

- Remove loader-based fixtures/helpers.
- Replace with explicit resolved fixtures using shared test helpers.

**Create shared test fixtures** at `packages/core/test/fixtures/resolved.ts`:

```ts
// Pre-built resolved arrays for tests
export const fixtureClasses: Class[] = [
  /* wizard, fighter, ... */
];
export const fixtureSpells: Spell[] = [
  /* fireball, magic-missile, ... */
];
export const fixtureFeats: Feat[] = [
  /* alert, tough, ... */
];
export const fixtureArmors: Armor[] = [
  /* mage-armor, plate, ... */
];
export const fixtureWeapons: Weapon[] = [
  /* quarterstaff, dagger, ... */
];
export const fixtureSpecies: Species[] = [
  /* human, elf, ... */
];
export const fixtureBackgrounds: Background[] = [
  /* sage, soldier, ... */
];

// Pre-built maps (Record<string, T>) for deps bags
export const fixtureClassMap: Record<string, Class> = _.keyBy(fixtureClasses, 'id');
export const fixtureSpellMap: Record<string, Spell> = _.keyBy(fixtureSpells, 'id');
// ... etc.

// Pre-built deps bag for recompute tests
export function makeRecomputeDeps(
  partial?: Partial<RecomputeDerivedStatsDeps>,
): RecomputeDerivedStatsDeps {
  return {
    species: fixtureSpecies[0],
    background: fixtureBackgrounds[0],
    classes: fixtureClassMap,
    subclasses: {},
    feats: {},
    weapons: {},
    armors: {},
    spells: fixtureSpellMap,
    ...partial,
  };
}
```

- Ensure no test imports from `src/data/*`.

### content-srd tests

- Add coverage for:
  - `mergeContentPacks`:
    - Basic merge (concatenation)
    - Conflict resolution (same `id` in multiple packs → last wins)
    - Dedup (no duplicate `id`s in merged result)
    - `meta` merge behavior
  - new query API parity vs previous behavior (findSpell, findClass, etc.)

### Spellbook tests

- Verify create/recompute/rest/cast flows using resolver layer.
- Replace loader bootstrapping with `resolveCharacterDeps` or explicit resolved fixtures.

### Mandatory checks from monorepo root

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

---

## Phase 8 — Remove DataLoader from Core

**PREREQUISITE**: Phases 6–7 must be complete and verified passing before this phase.

1. Delete:
   - `packages/core/src/data/loader.ts`
   - `packages/core/src/data/default-loader.ts`
   - `packages/core/src/data/index.ts`

2. Remove exports from `packages/core/src/index.ts`:
   - `DataLoader` type export (line 63)
   - `createDataLoader` export (line 64)
   - moved query exports (spell/monster/glossary lookup functions)

3. Delete moved modules from core:
   - `packages/core/src/monster/query.ts`
   - `packages/core/src/glossary/query.ts`

4. Keep `core/src/content/io.ts` only as content I/O utility; remove stale DataLoader references.

5. Bump `@open20/content-srd` version (minor or major, depending on breaking changes) and ensure workspace symlink picks up the new query/merge API.

---

## Deprecation Strategy

To avoid breaking consumers during migration, add **deprecated overloads** before removing DataLoader signatures. This allows incremental migration.

### Step 1: Add deprecated overloads (during Phase 2–5)

For each function that currently takes `DataLoader`, add an overload:

```ts
// packages/core/src/character/recompute.ts

/** @deprecated Use recomputeDerivedStats(char, deps) instead */
export function recomputeDerivedStats(char: Character, dataLoader: DataLoader): Character {
  // Adapt: resolve from loader, call new signature
  const deps = adaptLoaderToDeps(char, dataLoader);
  return recomputeDerivedStats(char, deps);
}

/** New explicit-deps signature */
export function recomputeDerivedStats(char: Character, deps: RecomputeDerivedStatsDeps): Character {
  // ... implementation
}
```

Do this for ALL public functions that currently take `DataLoader`:

- `createCharacter` (if it currently takes `DataLoader`)
- `recomputeDerivedStats`
- `levelUp`
- `shortRest` / `longRest`
- `validateCharacter`
- `addFeat`
- `castSpell`
- etc.

### Step 2: Migrate consumers (Phase 6)

Update spellbook (and any other consumers) to use the new signatures. Once all consumers are migrated, remove the deprecated overloads.

### Step 3: Remove deprecated overloads (Phase 8)

Once no consumers use the `DataLoader` overloads, delete them and delete `src/data/*`.

### Notes

- Deprecated overloads should log a console warning (once) to alert consumers.
- Keep deprecated overloads for one full release cycle before removing.

---

## Migration Strategy

Recommended rollout (matches phase numbers above):

1. **Phase 1**: Land `content-srd` merge + query API first. Bump `@open20/content-srd` version.
2. **Phase 2–5**: Add new explicit core signatures. Use deprecated overloads (see "Deprecation Strategy" section) so existing consumers keep working.
3. **Phase 6**: Migrate spellbook consumer code to new signatures.
4. **Phase 7**: Update and verify all tests pass.
5. **Phase 8**: Remove deprecated loader signatures and delete `src/data/*`.

---

## File Change Summary

### Core

- Delete `packages/core/src/data/*` (Phase 8).
- Add deprecated overloads for all `DataLoader`-accepting functions (Phase 2–5, see "Deprecation Strategy").
- Refactor `character/*`, `engine/*`, `spells/*`, `monster/*`, `rolls/*` to explicit deps (Phase 2–5).
- Remove deprecated overloads and `DataLoader` exports from `packages/core/src/index.ts` (Phase 8).
- `Character` type stays ID-based (serializable). Deps bags are the resolution moment.

### content-srd

- Add `src/merge.ts` with `mergeContentPacks` (Phase 1).
- Add `src/query/{catalog,spells,monsters,glossary}.ts` with `find*` / `search*` / `getBy*` functions, all taking `ContentPack` (Phase 1).
- Add `src/query/resolve.ts` with `resolveCharacterDeps(char, pack)` convenience helper (Phase 1).
- Re-export all new functions/types from `src/index.ts` (Phase 1).
- Bump version after adding new API.

### Spellbook

- Delete `src/core/data-loader.ts` (Phase 6).
- Add `src/core/content-resolver.ts` wrapping `mergeContentPacks` + `resolveCharacterDeps` (Phase 6).
- Refactor `src/core/character-service.ts` to use explicit resolved inputs (Phase 6).
- Update all spellbook tests to use resolver layer or explicit fixtures (Phase 7).

---

## Non-Negotiable Acceptance Criteria

- `grep -R "DataLoader" packages/core/src` returns no hits.
- Public core compute APIs accept explicit dependencies only.
- No core function takes `ContentPack`.
- `content-srd` owns pack merge + query responsibilities.
- Spellbook builds and tests pass without `createDataLoader()`.
