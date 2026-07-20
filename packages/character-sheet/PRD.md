# D&D 2024 Character Sheet App — Product Requirements Document (PRD)

**Document Version**: v1.1  
**Date**: 2026-07-20  
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
10. **As a** spellcasting player, **I want to** manage spell slots, prepared spells, and concentration (inherited from spellbook), **so that** spellcasting remains fully integrated with the character sheet.

### Priority P1 (Important Extensions)

11. **As a** player, **I want to** manage my equipment inventory (weapons, armor, gear) — add, remove, equip, unequip — **so that** my AC and attacks auto-update when I change gear.
12. **As a** player, **I want to** track and modify my currency (CP, SP, EP, GP, PP) with simple +/- controls, **so that** I can manage loot and purchases during the game.
13. **As a** player, **I want to** see my remaining hit dice by class and spend them during short rests, **so that** I can heal correctly between encounters.
14. **As a** player, **I want to** apply and remove D&D 2024 conditions (Poisoned, Frightened, Invisible, etc.) with one tap, **so that** I can track status effects that modify my rolls.
15. **As a** player, **I want to** level up my character through a guided step-by-step wizard that handles HP rolling, ASI/feat selection, and spell slot recalculation, **so that** leveling up is fast and rules-compliant.
16. **As a** player, **I want to** see my damage resistances, immunities, and vulnerabilities, **so that** I know how different damage types affect me.

### Priority P2 (Nice to Have)

17. **As a** player, **I want to** write free-form notes on my character sheet, **so that** I can record campaign-specific information.
18. **As a** player, **I want to** export my character sheet as JSON for backup or sharing, **so that** I can preserve my character data outside the app.
19. **As a** player, **I want to** import a character sheet from a JSON file, **so that** I can restore a backup or use a pre-built character.
20. **As a** player, **I want to** compare stats between my active character and a secondary character, **so that** I can reference another build while playing.

---

## 4. Functional Requirements

### 4.1 HP & Death Saves

| ID     | Requirement Description                                         | Priority | Core Dependency                              | UI Notes                                                                                                                                                                 |
| ------ | --------------------------------------------------------------- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-100 | Display current/max/temporary HP with large, readable numbers   | P0       | `hitPoints.current/max/temporary` (核心已有) | Prominent hero section at top of character sheet. Current HP in large display font. Max HP below. Temp HP as a separate pill/badge.                                      |
| FR-101 | HP adjustment: +/- buttons with configurable increment (1/5/10) | P0       | `modifyHP()` (核心已有)                      | Row of quick-adjust buttons. Long-press for custom value input.                                                                                                          |
| FR-102 | Temporary HP input and display                                  | P0       | `setTemporaryHP()` (核心已有)                | Separate input field or quick-add button. Shows as distinct colored overlay on HP bar.                                                                                   |
| FR-103 | Death save tracker: 3 successes / 3 failures with tap-to-toggle | P0       | `hitPoints.deathSaves` (核心已有)            | Three circle icons for successes (filled green on tap), three for failures (filled red on tap). Auto-reset on long rest or when HP > 0. Auto-mark stable at 3 successes. |

### 4.2 Ability Scores

| ID     | Requirement Description                                        | Priority | Core Dependency                            | UI Notes                                                                                                                                                                  |
| ------ | -------------------------------------------------------------- | -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-104 | Display all 6 ability scores with modifier (e.g., "STR 16 +3") | P0       | `abilityScores` (核心已有)                 | 2x3 grid or compact row. Score in large text, modifier badge beside it. Use `calculateAbilityModifier()` for modifier.                                                    |
| FR-105 | Tap ability score to roll ability check (d20 + mod)            | P0       | `rollCharacterAbilityCheck()` (需核心扩展) | Tapping opens dice overlay with d20 result + modifier. Core currently has `rollCharacterSkillCheck` but not generic ability check — may need `rollAbilityCheck` addition. |
| FR-106 | Display ability score breakdown (base + racial + feat bonuses) | P1       | `abilityScores` sub-fields (核心已有)      | Expandable detail showing where each bonus comes from.                                                                                                                    |

### 4.3 Skills

| ID     | Requirement Description                                                                | Priority | Core Dependency                        | UI Notes                                                                                                            |
| ------ | -------------------------------------------------------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR-107 | Display all 18 skills with total bonus, proficiency indicator, and expertise indicator | P0       | `calculateSkillBonus()` (核心已有)     | Scrollable list grouped by ability. Proficient: filled circle. Expertise: star icon. Total bonus prominently shown. |
| FR-108 | Tap any skill to roll a skill check (d20 + bonus)                                      | P0       | `rollCharacterSkillCheck()` (核心已有) | Tapping opens dice overlay. Critical success/failure highlighted.                                                   |

### 4.4 Saving Throws

| ID     | Requirement Description                                   | Priority | Core Dependency                         | UI Notes                                                                            |
| ------ | --------------------------------------------------------- | -------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| FR-109 | Display 6 saving throw bonuses with proficiency indicator | P0       | `getSavingThrowBonus()` (核心已有)      | Compact row or paired with ability scores. Proficient saves visually distinguished. |
| FR-110 | Tap saving throw to roll (d20 + bonus)                    | P0       | `rollCharacterSavingThrow()` (核心已有) | Opens dice overlay with result.                                                     |

### 4.5 Combat Stats

| ID     | Requirement Description              | Priority | Core Dependency                                                             | UI Notes                                                 |
| ------ | ------------------------------------ | -------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| FR-111 | Display Armor Class (AC) prominently | P0       | `combatStats.AC` / `calculateAC()` (核心已有)                               | Large shield icon with AC number. In a combat stats bar. |
| FR-112 | Display Initiative bonus             | P0       | `combatStats.initiative` / `calculateInitiative()` (核心已有)               | Show modifier. Tap to roll initiative (d20 + mod).       |
| FR-113 | Display Speed                        | P0       | `combatStats.speed` (核心已有)                                              | Simple text label in combat stats bar.                   |
| FR-114 | Display Passive Perception           | P0       | `combatStats.passivePerception` / `calculatePassivePerception()` (核心已有) | Text label with eye icon.                                |
| FR-115 | Display Proficiency Bonus            | P0       | `combatStats.proficiencyBonus` / `calculateProficiencyBonus()` (核心已有)   | Badge showing "+N".                                      |

### 4.6 Weapon Attacks

| ID     | Requirement Description                                                    | Priority | Core Dependency                      | UI Notes                                                                                                                       |
| ------ | -------------------------------------------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| FR-116 | Display weapon attacks from character.combatStats.attacks                  | P0       | `combatStats.attacks` (核心已有)     | List of attacks showing name, attack bonus, damage dice + modifier, damage type.                                               |
| FR-117 | Tap attack to roll attack roll (d20 + attackBonus) + damage simultaneously | P0       | `rollCharacterAttack()` (需核心扩展) | Dice overlay shows attack roll result, then damage roll. Core has `rollSpellAttack()` — may need `rollWeaponAttack()` wrapper. |

### 4.7 Species, Background & Feats

| ID     | Requirement Description                                       | Priority | Core Dependency                                 | UI Notes                                                                |
| ------ | ------------------------------------------------------------- | -------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| FR-118 | Display species name and subtype on character sheet           | P0       | `species`, `speciesSubtype` (核心已有)          | Species name with subtype in parentheses.                               |
| FR-119 | Display species traits (from SRD content pack data)           | P1       | Content pack species data (content-srd 已有)    | Expandable section listing traits from the species definition.          |
| FR-120 | Display background name and feature                           | P1       | Content pack background data (content-srd 已有) | Background name + feature description.                                  |
| FR-121 | Display feat list with feat descriptions and granted benefits | P0       | `feats` array (核心已有)                        | List of feat names. Tap to expand for description and granted features. |

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

| ID     | Requirement Description                                | Priority | Core Dependency                                                                             | UI Notes                                                                                       |
| ------ | ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| FR-129 | Display active conditions with tap-to-remove           | P1       | `conditions` array + `toggleCondition()` (核心已有)                                         | Active conditions shown as dismissible chips/badges.                                           |
| FR-130 | Add condition from the 15 D&D 2024 standard conditions | P1       | `ConditionName` union type (核心已有)                                                       | Dropdown/menu of all 15 conditions with brief descriptions. Tap to apply.                      |
| FR-131 | Concentration tracker (inherited from spellbook)       | P0       | `concentration` + `startConcentration()`/`endConcentration()` (核心已有，spellbook 已有 UI) | Already implemented in spellbook — amber banner with concentrated spell name + dismiss button. |

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

| ID     | Requirement Description                                                               | Priority | Core Dependency                          | UI Notes                                                                             |
| ------ | ------------------------------------------------------------------------------------- | -------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| FR-138 | Short Rest: select hit dice to spend, auto-recover short-rest resources               | P0       | `shortRest()` (核心已有，spellbook 已有) | Already implemented in spellbook. Enhance to include hit dice selection UI (FR-128). |
| FR-139 | Long Rest: full HP, all hit dice, all spell slots, reset death saves, reset resources | P0       | `longRest()` (核心已有，spellbook 已有)  | Already implemented in spellbook. Confirmation dialog.                               |

### 4.15 Layout & Navigation

| ID     | Requirement Description                                                                                     | Priority | Core Dependency  | UI Notes                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| FR-140 | Desktop: Full-page character sheet layout with tab/section navigation                                       | P0       | N/A (UI only)    | Character sheet fills the viewport. Sections organized vertically or with sidebar navigation.                            |
| FR-141 | Mobile: Single-column scrollable character sheet with bottom tab navigation                                 | P0       | N/A (UI only)    | Bottom tab bar for quick section jump (Combat, Skills, Spells, Inventory).                                               |
| FR-142 | Character sheet organized in collapsible sections (HP, Abilities, Skills, Combat, Spells, Equipment, Feats) | P0       | N/A (UI only)    | Accordion or section-based layout. Core combat section always visible. Optional sections collapsed by default on mobile. |
| FR-143 | Character selector (multi-character support)                                                                | P0       | Store dependency | Dropdown or menu to switch between saved characters. Create/edit/delete from character list.                             |

### 4.16 Character Creation & Editing

| ID     | Requirement Description                                                       | Priority | Core Dependency                                | UI Notes                                                                                                             |
| ------ | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| FR-144 | Character creation with: name, species, background, class(es), ability scores | P0       | `createCharacter()` (核心已有，spellbook 已有) | Already implemented in spellbook. Consider enhancing ability score input (point buy / standard array / manual).      |
| FR-145 | Character editing: update any field and recompute derived stats               | P0       | `recomputeDerivedStats()` (核心已有)           | Already implemented via CharacterModal. Extend to support editing all character fields, not just spell-related ones. |
| FR-146 | Delete character with confirmation                                            | P0       | characterStore (spellbook 已有)                | Already implemented.                                                                                                 |

### 4.17 Dice Rolling Integration

| ID     | Requirement Description                                                                       | Priority | Core Dependency            | UI Notes                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| FR-147 | Unified DiceRollOverlay for all roll types (skill, save, attack, ability, initiative, damage) | P0       | rolls/ module (核心已有)   | Extend existing DiceRollOverlay to handle all roll types. Show modifier breakdown. Critical hit/miss highlighting. |
| FR-148 | Roll history accessible from anywhere in the app                                              | P2       | rollStore (spellbook 已有) | Expand existing roll history. Show last N rolls with timestamp and context.                                        |

### 4.18 Notes & Export

| ID     | Requirement Description                  | Priority | Core Dependency                              | UI Notes                                                                                                    |
| ------ | ---------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| FR-149 | Free-text notes field on character sheet | P2       | `notes` field (核心已有)                     | Simple textarea in a collapsible section. Auto-saves to character data.                                     |
| FR-150 | Export character as JSON file            | P2       | `ICharacterStorage.serialize()` (核心已有)   | Download button generates .json file with full character data.                                              |
| FR-151 | Import character from JSON file          | P2       | `ICharacterStorage.deserialize()` (核心已有) | Upload button. Validate JSON structure before import. Warn on overwrite if character with same name exists. |

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

Core functions used by the character sheet (all exist in open20-core today):

| FR Range                      | Core Functions (Already Exist)                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| FR-100~103 (HP)               | `modifyHP()`, `setTemporaryHP()`, `hitPoints` type, `DeathSaves` type                                                       |
| FR-104~106 (Abilities)        | `calculateAbilityModifier()`, `abilityScores` type                                                                          |
| FR-107~108 (Skills)           | `calculateSkillBonus()`, `rollCharacterSkillCheck()`, `skills` type                                                         |
| FR-109~110 (Saves)            | `getSavingThrowBonus()`, `rollCharacterSavingThrow()`                                                                       |
| FR-111~115 (Combat)           | `calculateAC()`, `calculateInitiative()`, `calculatePassivePerception()`, `calculateProficiencyBonus()`, `combatStats` type |
| FR-116~117 (Attacks)          | `combatStats.attacks`, `CharacterAttack` type                                                                               |
| FR-118~121 (Species/BG/Feats) | `species`, `background`, `feats` fields; content-srd data                                                                   |
| FR-122~125 (Equipment)        | `equipItemAndRecompute()`, `unequipItemAndRecompute()`, `addEquipment()`, `removeEquipment()`, `equipment` type             |
| FR-126 (Currency)             | `modifyCurrency()`, `currency` type                                                                                         |
| FR-127~128 (Hit Dice)         | `shortRest()`, `CharacterClass.hitDice` type                                                                                |
| FR-129~131 (Conditions)       | `toggleCondition()`, `startConcentration()`, `endConcentration()`, `ConditionName` union type                               |
| FR-132 (Defenses)             | `damageDefenses` type                                                                                                       |
| FR-133~137 (Level-Up)         | `levelUp()` with full options, `recomputeDerivedStats()`                                                                    |
| FR-138~139 (Rests)            | `shortRest()`, `longRest()`                                                                                                 |
| FR-140~143 (Layout)           | N/A (UI only, all core types already exist)                                                                                 |
| FR-144~146 (CRUD)             | `createCharacter()`, `validateCharacter()`, `recomputeDerivedStats()`                                                       |
| FR-147~148 (Dice)             | All `rolls/` module functions                                                                                               |
| FR-149~151 (Notes/Export)     | `notes` field, `ICharacterStorage`                                                                                          |

**Potential Core Additions Needed**:

- `rollAbilityCheck()` — generic ability check roll (currently only skill checks and saves exist)
- `rollWeaponAttack()` — weapon attack roll + damage (currently `rollCharacterAttack` exists in rolls/character.ts but may need verification)

### B. Comparison: Spellbook App vs Character Sheet App

| Dimension          | Spellbook App (`@open20/spellbook`)                     | Character Sheet App (`@open20/character-sheet`)                                                                            |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Primary Focus      | Spell browsing, searching, filtering                    | Full character state management                                                                                            |
| Character Features | Spell slots, preparation, concentration, basic creation | HP, abilities, skills, saves, combat stats, equipment, currency, conditions, hit dice, level-up, feats, species/background |
| Target User        | Spellcasting players                                    | All players (martial + spellcasters) + DMs                                                                                 |
| FR Count           | 26 (FR-001~026)                                         | 52 (FR-100~151)                                                                                                            |
| Core Dependency    | Spell engine + basic character                          | Full character engine (all modules)                                                                                        |
| Relationship       | Independent app                                         | Independent app — shares `open20-core` and `@open20/ui`                                                                    |

### C. Design References

- **Design tokens & components**: See `packages/spellbook/UI_Design_Spec.md` — the character sheet inherits the same design system (Arcane Purple primary, Stone Gray neutral, Inter font, etc.). New UI elements (HP bar, ability grid, skill list) should follow existing component patterns (Card, Badge, Button, Tab).
- **Existing character UI**: See `packages/spellbook/src/components/character/CharacterSheet/` for current character sheet patterns.
- **Core engine**: See `packages/core/AGENTS.md` for architecture, immutable update patterns, and function naming conventions.

### D. Implementation Strategy

The character sheet app is a **separate package** (`packages/character-sheet/`), NOT an extension of spellbook. It is a standalone React SPA with its own routing, state management, and UI.

**Shared dependencies**: Both apps share `open20-core`, `@open20/ui`, and `@open20/content-srd`. Common patterns (Zustand stores, dice rolling, content resolution) should be extracted to `@open20/ui` or a new shared package if duplication arises.

Implementation phases:

1. **Phase 0 (Setup)**: Initialize `@open20/character-sheet` package with Vite + React + Tailwind + shadcn/ui.
2. **Phase 1 (P0)**: Build the core character sheet UI — HP/Death Saves panel, Ability Scores grid, Skills list, Saving Throws, Combat Stats bar, Weapon Attacks, Species/Background/Feats display. Character creation/selection.
3. **Phase 2 (P1)**: Add Equipment, Currency, Hit Dice, Conditions, Level-Up wizard, Damage Defenses, Spell management (slot tracking, preparation, casting).
4. **Phase 3 (P2)**: Notes, JSON export/import, roll history enhancements.

**Note**: Spell management from spellbook (spell slot tracking, preparation, concentration, spell search) will be re-implemented in character-sheet using the same `open20-core` functions, adapted to the character sheet's layout.

---

**Change Log**

| Version | Date       | Changes                                                                                                                                                                        | Author   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| v1.0    | 2026-07-20 | Initial version — full character sheet PRD covering 52 functional requirements                                                                                                 | AI Agent |
| v1.1    | 2026-07-20 | Updated: package renamed to `@open20/character-sheet`, architecture changed to standalone app (not spellbook evolution), updated layout/navigation and implementation strategy | AI Agent |

---

**Approval Signatures**

- Product Owner: [ ]
- Technical Lead: [ ]
- Design Lead: [ ]
