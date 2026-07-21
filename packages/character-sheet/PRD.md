# D&D 2024 Character Sheet App — Product Requirements Document (PRD)

**Document Version**: v1.4  
**Date**: 2026-07-21  
**Package**: `@open20/character-sheet` (standalone app at `packages/character-sheet/`)  
**Product Owner**: [TBD]  
**Status**: Draft

---

## 1. Problem Statement (Why)

### Core Problems

D&D players face significant friction in managing character information during gameplay:

1. **Scattered Information**: Character data (HP, spell slots, equipment, conditions, abilities) is spread across paper sheets, spell cards, and mental notes — no single source of truth.
2. **Manual Calculation Burden**: Players must recalculate AC, skill bonuses, saving throws, and spell DCs whenever stats change — prone to errors and slows down gameplay.
3. **Resource Tracking Fatigue**: Tracking HP changes, hit dice expenditure, spell slot consumption, currency, and condition durations across a 3-4 hour session is tedious and error-prone.
4. **Level-Up Complexity**: D&D 2024 level-up involves HP rolling, spell slot recalculation, ASI/feat selection, and multiclass constraints — difficult to get right without tooling.
5. **Rule Accessibility Gap**: New players struggle to understand what modifiers apply to which roll; experienced players want speed, not manual lookups.

### User Value

- **One-Page Character Dashboard**: All combat stats, abilities, skills, spells, equipment, and resources in a single responsive interface.
- **Tap-to-Roll**: Any d20 check (skill, save, attack, ability) is one click away — no mental math.
- **Automated Resource Tracking**: HP, hit dice, spell slots, currency, and conditions auto-update with validation against D&D 2024 rules.
- **Guided Level-Up**: Step-by-step level-up wizard that handles HP rolling, ASI/feat choices, and multiclass rules.
- **Offline-First**: Full functionality without network, designed for tabletop environments.

---

## 2. Target Users

| User Role                 | Description                                                                   | Core Needs                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Players (All Classes)** | Anyone playing a D&D 2024 character                                           | Full character sheet with HP, stats, skills, inventory, spells, level-up                            |
| **Spellcasting Players**  | Wizards, Clerics, Druids, Sorcerers, Warlocks, Bards, Paladins, Rangers, etc. | Spell slot tracking, preparation management, spell attack/damage rolling (inherited from spellbook) |
| **Martial Players**       | Fighters, Barbarians, Rogues, Monks                                           | HP tracking, weapon attacks, skill checks, equipment management                                     |
| **Dungeon Master (DM)**   | Game host managing NPCs or referencing player stats                           | Quick stat lookup, condition tracking, dice rolling                                                 |
| **New Players**           | Players new to D&D 2024                                                       | Guided creation, rule assistance, simplified interface                                              |

---

## 3. User Stories

### Priority P0 (Core MVP — Full Character Sheet)

1. **As a** player, **I want to** see my current/max/temporary HP at a glance and adjust it with +/- controls, **so that** I can track damage and healing during combat without mental math.
2. **As a** player, **I want to** view my 6 ability scores with modifiers and tap any one to roll an ability check, **so that** I can quickly resolve ability checks at the table.
3. **As a** player, **I want to** see all 18 skill bonuses on my character sheet and tap to roll a skill check, **so that** I know exactly what to add and can roll instantly.
4. **As a** player, **I want to** view my 6 saving throw bonuses and tap to roll a save, **so that** I can respond to spell effects and hazards quickly.
5. **As a** player, **I want to** see my AC, initiative bonus, speed, passive perception, and proficiency bonus prominently displayed, **so that** I have all combat stats at my fingertips.
6. **As a** player, **I want to** track death saving throws (successes/failures) with one-tap toggle, **so that** I can accurately track life-or-death moments.
7. **As a** player, **I want to** see my species traits and background features on my character sheet, **so that** I remember my racial abilities and background perks.
8. **As a** player, **I want to** view my feat list and what each feat grants, **so that** I don't forget feat benefits during gameplay.
9. **As a** player, **I want to** see my weapon attacks listed with attack bonus and damage, and tap to roll, **so that** I can resolve attacks without calculating modifiers.
10. **As a** spellcasting player, **I want to** manage spell slots, prepared spells, and concentration, **so that** spellcasting remains fully integrated with the character sheet.
11. **As a** player, **I want to** take a short or long rest with one tap and have all resources (HP, hit dice, spell slots) auto-recover, **so that** rest mechanics are fast and rules-compliant.
12. **As a** player, **I want to** create and switch between multiple characters, **so that** I can manage different builds or help other players at the table.

### Priority P1 (Important Extensions)

13. **As a** player, **I want to** manage my equipment inventory (weapons, armor, gear) — add, remove, equip, unequip — **so that** my AC and attacks auto-update when I change gear.
14. **As a** player, **I want to** track and modify my currency (CP, SP, EP, GP, PP) with simple +/- controls, **so that** I can manage loot and purchases during the game.
15. **As a** player, **I want to** see my remaining hit dice by class and spend them during short rests, **so that** I can heal correctly between encounters.
16. **As a** player, **I want to** apply and remove D&D 2024 conditions (Poisoned, Frightened, Invisible, etc.) with one tap, **so that** I can track status effects that modify my rolls.
17. **As a** player, **I want to** level up my character through a guided step-by-step wizard that handles HP rolling, ASI/feat selection, and spell slot recalculation, **so that** leveling up is fast and rules-compliant.
18. **As a** player, **I want to** see my damage resistances, immunities, and vulnerabilities, **so that** I know how different damage types affect me.

### Priority P2 (Nice to Have)

19. **As a** player, **I want to** write free-form notes on my character sheet, **so that** I can record campaign-specific information.
20. **As a** player, **I want to** export my character sheet as JSON for backup or sharing, **so that** I can preserve my character data outside the app.
21. **As a** player, **I want to** import a character sheet from a JSON file, **so that** I can restore a backup or use a pre-built character.
22. **As a** player, **I want to** compare stats between my active character and a secondary character, **so that** I can reference another build while playing.

### Story ↔ FR Cross-Reference

The following FRs intentionally have no dedicated user story (they are subsumed by broader stories above, or are technical enablers):

- **FR-106** (ability score breakdown display, P1) — extends story #2 (ability scores); display-only enhancement.
- **FR-148** (roll history, P2) — extends the general tap-to-roll experience (stories #2~4, #9); not a standalone workflow.
- **FR-163** (offline-first PWA, P0) — technical enabler for all stories; no user-facing interaction of its own.

---

## 4. Functional Requirements

> **FR numbering convention**: FR numbers are globally unique IDs. Numbers may appear non-sequential within a section when new requirements were added in later versions (e.g., FR-157~161 were added in v1.2). Sections may contain mixed priority levels where a single item (e.g., Concentration in Conditions) has elevated importance relative to its section peers.

### 4.1 HP & Death Saves

| ID     | Requirement Description                                         | Priority | Core Dependency                                             | UI Notes                                                                                                                                                                                                                                             |
| ------ | --------------------------------------------------------------- | -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-100 | Display current/max/temporary HP with large, readable numbers   | P0       | `hitPoints.current/max/temporary` (核心已有)                | Prominent hero section at top of character sheet. Current HP in large display font. Max HP below. Temp HP as a separate pill/badge.                                                                                                                  |
| FR-101 | HP adjustment: +/- buttons with configurable increment (1/5/10) | P0       | `modifyHP()` (核心已有)                                     | Row of quick-adjust buttons. Long-press for custom value input.                                                                                                                                                                                      |
| FR-102 | Temporary HP input and display                                  | P0       | `setTemporaryHP()` (核心已有)                               | Separate input field or quick-add button. Shows as distinct colored overlay on HP bar.                                                                                                                                                               |
| FR-103 | Death save tracker: 3 successes / 3 failures with tap-to-toggle | P0       | `hitPoints.deathSaves` (核心已有；需核心扩展：回血自动重置) | Three circle icons for successes (filled green on tap), three for failures (filled red on tap). Auto-reset on long rest (核心已有) or when HP > 0 (需核心扩展 — `modifyHP()` does not currently reset death saves). Auto-mark stable at 3 successes. |

### 4.2 Ability Scores

| ID     | Requirement Description                                        | Priority | Core Dependency                               | UI Notes                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-104 | Display all 6 ability scores with modifier (e.g., "STR 16 +3") | P0       | `abilityScores` + `getModifier()` (核心已有)  | 2x3 grid or compact row. Score in large text, modifier badge beside it. Use `getModifier()` for modifier.                                                                                        |
| FR-105 | Tap ability score to roll ability check (d20 + mod)            | P0       | `rollAbilityCheck()` (需核心扩展)             | Tapping opens dice overlay with d20 result + modifier. Core currently has `rollCharacterSkillCheck`/`rollCharacterSavingThrow` but no generic ability check — needs `rollAbilityCheck` addition. |
| FR-106 | Display ability score breakdown (base + racial + feat bonuses) | P1       | (需核心扩展：AbilityScores 需记录 bonus 来源) | Expandable detail showing where each bonus comes from. Core `AbilityScores` currently stores only final scores without base/racial/feat source tracking.                                         |

### 4.3 Skills

| ID     | Requirement Description                                                                | Priority | Core Dependency                        | UI Notes                                                                                                            |
| ------ | -------------------------------------------------------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR-107 | Display all 18 skills with total bonus, proficiency indicator, and expertise indicator | P0       | `getSkillBonus()` (核心已有)           | Scrollable list grouped by ability. Proficient: filled circle. Expertise: star icon. Total bonus prominently shown. |
| FR-108 | Tap any skill to roll a skill check (d20 + bonus)                                      | P0       | `rollCharacterSkillCheck()` (核心已有) | Tapping opens dice overlay. Critical success/failure highlighted.                                                   |

### 4.4 Saving Throws

| ID     | Requirement Description                                   | Priority | Core Dependency                         | UI Notes                                                                            |
| ------ | --------------------------------------------------------- | -------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| FR-109 | Display 6 saving throw bonuses with proficiency indicator | P0       | `getSavingThrowBonus()` (核心已有)      | Compact row or paired with ability scores. Proficient saves visually distinguished. |
| FR-110 | Tap saving throw to roll (d20 + bonus)                    | P0       | `rollCharacterSavingThrow()` (核心已有) | Opens dice overlay with result.                                                     |

### 4.5 Combat Stats

| ID     | Requirement Description              | Priority | Core Dependency                                                             | UI Notes                                                                                                     |
| ------ | ------------------------------------ | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| FR-111 | Display Armor Class (AC) prominently | P0       | `combatStats.AC` / `calculateAC()` (核心已有)                               | Large shield icon with AC number. In a combat stats bar.                                                     |
| FR-112 | Display Initiative bonus             | P0       | `combatStats.initiative` / `calculateInitiative()` (核心已有)               | Show modifier. Tap to roll initiative (d20 + mod).                                                           |
| FR-113 | Display Speed                        | P0       | `combatStats.speed` (核心已有)                                              | Simple text label in combat stats bar.                                                                       |
| FR-114 | Display Passive Perception           | P0       | `combatStats.passivePerception` / `calculatePassivePerception()` (核心已有) | Text label with eye icon.                                                                                    |
| FR-115 | Display Proficiency Bonus            | P0       | `combatStats.proficiencyBonus` / `getProficiencyBonus()` (核心已有)         | Badge showing "+N".                                                                                          |
| FR-157 | Inspiration tracker                  | P1       | (需核心扩展：`Character.inspiration` 字段)                                  | Toggleable icon/badge. Tap to grant or spend inspiration. Core `Character` has no `inspiration` field today. |

### 4.6 Weapon Attacks

| ID     | Requirement Description                                                    | Priority | Core Dependency                                                    | UI Notes                                                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-116 | Display weapon attacks from character.combatStats.attacks                  | P0       | `combatStats.attacks` (核心已有)                                   | List of attacks showing name, attack bonus, damage dice + modifier, damage type.                                                                                                                        |
| FR-117 | Tap attack to roll attack roll (d20 + attackBonus) + damage simultaneously | P0       | `rollCharacterAttack()` + `rollCharacterWeaponDamage()` (需适配层) | Dice overlay shows attack roll result, then damage roll. Core roll functions take a `Weapon` object, not the stored `CharacterAttack` — a mapping/adapter layer (CharacterAttack → Weapon) is required. |

### 4.7 Species, Background, Feats & Class Features

| ID     | Requirement Description                                         | Priority | Core Dependency                                                                                                     | UI Notes                                                                                                                                                                                                                                                                       |
| ------ | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-118 | Display species name and subtype on character sheet             | P0       | `species`, `speciesSubtype` (核心已有)                                                                              | Species name with subtype in parentheses.                                                                                                                                                                                                                                      |
| FR-119 | Display species traits (from SRD content pack data)             | P0       | Content pack species data (content-srd 已有)                                                                        | Expandable section listing traits from the species definition.                                                                                                                                                                                                                 |
| FR-120 | Display background name and feature                             | P0       | Content pack background data (content-srd 已有)                                                                     | Background name + feature description.                                                                                                                                                                                                                                         |
| FR-121 | Display feat list with feat descriptions and granted benefits   | P0       | `feats` array (核心已有)                                                                                            | List of feat names. Tap to expand for description and granted features.                                                                                                                                                                                                        |
| FR-159 | Display senses (darkvision, blindsight, tremorsense, truesight) | P1       | (需核心扩展或物种数据查询策略)                                                                                      | Icons + range labels for each sense. `Character` has no `senses` field — derive from species data in content pack at render time, or add denormalized field to Character.                                                                                                      |
| FR-160 | Display languages and tool proficiencies                        | P1       | (需核心扩展或物种/背景数据查询策略)                                                                                 | Comma-separated list or compact badges. `Character` has no `languages`/`toolProficiencies` fields — derive from species/background/class content data, or add fields to Character.                                                                                             |
| FR-161 | Display character size                                          | P1       | (需核心扩展或物种数据查询策略)                                                                                      | Simple label (Tiny / Small / Medium / Large / Huge / Gargantuan). `Character` has no `size` field — derive from species data, or add field to Character.                                                                                                                       |
| FR-162 | Display class features for each class level                     | P1       | content-srd `classes.json` `featuresByLevel` (数据已有；Character 不存储 features，需渲染时按 classes[].level 查询) | Expandable section per class listing features gained at each level (e.g., Channel Divinity, Rage, Sneak Attack, Wild Shape). Tap feature name for full description from SRD data. Note: `CharacterClass` has no `features` field; features are derived from content pack data. |

### 4.8 Equipment & Inventory

| ID     | Requirement Description                                    | Priority | Core Dependency                                                   | UI Notes                                                                |
| ------ | ---------------------------------------------------------- | -------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR-122 | Display equipment list with equip/unequip status           | P1       | `equipment` array (核心已有)                                      | Grouped by: Weapons, Armor, Gear. Equipped items marked with checkmark. |
| FR-123 | Add equipment from SRD content pack or custom entry        | P1       | `addEquipment()` (核心已有)                                       | Search/select from SRD equipment list + manual entry option.            |
| FR-124 | Remove equipment                                           | P1       | `removeEquipment()` (核心已有)                                    | Delete button per item.                                                 |
| FR-125 | Equip/unequip toggle that triggers AC/attack recomputation | P1       | `equipItemAndRecompute()`, `unequipItemAndRecompute()` (核心已有) | Toggle switch per item. AC and attacks update reactively.               |

### 4.9 Currency

| ID     | Requirement Description                                   | Priority | Core Dependency                            | UI Notes                                                                         |
| ------ | --------------------------------------------------------- | -------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| FR-126 | Display currency (CP, SP, EP, GP, PP) with +/- adjustment | P1       | `currency` + `modifyCurrency()` (核心已有) | 5-row currency tracker. Each row: coin type icon + current amount + / - buttons. |

### 4.10 Hit Dice

| ID     | Requirement Description                                 | Priority | Core Dependency                                      | UI Notes                                                                                              |
| ------ | ------------------------------------------------------- | -------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FR-127 | Display remaining hit dice per class (e.g., "d10: 3/5") | P1       | `classes[].hitDice` (核心已有)                       | One row per class showing die type + remaining/total.                                                 |
| FR-128 | Spend hit dice during short rest UI                     | P1       | `shortRest()` with `hitDiceToSpend` param (核心已有) | Short rest dialog lets player choose how many hit dice to spend per class. Shows HP recovery preview. |

### 4.11 Conditions

| ID     | Requirement Description                                | Priority | Core Dependency                                                                                                       | UI Notes                                                                                                                                                                                                                                                                                                                                |
| ------ | ------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-129 | Display active conditions with tap-to-remove           | P1       | `conditions` array + `toggleCondition()` (核心已有)                                                                   | Active conditions shown as dismissible chips/badges.                                                                                                                                                                                                                                                                                    |
| FR-130 | Add condition from the 15 D&D 2024 standard conditions | P1       | `ConditionName` union type (核心已有)                                                                                 | Dropdown/menu of all 15 conditions with brief descriptions. Tap to apply.                                                                                                                                                                                                                                                               |
| FR-131 | Concentration tracker                                  | P0       | `concentration` + `startConcentration()`/`endConcentration()` (核心已有)                                              | Amber banner with concentrated spell name + dismiss button. `ConcentrationState` stores `spellId` only — UI resolves the spell name via content pack. Elevated to P0 (vs. other P1 conditions) because concentration is critical for spellcasting and directly impacts gameplay flow. Cross-reference: Spell Management (section 4.19). |
| FR-158 | Exhaustion tracker (6 levels, D&D 2024 rules)          | P1       | Exhaustion 为 `conditions[]` 中带 `level: 1-6` 的 `ActiveCondition` (核心已有字段；需核心扩展：D20 检定/速度自动减值) | 0-6 level indicator. Each level shows its penalty (D20 Tests −2/level, Speed −5 ft/level, death at 6). +/- controls. Core today only auto-applies the penalty to passive Perception; auto-applying it to d20 rolls and speed requires a core extension.                                                                                 |

### 4.12 Damage Defenses

| ID     | Requirement Description                                     | Priority | Core Dependency             | UI Notes                                                                                                                     |
| ------ | ----------------------------------------------------------- | -------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| FR-132 | Display damage resistances, immunities, and vulnerabilities | P1       | `damageDefenses` (核心已有) | Three sections: Resistances (half damage), Immunities (no damage), Vulnerabilities (double damage). Each lists damage types. |

### 4.13 Level-Up

| ID     | Requirement Description                                                     | Priority | Core Dependency                             | UI Notes                                                                                                                      |
| ------ | --------------------------------------------------------------------------- | -------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| FR-133 | Guided level-up wizard: select class to level (multiclass-aware)            | P1       | `levelUp()` (核心已有)                      | Step 1: Choose which class to advance if multiclass.                                                                          |
| FR-134 | HP increase: roll hit die or take fixed value                               | P1       | `levelUp()` options (核心已有)              | Step 2: Show hit die type. "Roll" button (dice animation) or "Take Average" button. Display result + CON mod = total HP gain. |
| FR-135 | ASI/Feat selection at appropriate levels (4, 8, 12, 16, 19 per class)       | P1       | `levelUp()` options (核心已有)              | Step 3 (if applicable): Choose ASI (+2 to one or +1 to two) or select a feat from available list.                             |
| FR-136 | Auto-recalculate spell slots, spell DC, attack bonus, prepared spells count | P1       | `levelUp()` already handles this (核心已有) | After level-up, all stats refresh automatically. Show summary of changes.                                                     |
| FR-137 | Subclass selection at appropriate class level                               | P1       | Core supports subclass selection (核心已有) | Step for selecting subclass when character reaches the required level.                                                        |

### 4.14 Rests

| ID     | Requirement Description                                                               | Priority | Core Dependency          | UI Notes                                                                               |
| ------ | ------------------------------------------------------------------------------------- | -------- | ------------------------ | -------------------------------------------------------------------------------------- |
| FR-138 | Short Rest: select hit dice to spend, auto-recover short-rest resources               | P0       | `shortRest()` (核心已有) | Re-implemented using open20-core shortRest(). Includes hit dice selection UI (FR-128). |
| FR-139 | Long Rest: full HP, all hit dice, all spell slots, reset death saves, reset resources | P0       | `longRest()` (核心已有)  | Re-implemented using open20-core longRest(). Confirmation dialog.                      |

### 4.15 Layout & Navigation

| ID     | Requirement Description                                                                                     | Priority | Core Dependency                                        | UI Notes                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| FR-140 | Desktop: Full-page character sheet layout with tab/section navigation                                       | P0       | N/A (UI only)                                          | Character sheet fills the viewport. Sections organized vertically or with sidebar navigation.                                     |
| FR-141 | Mobile: Single-column scrollable character sheet with bottom tab navigation                                 | P0       | N/A (UI only)                                          | Bottom tab bar for quick section jump (Combat, Skills, Spells, Inventory).                                                        |
| FR-142 | Character sheet organized in collapsible sections (HP, Abilities, Skills, Combat, Spells, Equipment, Feats) | P0       | N/A (UI only)                                          | Accordion or section-based layout. Core combat section always visible. Optional sections collapsed by default on mobile.          |
| FR-143 | Character selector (multi-character support)                                                                | P0       | Zustand character store (localStorage-backed)          | Dropdown or menu to switch between saved characters. Create/edit/delete from character list.                                      |
| FR-163 | Offline-first PWA: installable, full functionality without network                                          | P0       | N/A (UI/infra only; spellbook PWA config as reference) | Service worker precaches app shell + SRD content pack data. All character data in localStorage. Works fully offline at the table. |

### 4.16 Character Creation & Editing

| ID     | Requirement Description                                                       | Priority | Core Dependency                      | UI Notes                                                                                                               |
| ------ | ----------------------------------------------------------------------------- | -------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| FR-144 | Character creation with: name, species, background, class(es), ability scores | P0       | `createCharacter()` (核心已有)       | Re-implemented using open20-core createCharacter(). Support ability score input (point buy / standard array / manual). |
| FR-145 | Character editing: update any field and recompute derived stats               | P0       | `recomputeDerivedStats()` (核心已有) | Edit dialog that supports all character fields, not just spell-related ones.                                           |
| FR-146 | Delete character with confirmation                                            | P0       | characterStore                       | Delete button with confirmation dialog.                                                                                |

### 4.17 Dice Rolling Integration

| ID     | Requirement Description                                                                       | Priority | Core Dependency                                                               | UI Notes                                                                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-147 | Unified DiceRollOverlay for all roll types (skill, save, attack, ability, initiative, damage) | P0       | rolls/ module (核心已有) + DiceRollOverlay (需从 spellbook 提取到 @open20/ui) | Extract `DiceRollOverlay` from `@open20/spellbook` (`src/components/dice/`) into `@open20/ui`, then extend to handle all roll types. Show modifier breakdown. Critical hit/miss highlighting.                                               |
| FR-148 | Roll history accessible from anywhere in the app                                              | P2       | rollStore (需从 spellbook 提取并扩展；目前无 roll history UI)                 | Extract `useRollStore` from `@open20/spellbook` (`src/stores/rollStore.ts`) into a shared location and extend it to record roll history (last N rolls with timestamp and context). No roll-history UI exists today — this FR builds it new. |

### 4.18 Notes & Export

| ID     | Requirement Description                  | Priority | Core Dependency                      | UI Notes                                                                                                                               |
| ------ | ---------------------------------------- | -------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| FR-149 | Free-text notes field on character sheet | P2       | `notes` field (核心已有)             | Simple textarea in a collapsible section. Debounced auto-save (500ms after last keystroke) to character data.                          |
| FR-150 | Export character as JSON file            | P2       | `serialize()` (核心已有，独立函数)   | Download button generates .json file with full character data. Uses core's standalone `serialize(char: Character): string`.            |
| FR-151 | Import character from JSON file          | P2       | `deserialize()` (核心已有，独立函数) | Upload button. Uses core's standalone `deserialize()` (includes Zod validation). Warn on overwrite if character with same name exists. |

### 4.19 Spell Management

| ID     | Requirement Description                                            | Priority | Core Dependency                                                                                                                                 | UI Notes                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-152 | Display spell save DC and spell attack bonus prominently           | P0       | `ClassSpellData.spellSaveDC` / `getSpellAttackBonusForClass()` (核心已有，注意：无 `calculateSpellSaveDC`/`calculateSpellAttackBonus` 具名导出) | In combat stats bar or spell section header. Auto-updates when ability scores / PB change. Read DC from computed `ClassSpellData`; attack bonus via `getSpellAttackBonusForClass()` / `getBestSpellAttackBonus()`. |
| FR-153 | Display spell slots by level with +/- consumption controls         | P0       | `spellSlots` + `consumeSpellSlot()`/`recoverSpellSlot()` (核心已有)                                                                             | Grid or stacked rows: level 1-9, showing remaining/max. Tap to expend, long-press to recover.                                                                                                                      |
| FR-154 | Prepared/Known spell management with per-day preparation selection | P0       | `preparedSpells`/`knownSpells` + preparation logic (核心已有)                                                                                   | Toggle between Prepared and Known mode. Checkbox list for daily preparation selection.                                                                                                                             |
| FR-155 | Spell search and browse from SRD content pack                      | P1       | Content pack spells data (content-srd 已有), spell query utilities                                                                              | Search bar with filters (level, school, class). Tap spell to view details and cast.                                                                                                                                |
| FR-156 | Cast spell: consume slot, roll attack/damage via DiceRollOverlay   | P0       | `castSpell()` / roll functions (核心已有)                                                                                                       | Tap spell → expend appropriate slot → open DiceRollOverlay with attack + damage results.                                                                                                                           |

---

## 5. Non-goals

The following features are **explicitly NOT included** in this version:

1. **No real-time multiplayer sync** — Character data is local-only (localStorage). No cloud sync, no party sharing.
2. **No combat tracker / initiative tracker** — Initiative rolling is supported, but full turn-order tracking is out of scope.
3. **No custom/homebrew species, backgrounds, or feats creation** — These are managed in @open20/rulebook. The character sheet consumes them, not creates them.
4. **No dice animation engine** — Simple result display only. No 3D physics-based dice rolling.
5. **No character portrait / image upload** — Text-only character data.
6. **No encounter builder or monster management** — Monster data exists in core but DM tools are a separate product.
7. **No rulebook / compendium browsing** — Reference content is look-up only for character creation, not a full browsable compendium.
8. **No support for non-D&D 2024 rules** — No 2014 legacy compatibility (unless content packs provide it), no other RPG systems.
9. **No spell custom creation in the character sheet** — Custom spells are created via the rulebook. The character sheet only references existing spells.
10. **No printing / PDF export** — JSON export only in this version.

---

## 6. Appendix

### A. Dependency Matrix

Core dependencies used by the character sheet. **Verified against `packages/core/src` on 2026-07-21.** Names below are the actual exports. Items marked ⚠️ require a core extension or adapter — they are NOT available today.

| FR Range                              | Core Dependencies (actual export names)                                                                                                                                                                                    | Status Notes                                                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-100~103 (HP)                       | `modifyHP()`, `setTemporaryHP()`, `HitPoints` type, `DeathSaves` type                                                                                                                                                      | ⚠️ FR-103: `longRest()` resets death saves, but `modifyHP()` does NOT reset them when HP > 0 — needs core fix                                                                                |
| FR-104~106 (Abilities)                | `getModifier()`, `AbilityScores` type                                                                                                                                                                                      | ⚠️ FR-105: no generic ability-check roll (see additions below). ⚠️ FR-106: `AbilityScores` does not track base/racial/feat bonus sources — needs core extension                              |
| FR-107~108 (Skills)                   | `getSkillBonus()`, `rollCharacterSkillCheck()`, `skills` type                                                                                                                                                              | All exist                                                                                                                                                                                    |
| FR-109~110 (Saves)                    | `getSavingThrowBonus()`, `rollCharacterSavingThrow()`                                                                                                                                                                      | All exist                                                                                                                                                                                    |
| FR-111~115 (Combat)                   | `calculateAC()`, `calculateInitiative()`, `calculatePassivePerception()`, `getProficiencyBonus()`, `CombatStats` type                                                                                                      | All exist                                                                                                                                                                                    |
| FR-157 (Inspiration)                  | —                                                                                                                                                                                                                          | ⚠️ No `inspiration` field on `Character` — needs core extension                                                                                                                              |
| FR-116~117 (Attacks)                  | `combatStats.attacks`, `CharacterAttack` type, `rollCharacterAttack()`, `rollCharacterWeaponDamage()`                                                                                                                      | ⚠️ Roll functions take a `Weapon` object, not `CharacterAttack` — needs adapter/mapping layer                                                                                                |
| FR-118~121 (Species/BG/Feats)         | `species`, `speciesSubtype`, `background`, `feats` fields; content-srd species/backgrounds/feats data                                                                                                                      | All exist                                                                                                                                                                                    |
| FR-159~161 (Senses/Languages/Size)    | —                                                                                                                                                                                                                          | ⚠️ `Character` has no `senses`/`languages`/`toolProficiencies`/`size` fields — derive from species/background content data at render time, or add denormalized fields (needs core extension) |
| FR-162 (Class Features)               | content-srd `classes.json` `featuresByLevel` + `Character.classes[].level`                                                                                                                                                 | ⚠️ `CharacterClass` has no `features` field — features are derived from content pack data at render time; no core change needed if UI queries deps                                           |
| FR-122~125 (Equipment)                | `equipItemAndRecompute()`, `unequipItemAndRecompute()`, `addEquipment()`, `removeEquipment()`, `EquipmentItem` type                                                                                                        | All exist                                                                                                                                                                                    |
| FR-126 (Currency)                     | `modifyCurrency()`, `Currency` type                                                                                                                                                                                        | All exist                                                                                                                                                                                    |
| FR-127~128 (Hit Dice)                 | `shortRest()` (accepts `hitDiceToSpend`), `CharacterClass.hitDice` type                                                                                                                                                    | All exist                                                                                                                                                                                    |
| FR-129~131 (Conditions/Concentration) | `toggleCondition()`, `startConcentration()`, `endConcentration()`, `ConditionName` union type (15 conditions + `'Concentrating'` variant), `ConcentrationState`                                                            | All exist. Note: `ConcentrationState` stores `spellId` only — UI resolves spell name via content pack                                                                                        |
| FR-158 (Exhaustion)                   | Exhaustion as `ActiveCondition` with `level?: 1-6` in `conditions[]`                                                                                                                                                       | ⚠️ No standalone `exhaustion` field (use condition level). ⚠️ Auto-penalty currently only applied to passive Perception — D20 rolls and speed penalties need core extension                  |
| FR-132 (Defenses)                     | `DamageDefenses` type                                                                                                                                                                                                      | All exist                                                                                                                                                                                    |
| FR-133~137 (Level-Up)                 | `levelUp()` with `LevelUpOptions` (classId, subclassId, hpChoice, asiOrFeat, newSpells, isNewClass), `recomputeDerivedStats()`                                                                                             | All exist                                                                                                                                                                                    |
| FR-138~139 (Rests)                    | `shortRest()`, `longRest()`                                                                                                                                                                                                | All exist                                                                                                                                                                                    |
| FR-140~143+163 (Layout/PWA)           | N/A (UI/infra only)                                                                                                                                                                                                        | —                                                                                                                                                                                            |
| FR-144~146 (CRUD)                     | `createCharacter()`, `validateCharacter()`, `recomputeDerivedStats()`                                                                                                                                                      | All exist                                                                                                                                                                                    |
| FR-147~148 (Dice)                     | All `rolls/` module functions; `DiceRollOverlay` + `useRollStore` currently in `@open20/spellbook` (not `@open20/ui`)                                                                                                      | ⚠️ Needs extraction to `@open20/ui`; roll history does not exist anywhere yet                                                                                                                |
| FR-149~151 (Notes/Export)             | `notes` field; standalone `serialize(char): string` / `deserialize()` in `storage/serializer.ts`; `ICharacterStorage` interface (storage abstraction, does NOT declare serialize/deserialize)                              | All exist — note serialize/deserialize are standalone functions, not interface methods                                                                                                       |
| FR-152~156 (Spell Mgmt)               | `ClassSpellData.spellSaveDC`, `getSpellAttackBonusForClass()`/`getBestSpellAttackBonus()`, `spellSlots`, `consumeSpellSlot()`, `recoverSpellSlot()`, `preparedSpells`/`knownSpells`, `castSpell()`, content-srd spell data | All exist — note there are NO `calculateSpellSaveDC`/`calculateSpellAttackBonus`/`useSpellSlot` exports; use the actual names                                                                |

**Core Additions Needed** (owner: Phase 0.5):

1. `rollAbilityCheck()` — generic ability check roll (d20 + ability mod, optional proficiency). Currently only skill checks and saves exist.
2. CharacterAttack → Weapon adapter — `rollCharacterAttack()`/`rollCharacterWeaponDamage()` take a `Weapon` object; the sheet stores `CharacterAttack` in `combatStats.attacks`. Implement as a thin app-side mapper or a core helper (e.g., `rollStoredAttack()`).
3. Death-save auto-reset — `modifyHP()` should reset `deathSaves` when current HP rises above 0 (matches FR-103 UI expectation).
4. `Character.inspiration` field (boolean) + mutation helpers (FR-157).
5. Exhaustion auto-penalties — apply −2×level to d20 rolls (skill/save/attack/ability/initiative) and −5 ft×level to speed in derived stats; only passive Perception is handled today (FR-158).
6. Senses/languages/toolProficiencies/size resolution — either denormalize onto `Character` at creation time, or document "query species/background/class deps at render" as the official strategy (FR-159~161).
7. Ability score source tracking — record base/racial/feat components if FR-106 breakdown display is kept; otherwise drop FR-106.
8. Extract `DiceRollOverlay` + `useRollStore` from `@open20/spellbook` into `@open20/ui`; extend store with roll history (FR-147/148). Not strictly "core", but a Phase 0.5/1 shared-infra task.

### B. Comparison: Spellbook App vs Character Sheet App

| Dimension          | Spellbook App (`@open20/spellbook`)                     | Character Sheet App (`@open20/character-sheet`)                                                                            |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Primary Focus      | Spell browsing, searching, filtering                    | Full character state management                                                                                            |
| Character Features | Spell slots, preparation, concentration, basic creation | HP, abilities, skills, saves, combat stats, equipment, currency, conditions, hit dice, level-up, feats, species/background |
| Target User        | Spellcasting players                                    | All players (martial + spellcasters) + DMs                                                                                 |
| FR Count           | 26 (FR-001~026)                                         | 64 (FR-100~163)                                                                                                            |
| Core Dependency    | Spell engine + basic character                          | Full character engine (all modules)                                                                                        |
| Relationship       | Independent app                                         | Independent app — shares `open20-core` and `@open20/ui`                                                                    |

### C. Design References

- **Design tokens & components**: See `packages/spellbook/UI_Design_Spec.md` — the character sheet inherits the same design system (Arcane Purple primary, Stone Gray neutral, Inter font, etc.). New UI elements (HP bar, ability grid, skill list) should follow existing component patterns (Card, Badge, Button, Tab).
- **Layout patterns only (not code reuse)**: `packages/spellbook/src/components/character/CharacterSheet/` may be consulted for layout/UX patterns. Per Appendix D, character-sheet is a standalone app — do NOT import spellbook app code directly; shared pieces (e.g., DiceRollOverlay, roll store) must first be extracted into `@open20/ui` (see FR-147/148).
- **Core engine**: See `packages/core/AGENTS.md` for architecture, immutable update patterns, and function naming conventions.

### D. Implementation Strategy

The character sheet app is a **separate package** (`packages/character-sheet/`), NOT an extension of spellbook. It is a standalone React SPA with its own routing, state management, and UI.

**Shared dependencies**: Both apps share `open20-core`, `@open20/ui`, and `@open20/content-srd`. Common patterns (Zustand stores, dice rolling, content resolution) should be extracted to `@open20/ui` or a new shared package if duplication arises.

Implementation phases:

1. **Phase 0 (Setup)**: Initialize `@open20/character-sheet` package with Vite + React + Tailwind + shadcn/ui, including PWA/service-worker scaffolding (FR-163).
2. **Phase 0.5 (Core & Shared-Infra Extensions)**: Complete the additions listed in Appendix A "Core Additions Needed". P0 blockers: (a) `rollAbilityCheck()` (FR-105); (b) CharacterAttack→Weapon adapter (FR-117); (c) death-save auto-reset in `modifyHP()` (FR-103); (d) extract `DiceRollOverlay` + `useRollStore` from spellbook into `@open20/ui` (FR-147). P1 groundwork (can defer to Phase 2 but must be designed now): inspiration field (FR-157), exhaustion auto-penalties (FR-158), senses/languages/size strategy (FR-159~161), ability-score source tracking or FR-106 drop decision.
3. **Phase 1 (P0)**: Build the core character sheet UI — HP/Death Saves panel, Ability Scores grid, Skills list, Saving Throws, Combat Stats bar, Weapon Attacks, Species traits/Background/Feats display, Spell save DC/attack bonus, Spell slots tracker, Prepared spells management, Concentration tracker, Short/Long Rest. Character creation/selection. Offline-first PWA shell (FR-163).
4. **Phase 2 (P1)**: Add Equipment, Currency, Hit Dice, Conditions, Exhaustion, Inspiration, Class Features display, Level-Up wizard, Damage Defenses, Senses/Languages/Size display, Spell search/browse (FR-155), ability score breakdown (FR-106, if kept).
5. **Phase 3 (P2)**: Notes, JSON export/import, roll history (FR-148).

**Note**: Spell management from spellbook (spell slot tracking, preparation, concentration, spell search) will be re-implemented in character-sheet using the same `open20-core` functions, adapted to the character sheet's layout.

---

**Change Log**

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Author   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| v1.0    | 2026-07-20 | Initial version — full character sheet PRD covering 52 functional requirements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | AI Agent |
| v1.1    | 2026-07-20 | Updated: package renamed to `@open20/character-sheet`, architecture changed to standalone app (not spellbook evolution), updated layout/navigation and implementation strategy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | AI Agent |
| v1.2    | 2026-07-20 | PRD review fixes: added Spell Management section (FR-152~156), added missing character fields (Inspiration/Exhaustion/Senses/Languages/Size, FR-157~161), fixed priority of FR-119/FR-120 (P1→P0), removed "inherited from spellbook" language throughout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | AI Agent |
| v1.3    | 2026-07-20 | Second review: added 2 P0 user stories (Rests, Character Creation) with P1/P2 renumbering (22 total); added Class Features display (FR-162); added FR numbering convention note; removed spellbook reference from FR-148; clarified FR-117/FR-149/FR-143 dependencies; added Phase 0.5 (Core Extensions); added concentration P0 rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | AI Agent |
| v1.4    | 2026-07-21 | Third review (code-verified against open20-core): corrected all dependency claims — fixed function names (`getModifier`/`getSkillBonus`/`getProficiencyBonus`/`consumeSpellSlot`, `ClassSpellData.spellSaveDC`, `getSpellAttackBonusForClass`, standalone `serialize`/`deserialize`); marked false `核心已有` claims as 需核心扩展 (inspiration field, exhaustion auto-penalties, senses/languages/toolProficiencies/size, ability-score source breakdown, death-save auto-reset on heal, CharacterAttack→Weapon adapter); clarified FR-162 features derive from content-srd `featuresByLevel` (Character stores no features); added FR-163 offline-first PWA; added Story↔FR cross-reference for FR-106/148/163; rewrote Appendix A with verified names + 8-item Core Additions list; expanded Phase 0.5 accordingly; added dice extraction task (FR-147/148); fixed FR count to 64 (FR-100~163); clarified §C spellbook reference is layout-patterns-only | AI Agent |

---

**Approval Signatures**

- Product Owner: [ ]
- Technical Lead: [ ]
- Design Lead: [ ]
