# Character Sheet — Implementation Tasks

Implementation task specs for `@open20/character-sheet`, derived from [`../PRD.md`](../PRD.md) (v1.5) and [`../Wireframe_Design.md`](../Wireframe_Design.md) (v1.1).

**This README is the ground truth.** It corrects several claims in the PRD/wireframe that were re-verified against the actual code on 2026-07-27 (see [§4 Corrections](#4-corrections-to-prd--wireframe)). When a task spec and the PRD disagree, the task spec wins.

---

## 0. How to use these specs (for implementing agents)

1. Read this README fully first — it defines conventions, the verified API surface, and the corrections.
2. Pick a task from the phase files. Each task has an ID (`T-xxx`), `Depends on`, `Files`, `API to use`, `Acceptance criteria`, and `Tests`. Do not start a task until its dependencies are merged.
3. **Before calling any core/ui/content function, open its actual definition and confirm the signature.** The signatures in these specs were verified on 2026-07-27, but the source is authoritative. Never guess a signature.
4. Do not re-implement game logic in the app. All rules math lives in `open20-core`; all SRD data lives in `@open20/content-srd`. The app layer only orchestrates (call a core function → store the returned `Character` → render).
5. Follow the existing patterns in `@open20/spellbook` (store/service/layout) and `@open20/ui` (component structure). Mirror, don't import, spellbook _app_ code.
6. Every task must land with tests green, `typecheck` clean, and `lint` clean (see commands below).

### Commands

```bash
pnpm --filter @open20/character-sheet dev        # dev server
pnpm --filter @open20/character-sheet build       # tsc -b && vite build
pnpm --filter @open20/character-sheet test        # vitest run
pnpm --filter @open20/character-sheet typecheck   # tsc --noEmit -p tsconfig.app.json
pnpm --filter @open20/character-sheet lint        # eslint .
pnpm --filter open20-core test                    # when touching core (Phase 0.5)
pnpm --filter @open20/ui test                      # when touching ui (Phase 0.5)
```

---

## 1. Architecture (the golden path)

`open20-core` is **immutable**: every `Character` field is `readonly` and every mutation returns a _new_ `Character`. The app never mutates in place.

```
User action
  → store action resolves RecomputeDerivedStatsDeps via ContentResolver
  → calls core fn: newChar = coreFn(character, ...params, deps, rng)
  → store.setState({ character: newChar }) and persists to localStorage
  → React re-renders from the new immutable snapshot
```

Three app-layer seams do all the core integration:

| Seam                | File                           | Responsibility                                                                                        |
| ------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **ContentResolver** | `src/core/content-resolver.ts` | Wraps `@open20/content-srd`. Builds `RecomputeDerivedStatsDeps`; resolves IDs → display names.        |
| **rollAdapter**     | `src/core/roll-adapter.ts`     | Injects the RNG into core roll functions; pushes results into the roll store.                         |
| **characterStore**  | `src/stores/characterStore.ts` | Zustand store; every action calls a core fn and replaces the snapshot. Persists via a StorageService. |

Presentational components are dumb: they receive already-derived values as props (`character.combatStats.AC`, `character.skills`, resolved names) and emit callbacks. They never call core directly.

**Derived values are read from the character, not recomputed in the UI.** `recomputeDerivedStats` (run by create/level-up/equip/rest and on load) populates `combatStats` (AC, initiative, passivePerception, proficiencyBonus, attacks), skill bonuses, spell DC/attack bonus, etc. The UI reads those stored fields. Roll functions (`rollCharacter*`) are the exception — they are called live on tap.

---

## 2. Verified API surface (2026-07-27)

> Confirm each signature against source before use. Package roots: core `packages/core/src`, ui `packages/ui/src`, content `packages/content-srd/src`.

### 2.1 `open20-core` (v0.2.1) — build: `tsc` (not tsup); tests: Vitest; Zod v4

**Types** (`src/types/`): `Character`, `CharacterClass`, `HitPoints`, `DeathSaves`, `CombatStats`, `CharacterAttack` (extends `BaseAttack` + `mastery`), `ActiveCondition` (`{ ...; level?: number }`), `ConcentrationState` (stores `spellId` only), `ConditionName` (15-condition union incl. `'Exhaustion'`), `Currency`, `AbilityScores`, `AbilityName`, `EquipmentItem`, `Weapon`/`Armor`/`Gear`, `DamageDefenses`, `SkillName`/`SkillEntry`/`SKILL_NAMES`/`SKILL_ABILITY_MAP`, `Class`/`Subclass`/`Feature`, `ClassSpellData` (`{ classId, spellcastingAbility, spellSaveDC, spellAttackBonus, knownCantrips, maxCantripsKnown, knownSpells, preparedSpells, ... }`), `RecomputeDerivedStatsDeps` (only `classes` required), `CreateCharacterParams`, `LevelUpOptions`, `Spell`, `SpellLevel`.

**`AbilityScores` is multi-source and already tracks provenance:** `base`, `racialBonuses`, `backgroundBonuses?`, `featBonuses?`, `featGrants?`, `temporaryBonuses?`. ⇒ **FR-106 needs NO core change** (see corrections).

**Mutations** (return `Character` unless noted):

- HP: `modifyHP(char, delta)`, `setTemporaryHP(char, value)`, `applyTypedDamage(char, damage, damageType, defenses) → { char, result }`
- Conditions: `toggleCondition(char, conditionId: ConditionName)`, `startConcentration(char, spellId)`, `endConcentration(char)`
- Equipment: `addEquipment(char, item)`, `removeEquipment(char, itemId)`, `equipItemAndRecompute(char, itemId, deps)`, `unequipItemAndRecompute(char, itemId, deps)`
- Currency: `modifyCurrency(char, Partial<Currency>)`
- Spell slots: `consumeSpellSlot(char, level: number | 'pact')`, `recoverSpellSlot(char, level | 'pact')`
- Spellcasting: `castSpell(char, spell: Spell, slotLevel: SpellLevel) → { success, char, message?, castingClassId? }`
- Rests: `shortRest(char, hitDiceToSpend: number, deps, rng?)`, `longRest(char, _deps)` _(deps unused today)_
- Progression: `levelUp(char, options: LevelUpOptions, deps, rng?)`, `createCharacter(params, deps)`, `recomputeDerivedStats(char, deps)`, `validateCharacter(...) → ValidationResult`

**Getters/calculators** (UI mostly reads stored `combatStats`/`skills` instead of calling these): `getModifier(score)`, `getTotalScore(scores, ability)`, `getSkillBonus(scores, skillEntry, abilityName, pb)`, `getSavingThrowBonus(scores, ability, proficientAbilities, pb)`, `getProficiencyBonus(level)`, `calculateAC(...) → ACResult` _(object, not number)_, `calculateInitiative(...)`, `calculatePassivePerception(scores, skills, pb, conditions)`, `getSpellAttackBonusForClass(char, classId)`, `getBestSpellAttackBonus(char)`.

**Roll functions** (`src/rolls/character.ts`, object params):

- `rollCharacterSkillCheck({ character, skill, rollModifier?, dc?, rng }) → CheckResult & { skillName, ability }`
- `rollCharacterSavingThrow({ character, ability, getClass, rng, ... }) → CheckResult` — **requires a `getClass: (id) => { savingThrowProficiencies } | undefined` callback** (provide it from ContentResolver)
- `rollCharacterInitiative({ character, rollModifier?, rng }) → RollResult`
- `rollCharacterAttack({ character, weapon: Weapon, rollModifier?, targetAC?, rng }) → AttackRollResult`
- `rollCharacterWeaponDamage({ character, weapon: Weapon, isCritical?, rng }) → DamageRollResult`
- ❌ **`rollAbilityCheck` (generic) does NOT exist** — build in Phase 0.5 (T-013) or route through Layer-2 `rollSkillCheck`.

**RNG** — ⚠️ two incompatible shapes:

- Dice/roll functions use `RandomProvider = { roll(min, max): number }` (inclusive). Use `defaultRandom` (`{ roll: (min,max) => Math.floor(Math.random()*(max-min+1))+min }`) and `createDeterministicRNG(sequence: number[])` for tests. Exported top-level.
- `shortRest`/`longRest`/`levelUp` take a _different_ local `RandomProvider = { d(max: number): number }` (level-up's is re-exported as `LevelUpRandomProvider`). The rollAdapter must expose **both** shapes (e.g. a rest/level RNG `{ d: (max) => defaultRandom.roll(1, max) }`).

**Serialization** (`src/storage/serializer.ts`): `serialize(char) → string`, `deserialize(json) → Character` (throws; Zod-validated; migrates 2024.1→2024.2), `validateSchemaVersion(json) → { compatible, message? }`, `sanitizeFilename(name) → string`. Compatible versions: `['2024.1','2024.2']`. `ICharacterStorage` interface + `InMemoryStorage` + `CharacterSummary` in `src/storage/interface.ts`.

**Character fields that DO exist:** `notes` (required string), and everything derived. **Fields that do NOT exist:** `inspiration`, `senses`, `languages`, `toolProficiencies`, `size`.

### 2.2 `@open20/content-srd` — synchronous static data

- `srdContentPack: ContentPack` — all SRD data, statically imported JSON at build time (**not async**).
- `resolveCharacterDeps(char, pack) → RecomputeDerivedStatsDeps` (`./query/resolve`) — already builds the full deps bag.
- Catalog finders (`./query/catalog`): `findSpecies/findBackground/findClass/findSubclass/findFeat/findWeapon/findArmor/findGearItem(id, pack)`; plural `getSpecies/getClasses/getSubclassesForClass/...(pack)`; `findSpeciesSubtype(speciesId, subtypeId, pack)`.
- Spells (`./query/spells`): `findSpell(id, pack)`, `searchSpells(filter: SpellFilter, pack)`, `getSpellsByClass/getSpellsByLevel(pack)`.
- `mergeContentPacks(packs)` (`./merge`) for homebrew merge (not needed for MVP; SRD-only is fine).
- Class features for FR-162 live on `Class.featuresByLevel` inside the pack — query by `character.classes[].level` at render time.

### 2.3 `@open20/ui` — all §12 components exist

Barrel: `packages/ui/src/index.ts`. Exports confirmed: `Button, Badge, CardSurface, CardMetaItem, Surface, Text, SectionHeader, SlotPips, Tabs, Input, Select, Switch, Toggle, Tooltip, TooltipProvider, Dialog, ResponsiveDialog, Sheet, EmptyState, Divider, FilterChip, IconButton, Slider, ThemeToggle, DropdownMenu, cn, I18nProvider, useI18n, useTranslation`, plus icons via `./components/base/icons`.

- **Compound components are namespace objects** — use `Dialog.Content`, `Tabs.Trigger`, `Select.Item`, `Sheet.Body`, `Tooltip.Content` (or flat aliases `DialogRoot`/`TabsTrigger`/…).
- Key props: `Button variant: primary|secondary|outline|ghost|danger|warning, size: sm|md|lg`; `Badge variant: secondary|primary|success|danger|warning|info`; `Surface variant + padding + shadow`; `Text variant (body/heading/label/...) + color + weight + as`; `SlotPips { total, used, onPipClick?, size? }`; `CardSurface { clickable?, onClick?, renderActions?, ... }`; `FilterChip { active?, onPressedChange? }`; `EmptyState { icon?, title, description?, action? }`.
- `SlotPips` is **already** in ui — reuse for spell slots (§5.6). Only `DiceRollOverlay` + roll store need extraction.
- Component structure ("4-file rule" for any NEW ui component): `Name.tsx`, `index.ts`, `storybook/Name.stories.tsx`, `__tests__/Name.test.tsx`. Styling via `cva` + `cn()`, importing variant strings from `src/styles/design-tokens.ts` — **no inline class strings** in ui components.

### 2.4 Design tokens — use REAL ones

- CSS vars that exist: `--color-primary-{50,100,400,500,600,800}`, `--color-bg-{primary,secondary,tertiary}`, `--color-text-{primary,secondary,tertiary}`, `--color-border`, `--color-{success,danger,warning,info}`, `--color-school-*`, `--color-level-0..9`, `--radius-{sm,md,lg,xl}`, `--font-sans`. Dark mode via `data-theme="dark"`.
- ❌ **`--space-*` and `--font-h1/h2/h3/display` do NOT exist.** Wherever the wireframe cites them, use Tailwind spacing utilities (`p-4`, `gap-2`) and the `Text` component's variants (`heading`, `headingSm`, `label`, `labelSm`, `body`) for typography.
- The app's `src/index.css` already does `@import '@open20/ui/styles.css';` — no extra CSS wiring needed.

### 2.5 Spellbook reference patterns (mirror, don't import app code)

- Store: plain `create<State>((set,get)=>...)` — **no** Zustand `persist` middleware; persistence is manual in a `StorageService` class (localStorage, try/catch JSON). Character-sheet keys should be `open20-character-sheet-*`.
- Bootstrap: `main.tsx` does `await initContent()` before `createRoot().render()`. (Content import is sync; the async wrapper only exists to merge homebrew — for MVP you may init synchronously.)
- App shell: `App.tsx` wraps in `I18nProvider`, applies `data-theme`, renders `<Layout/> + <DiceRollOverlay/> + <PwaReloadPrompt/>`. **No react-router** anywhere in spellbook; navigation is a responsive layout + breakpoint hook (`useIsLargeScreen`) + local-state modals/flyouts. Character-sheet may follow the same single-view approach (recommended for MVP).
- PWA: spellbook `vite.config.ts` uses `VitePWA` from `vite-plugin-pwa` (`registerType: 'autoUpdate'`, full manifest) + `createAlias`/`createGithubPagesBase` from `@open20/config/vite`, plus a `PwaReloadPrompt` component.
- `DiceRollOverlay` (`spellbook/src/components/dice/`) takes **no props** — reads `useRollStore().latestRoll` internally. `RollResult = { id, label, expression, total, timestamp }`. `useRollStore` (`spellbook/src/stores/rollStore.ts`): `{ recentRolls (cap 10), latestRoll, addRoll(Omit<RollResult,'id'|'timestamp'>), clearRolls }`; not persisted; auto-clears `latestRoll` after 5s. No history UI exists.
- `ConcentrationBanner` (`spellbook/src/components/character/CharacterSheet/`) takes `{ concentratingSpellId }` and resolves the name via spellbook's `spellService` — when reused, prop-inject a resolved `spellName` instead.

---

## 3. Task index

Tasks are grouped by PRD phase, one file per phase. **Each task is one deliverable ≈ one PR** — a single component (with its `index.ts` + test), one service/store file, one config change, or one core/ui extension. ID scheme: `T-0xx` setup + extensions, `T-1xx` P0 UI, `T-2xx` P1, `T-3xx` P2.

| Phase                                | File                                                   | Tasks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Foundation                       | [`phase-0-foundation.md`](./phase-0-foundation.md)     | T-001 PWA config, T-002 breakpoint hook, T-003 App providers+bootstrap, T-004 AppShell scaffold, T-005 ContentResolver, T-006 rollAdapter, T-007 StorageService, T-008 characterStore, T-009 test fixtures                                                                                                                                                                                                                                                                                                                                                                  |
| 0.5 — Core & shared-infra extensions | [`phase-0.5-extensions.md`](./phase-0.5-extensions.md) | T-010 dice extraction→ui, T-011 death-save auto-reset, T-012 attack→Weapon adapter, T-013 rollCharacterAbilityCheck, T-014 inspiration field, T-015 exhaustion penalties, T-016 senses/languages/size                                                                                                                                                                                                                                                                                                                                                                       |
| 1 — P0 UI                            | [`phase-1-p0-ui.md`](./phase-1-p0-ui.md)               | T-101 HpBar, T-102 DeathSaves, T-103 Abilities, T-104 SkillRow, T-105 SkillsList, T-106 SavingThrows, T-107 CombatStatCard, T-108 CombatStatsBar, T-109 WeaponAttackCard, T-110 WeaponAttacksList, T-111 SpeciesPanel, T-112 BackgroundPanel, T-113 Feats, T-114 SpellcastingHeader, T-115 SpellSlotRow, T-116 PreparedSpellList, T-117 Concentration, T-118 Rests, T-119 CharacterSelector, T-120 CreateWizard, T-121 EditDialog, T-122 DeleteConfirm, T-123 HeroCard, T-124 HeroStrip, T-125 Sidebar+nav, T-126 BottomTabBar+More, T-127 Sheet assembly, T-128 App states |
| 2 — P1                               | [`phase-2-p1.md`](./phase-2-p1.md)                     | T-201 EquipmentCard, T-202 EquipmentList, T-203 AddEquipmentDialog, T-204 Currency, T-205 HitDiceRow, T-206 ShortRestDialog, T-207 Condition add/remove, T-208 ExhaustionTracker, T-209 ConditionsSection, T-210 DamageDefenses, T-211 LevelUp class+HP, T-212 LevelUp features+ASI+subclass, T-213 LevelUp spells, T-214 LevelUp orchestration, T-215 Senses/Languages/Size, T-216 ClassFeatures, T-217 SpellBrowser, T-218 AbilityBreakdown, T-219 Inspiration cell                                                                                                       |
| 3 — P2                               | [`phase-3-p2.md`](./phase-3-p2.md)                     | T-301 Notes, T-302 Export, T-303 Import, T-304 Roll history                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Dependency spine

```
Foundation:  T-001 PWA          T-002 hook ─┐
             T-007 Storage ─ T-008 store ─── T-005 ContentResolver ─┐
             T-006 rollAdapter (needs T-010) ──────────────────────┤
             T-003 providers ─ T-004 AppShell ─────────────────────┤
                                                                    ▼
Phase 1 components (T-101…T-126, each depends on T-004/T-005/T-006/T-008 + its
   own extension) ──► T-127 Sheet assembly ──► T-128 states ──► Phase 2 ──► Phase 3

Extensions gate specific UI tasks:
   T-010 (dice→ui)        ► T-006, T-110, T-116, T-117, T-304
   T-011 (death reset)    ► T-102
   T-012 (attack adapter) ► T-109/T-110
   T-013 (ability check)  ► T-103
   T-014 (inspiration)    ► T-219
   T-015 (exhaustion)     ► T-208
   T-016 (senses strategy)► T-215
```

- **Parallelism:** all Phase 0.5 tasks (T-010–T-016) are independent of each other → run concurrently. Once T-004/T-005/T-006/T-008/T-009 land, most Phase 1 component tasks (T-101–T-126) are independent of each other and can run concurrently; only T-127 (assembly) and T-128 (states) must come after them.
- **Test fixtures (T-009)** are needed by nearly every UI/store test — land it early.

---

## 4. Corrections to PRD / Wireframe

Verified against source 2026-07-27. Apply these; they override the source docs.

1. **`RandomProvider` is an object, not `() => number`.** Wireframe §2.3 is wrong. Dice fns use `{ roll(min,max) }` (`defaultRandom`); rest/level-up fns use `{ d(max) }`. The rollAdapter exposes both. (T-006)
2. **FR-106 (ability breakdown) needs NO core extension.** `AbilityScores` already has `base/racialBonuses/backgroundBonuses/featBonuses/featGrants/temporaryBonuses`. PRD Appendix A item #7 and Core-Additions are obsolete for this FR. Downgrade to a pure display task (T-218).
3. **Design tokens `--space-*`, `--font-h1/h2/h3/display` do not exist.** Use Tailwind utilities + `Text` variants. (all UI tasks)
4. **Content is synchronous.** Wireframe §10.3 "ContentResolver async initialization" and the async loading state are optional — `srdContentPack` is a bundled constant. Init can be synchronous for SRD-only. (T-005)
5. **PWA is not wired.** `vite.config.ts` has only Tailwind+React; the `dist/sw.js`+`manifest.webmanifest` are stale. Add `vite-plugin-pwa`. (T-001)
6. **No `rollAbilityCheck` in core.** FR-105 requires building it or routing through skill-check machinery. (T-013)
7. **`calculateAC` returns an `ACResult` object**, not a number; and `rollCharacterSavingThrow` requires a `getClass` callback. Don't assume bare returns. UI should read `character.combatStats.AC` (populated by recompute), not call `calculateAC`.
8. **No react-router precedent** and Zustand `persist` is not used in the sibling apps. Follow the single-view + manual StorageService pattern unless a task says otherwise.
9. **`DiceRollOverlay` reads the store internally (no props).** When extracting to ui, either move the store too or refactor to prop-injection — decide in T-010 and keep it consistent.
10. **AGENTS.md says "52 FRs"** — the PRD is now 64 (FR-100~163). Ignore the stale count.
11. **No alignment in core.** Wireframe §7.4 step 1 lists an Alignment field, but neither `Character` nor `CreateCharacterParams` has one. Character creation omits it; species **subtype** (lineage) is collected instead, and is display-only — `RecomputeDerivedStatsDeps` has no subtype slot. (T-120)
12. **`buildDepsForCreate` used to drop `subclassId`.** Fixed in T-120: it now resolves `deps.subclasses` for the primary and every additional class, so subclass features and always-prepared spells apply at creation. Notes on SRD subclasses: there is **no `name` field** (the `id` is the display label); `grantedAtLevel` is 1 for Cleric/Warlock, 2 for Wizard and 3 for the rest, so a subclass picker must be level-gated; and the id `"College of Lore**"` carries stray markdown that should be fixed in `content-srd` (strip it in labels for now).
13. **Core does not grant the background's Origin Feat, and cannot see feats on the first recompute.** `createCharacter` only adds feats listed in `params.featIds` — it never reads `Background.originFeatId`, so the caller must pass it (T-120 does). Separately, `buildDepsForCreate` has no `Character` to read feat ids from, so it cannot populate `deps.feats`; core's internal recompute therefore runs feat-blind and any caller passing `featIds` must recompute again with `resolveDeps(created)`. No current SRD feat has an unconditional grant, so this is latent today — but it will bite the moment one does, or once creation grants equipment.
