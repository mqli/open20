# Phase 0.5 — Core & Shared-Infra Extensions

Additions to `open20-core` and `@open20/ui` that Phase 1/2 UI depends on — the only tasks touching packages **outside** character-sheet. Each is independent and parallelizable. Every core/ui change needs tests in that package and must keep the existing suite green.

**Covers:** FR-103, FR-105, FR-117, FR-147, FR-157, FR-158, FR-159~161.

> Read `packages/core/AGENTS.md` before editing core — follow its immutable-update conventions, function naming, and layer boundaries (core must not import content).

---

### T-010 — Extract `DiceRollOverlay` + roll store into `@open20/ui` (FR-147, FR-148 groundwork) — ✅ done

**Depends on:** none · **Files:** `packages/ui/src/components/dice/DiceRollOverlay.tsx` (4-file rule), `packages/ui/src/stores/rollStore.ts` (+ test), `packages/ui/src/index.ts`, spellbook consumers.

- Move `DiceRollOverlay` + `useRollStore` from spellbook into `@open20/ui`. **Recommended coupling: move the store too** (overlay keeps reading it internally) — keeps both apps' call sites simple. Export both from the barrel.
- Extend `RollResult` (backward compatible): add `components?: {source,value}[]`, `mode?: 'single'|'weapon-attack'`, `rows?: {label,expression,total,components?}[]`, `isCritical?`, `isCriticalMiss?`.
- Extend overlay: modifier-breakdown line, weapon dual-row mode (§5.1), crit/miss states with **non-color glyph** (🎯/💥 as text, NFR-01) + color; respect `prefers-reduced-motion`.
- Keep last-10 history buffer + `clearRolls`; expose `recentRolls` (history UI is T-304). Update spellbook to import from ui; delete its copies; remove stale `packages/ui/dist/components/dice/*`.
- **Accept:** ui exports `DiceRollOverlay`/`useRollStore`/`RollResult`; spellbook consumes them, suite green. **Tests (ui):** single + weapon-mode + crit-glyph render; store cap-10 + auto-clear.

### T-011 — Death-save auto-reset in `modifyHP` (FR-103)

**Depends on:** none · **Files:** `packages/core/src/character/mutate/hp.ts` (+ tests)

- When current HP transitions **0 → >0**, reset `deathSaves` to `{successes:0,failures:0,isStable:false}`. No reset on other transitions. Immutable. `setTemporaryHP` untouched.
- **Accept:** 0→+ resets; +→+, +→0, 0→0 unchanged; existing tests pass. **Tests:** table-driven transitions.
- > Until merged, the app resets death saves in `characterStore.modifyHP`; remove that workaround once this lands.

### T-012 — CharacterAttack → Weapon adapter (FR-117)

**Depends on:** none · **Files:** `packages/core/src/character/attack-adapter.ts` (+ barrel, tests) — confirm home via `AGENTS.md`.

- `characterAttackToWeapon(attack: CharacterAttack): Weapon` — synthesize a minimal `Weapon` (`damage.entries` from the `damage` string / `damageEntries`; `ability`/`bonus` from the attack; default properties/category) sufficient for `rollCharacterAttack`/`rollCharacterWeaponDamage`. Document lossy assumptions; define/validate the required `CharacterAttack` fields.
- Optional convenience `rollStoredAttack({character,attack,rng})` / `rollStoredAttackDamage(...)`.
- **Accept:** a representative attack (Longsword +6, 1d8+3 slashing, versatile) round-trips through both roll fns incl. crit doubling. **Tests:** string + entries damage forms; crit path doubles dice.

### T-013 — Generic `rollCharacterAbilityCheck` (FR-105) — ✅ done

**Depends on:** none · **Files:** `packages/core/src/rolls/character.ts` (+ barrel, tests)

- `rollCharacterAbilityCheck({character, ability, rollModifier?, dc?, rng}) → CheckResult & {ability}` — d20 + ability modifier (`getModifier(getTotalScore(scores,ability))`), no proficiency. Mirror `rollCharacterSkillCheck` shape/return. Prefer this name over the PRD's `rollAbilityCheck`.
- **Accept:** d20 + mod; optional `dc`/`rollModifier`; deterministic under `createDeterministicRNG`; exported top-level. **Tests:** STR 16 (+3), d20=10 → 13; DC + crit flags.

### T-014 — `Character.inspiration` field + helper (FR-157)

**Depends on:** none · **Files:** `packages/core/src/types/character.ts`, mutate helper, Zod `CharacterSchema`, serializer migration, tests.

- Add `readonly inspiration: boolean` (default false) + `toggleInspiration(char)`/`setInspiration(char,v)`. Update Zod schema + `createCharacter` defaults. `deserialize` tolerates legacy data (default false); bump schema version only per core's convention.
- **Accept:** new chars `false`; toggle flips immutably; legacy JSON → `false`. **Tests:** toggle; legacy deserialize.

### T-015 — Exhaustion auto-penalties on d20 tests + speed (FR-158)

**Depends on:** none · **Files:** `packages/core/src/engine/*` (d20 paths, speed) + shared helper + tests.

- D&D 2024: **−2×level to all d20 Tests** (ability/skill/save/attack/initiative) and **−5 ft×level to speed**. Today only passive perception applies it. Promote a shared `getExhaustionPenalty(conditions)` (from the local one in `passive-perception.ts`); thread it into the character roll fns and derived speed in `recomputeDerivedStats`. No double-application; passive-perception behavior unchanged. Level-6 death is display-only.
- **Accept:** level 2 → −4 on d20 rolls, −10 ft speed, passive perception unchanged. **Tests:** each roll fn subtracts `2*level`; speed `-5*level`; level 0 no-op.

### T-016 — Senses / languages / size resolution strategy (FR-159~161)

**Depends on:** none · **Files:** decision note in PR + either core type additions OR content-srd helpers (+ tests).

- Choose ONE and document in the PR (+ update README §4):
  - **(A) render-time query (recommended, no core change):** add `@open20/content-srd` helpers `getSensesForCharacter/getLanguagesForCharacter/getSizeForCharacter(char, pack)`; ContentResolver (T-005) re-exposes them.
  - **(B) denormalize onto `Character`** in `recomputeDerivedStats` (core change).
- **Accept:** High Elf fixture → Darkvision 60 ft, Common+Elvish, Medium; empty species → sensible defaults. **Tests:** both fixtures. T-215 consumes this API.
