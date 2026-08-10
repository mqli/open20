# Phase 2 — P1 Extensions

Inventory, resources, conditions, level-up, richer displays. Same shared conventions as [`phase-1-p0-ui.md`](./phase-1-p0-ui.md) (presentational, real tokens, lucide not emoji, NFR-01/02, read derived values, `makeCharacter()` tests). All depend on Phase 0/0.5/1 foundations; extra deps noted. Slot into `CharacterSheet` (T-127) + "More" menu. One component per task.

---

### T-201 — EquipmentCard (FR-122) — §6.8 — ✅ done

Item row: name, key stat (damage/AC), equipped checkmark toggle, remove `[-]`. Emits `onToggleEquip`/`onRemove`. **Accept:** renders equipped vs unequipped; emits callbacks. **Tests:** render both states; callbacks.

### T-202 — EquipmentList + equip actions (FR-122, FR-124~125) — §6.8 — ✅ done

**Depends on:** T-201, T-005 · Group `character.equipment` Weapons/Armor/Gear from `EquipmentCard`s. **Store:** `equipItem`/`unequipItem` → `equipItemAndRecompute`/`unequipItemAndRecompute(char,id,deps)`; `removeEquipment`. AC/attacks update via recompute. **Accept:** equip toggle recomputes AC/attacks; remove persists. **Tests:** equip/unequip call recompute variants w/ deps; AC changes after equipping armor (fixture integration); remove.

### T-203 — AddEquipmentDialog (FR-123) — §7.7 — ✅ done

**Depends on:** T-202, T-005 · Search + category filter over SRD weapons/armor/gear (ContentResolver getters), `[+]` to add; custom manual entry (name/type/weight). **Store:** `addEquipment` w/ synthetic `EquipmentItem`. **Accept:** add SRD + custom persist. **Tests:** filter; add SRD; add custom.

### T-204 — CurrencyRow (FR-126) — §6.8 — ✅ done

5 columns CP/SP/EP/GP/PP, coin icon + amount + `[-]/[+]` stepper (≥44px). **Store:** `modifyCurrency(char, Partial<Currency>)`. **Accept:** displays `character.currency`; steppers adjust + persist; no negative (clamp or verify core). **Tests:** stepper → `modifyCurrency` partial; render five.

### T-205 — HitDiceRow (FR-127) — §6.9

Per class: `Class dN used/level [Spend]` (total = class level; from `CharacterClass.hitDice`). `[Spend]` opens T-206. **Accept:** rows from `character.classes`. **Tests:** render used/total per class.

### T-206 — ShortRestDialog per-class selector (FR-128, FR-138) — §7.2

**Depends on:** T-205, T-118 · Per-class stepper for dice to spend + per-class heal preview (`Nd{die}+CON`), total recovery + new-HP preview. Take Rest → **sum selections → Store `shortRest(char, total, deps, restRng)`** (core tracks per-class `used`). Replaces T-118's simple short-rest prompt. **Accept:** previews + spends summed total; per-class `used` increments. **Tests:** sum logic; `shortRest` w/ total+deps+rng; preview math.

### T-207 — Condition add/remove (FR-129~130) — §6.10 — ✅ done

`ConditionChip` (dismissible, `--color-warning`, non-color label cue) + `AddConditionMenu` (dropdown of 15 `ConditionName`s minus Exhaustion, w/ descriptions from SRD glossary if available). **Store:** `toggleCondition`. **Accept:** add/remove conditions. **Tests:** chip dismiss; menu lists 15; add.

### T-208 — ExhaustionTracker (FR-158) — §6.10

**Depends on:** T-015 · 0–6 stepper stored as `ActiveCondition {name:'Exhaustion', level}`; live penalty text ("−{2×lvl} D20 Tests, −{5×lvl} ft Speed"); `--color-danger` tint at ≥4. Level change updates the Exhaustion condition (confirm core's representation; add tiny helper if needed). Actual roll/speed penalties come from T-015. **Accept:** level drives text (+ real penalties via T-015); tint ≥4. **Tests:** penalty text at 0/2/6; tint ≥4.

### T-209 — ConditionsSection assembly (FR-129~131, FR-158) — §6.10

**Depends on:** T-117, T-207, T-208 · Compose ConcentrationBanner + active-condition chips + AddConditionMenu + ExhaustionTracker into one section. **Accept:** all condition UIs together, correct order. **Tests:** section renders all sub-parts.

### T-210 — DamageDefensesSection (FR-132) — §6.11

Three groups from `character.damageDefenses`: Resistances/Immunities/Vulnerabilities, damage-type badges w/ distinct icons (shield/shield-check/broken-shield, not color-only). Empty → "(none)". **Accept:** three groups; empty states. **Tests:** each group; empty.

### T-211 — LevelUp: class-select + HP steps (FR-133~134) — §7.5

**Depends on:** T-005 · Step components: (1) choose class to advance / add new class (multiclass-aware); (2) HP — `[Roll dN]` (level RNG `{d(max)}`) or `[Take Average]`, show `+CON`. Emit partial `LevelUpOptions`. **Accept:** step UIs produce `classId`, `isNewClass?`, `hpChoice`. **Tests:** class options; HP roll (deterministic) vs average.

### T-212 — LevelUp: features + ASI/feat + subclass steps (FR-135, FR-137) — §7.5

**Depends on:** T-005 · Features preview from `Class.featuresByLevel`; ASI/Feat step at class levels 4/8/12/16/19 (ASI +2 one / +1 two, or feat from `getAllFeats()`); subclass step when the class reaches its subclass level. Emit `asiOrFeat?`, `subclassId?`. **Accept:** steps appear at correct levels; emit correct options. **Tests:** ASI-level gating; subclass-level gating; option assembly.

### T-213 — LevelUp: spell-selection step (FR-136) — §7.5

**Depends on:** T-005 · When the level grants new spells: `[n/m selected]` picker over class spell list (ContentResolver). Emit `newSpells?`. **Accept:** enforces n/m; emits selection. **Tests:** selection limit; emitted list.

### T-214 — LevelUpWizard orchestration + summary (FR-133~137) — §7.5

**Depends on:** T-211, T-212, T-213 · Orchestrate steps → assemble `LevelUpOptions {classId, subclassId?, hpChoice, asiOrFeat?, newSpells?, isNewClass?}` → **Store `levelUp(char, options, deps, levelRng)`** → recompute → persist → **change summary** (HP/slots/DC/prepared deltas). ⚠️ FR-136: ensure core `levelUp` multiclass spell-slot path has explicit test coverage before shipping (add a core test PR if missing). **Accept:** single + multiclass level-up produce correct recomputed character; summary shown. **Tests:** options assembly end-to-end; `levelUp` w/ correct options + rng; summary deltas.

### T-215 — Senses / Languages / Size display (FR-159~161) — §6.7

**Depends on:** T-016, T-111 · Extend `SpeciesPanel`: senses (darkvision/blindsight/tremorsense/truesight w/ range + icon), languages (badges), size label — via the T-016 API. Fallbacks when absent. **Accept:** High Elf → Darkvision 60 ft, Common+Elvish, Medium; no-species defaults. **Tests:** both fixtures.

### T-216 — ClassFeaturesPanel (FR-162) — §6.7

**Depends on:** T-005 · Per class, features up to `classes[].level` from `Class.featuresByLevel` (`getClassFeaturesUpToLevel`), expandable cards w/ description, resolved names. **Accept:** Wizard 5 → level-appropriate features expandable. **Tests:** filtered by level; expand; unknown class empty.

### T-217 — SpellBrowserDialog (FR-155) — §7.6

**Depends on:** T-116, T-005 · Modal from "+ Prepare More Spells"/"All Known". Search + level tabs (0–9) + school chips over `contentResolver.searchSpells`. Cards w/ school color (`--color-school-*`) + level badge (spellbook layout patterns, not code). Checkbox = prepared, respects prepared-count limit. **Store:** prepare/known actions → core preparation logic. **Accept:** search/filter; prepare respects limit; persists. **Tests:** filter name/level/school; prepare toggle; limit enforced.

### T-218 — AbilityScore breakdown (FR-106) — §6.2

**Depends on:** T-103 · ⚠️ **No core change** (README #2): use existing `base/racialBonuses/backgroundBonuses/featBonuses/featGrants/temporaryBonuses`. Expandable per-ability detail listing non-zero sources + total. **Accept:** STR expands to `base 15 + racial 1 = 16`. **Tests:** lists only non-zero sources; sums to total.

### T-219 — Inspiration cell (FR-157) — §6.5 — ✅ done

**Depends on:** T-014, T-108 · Fill CombatStatsBar's Inspiration slot: sparkle icon filled `--color-primary-400` when `character.inspiration` (+ non-color "ON/—" cue). **Store:** `toggleInspiration`. **Accept:** reflects state; tap toggles + persists. **Tests:** both states; tap → `toggleInspiration`.
