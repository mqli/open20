# D&D 2024 Character Sheet — Wireframe Design

**Version**: v1.1  
**Date**: 2026-07-27  
**Package**: `@open20/character-sheet`  
**Design System**: Inherits from `@open20/ui` / spellbook UI Design Spec

---

## 1. Design Principles

1. **Glanceable**: Critical combat stats (HP, AC, PB) visible without scrolling
2. **Tap-to-Roll**: Any d20 value = one-click dice overlay
3. **Mobile-First**: Designed for tabletop use on phones; desktop is a spatial upgrade
4. **Familiar**: Follows physical D&D character sheet layout where practical
5. **System-Consistent**: Inherits Arcane Purple palette, Inter font, component primitives from `@open20/ui`

---

## 2. Core Integration Patterns

`open20-core` uses **immutable data patterns** — all `Character` fields are `readonly` and every mutation function returns a new `Character` object. The character-sheet must faithfully follow this constraint in its Zustand store and interaction flows.

### 2.1 Immutable State Updates

Every state mutation follows this pattern:

```
User action → core function(character, ...params) → returns new Character
            → store.setState({ character: newCharacter })
            → UI re-renders from new state
```

> **Do not mutate**: The Zustand store must **replace** the entire character via `setState`. Never directly modify `character.hitPoints.current`. Every mutation path (HP adjustment, long rest, equip toggle, level up) calls a core function and stores its return value.

### 2.2 RecomputeDerivedStatsDeps (Content Resolver)

Many core functions require a `RecomputeDerivedStatsDeps` object. This object resolves content IDs to their full data from `@open20/content-srd`:

```typescript
interface RecomputeDerivedStatsDeps {
  species?: Species; // resolved from character.species
  background?: Background; // resolved from character.background
  classes: Record<string, Class>; // resolved from character.classes[].classId
  subclasses?: Record<string, Subclass>;
  feats?: Record<string, Feat>;
  weapons?: Record<string, Weapon>; // resolved from character.equipment
  armors?: Record<string, Armor>;
  gears?: Record<string, Gear>;
}
```

**The character-sheet must provide a `ContentResolver` service** that:

- Loads SRD content once from `@open20/content-srd` at app startup
- Exposes a `getDeps(character: Character): RecomputeDerivedStatsDeps` function
- Caches the resolved maps (character state is readonly, so deps are stable per character snapshot)
- Is injected into the Zustand store as a static dependency

Every store action that calls `shortRest`, `longRest`, `levelUp`, `recomputeDerivedStats`, or equipment mutations must first resolve `RecomputeDerivedStatsDeps` for the current character.

### 2.3 RandomProvider (rng)

All dice-roll functions in core require a `RandomProvider`:

```typescript
type RandomProvider = () => number; // returns [0, 1)
```

**The character-sheet wraps all roll calls through an adapter** that injects `Math.random` (or a seedable RNG for testing):

```typescript
// src/core/roll-adapter.ts
function rollSkill(character: Character, skill: SkillName): CheckResult {
  return rollCharacterSkillCheck({
    character,
    skill,
    rng: Math.random, // or seeded RNG for test fixtures
  });
}
```

This adapter layer lives in `src/core/roll-adapter.ts` and is called from Zustand store actions.

### 2.4 Core Extensions Required (Phase 0.5)

Some wireframe features require additions to `open20-core` before implementation:

| Feature                         | FR         | Extension Needed                                                                                                              |
| ------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Death save auto-reset on HP > 0 | FR-103     | `modifyHP` must reset `deathSaves` to `{ successes: 0, failures: 0, isStable: false }` when HP transitions from 0 to > 0      |
| Per-class hit dice short rest   | FR-127-128 | `shortRest` takes a single `hitDiceToSpend` number; the sheet wraps this by summing per-class selections                      |
| Concentration save rolling      | FR-131     | Use `rollCharacterSavingThrow({ ability: 'CON', dc: max(10, halfDamageTaken), ... })` — standard D&D rule                     |
| Extended `RollResult` type      | FR-147     | Add `components?: Array<{ source: string; value: number }>` to `useRollStore` for modifier breakdowns (e.g., "WIS +3, PB +2") |

### 2.5 Display Names via Content Resolution

Character data stores _IDs_ (species, background, class, feat, spell, item). The UI needs _display names_ from SRD content. The same `ContentResolver` service provides display-name lookups:

```typescript
resolver.getSpeciesName(character.species); // "High Elf"
resolver.getClassName(character.classes[0].classId); // "Wizard"
resolver.getBackgroundName(character.background); // "Sage"
resolver.getFeatName(featId); // "War Caster"
```

The character selector card (§6.1), hero card (§3.1), and all section headers resolve display names via this service.

---

## 3. Color Assignments (per PRD functional areas)

| Area                    | Color Token                     | Reasoning                               |
| ----------------------- | ------------------------------- | --------------------------------------- |
| HP bar fill             | `--color-success` (#1D9E75)     | Life/health = green                     |
| HP bar danger           | `--color-danger` (#E24B4A)      | Low HP warning                          |
| Temp HP overlay         | `--color-info` (#378ADD)        | Temporary = blue, distinct from real HP |
| Death saves - success   | `--color-success` (#1D9E75)     | Life = green                            |
| Death saves - failure   | `--color-danger` (#E24B4A)      | Death = red                             |
| AC shield               | `--color-primary-600` (#534AB7) | Defense = core purple                   |
| Proficiency             | `--color-primary-400` (#7F77DD) | Expertise/capability = purple           |
| Concentration           | `--color-warning` (#BA7517)     | Amber warning banner                    |
| Spell slots (available) | `--color-success` (#1D9E75)     | Resource available = green              |
| Spell slots (expended)  | `--color-border` (dashed)       | Expended = outline                      |
| Conditions active       | `--color-warning` (#BA7517)     | Status conditions = amber               |
| Inspiration             | `--color-primary-400` (#7F77DD) | Heroic = purple                         |
| Exhaustion              | `--color-danger` (#E24B4A)      | Worsening penalty = red                 |

---

## 4. Layout Architecture

### 4.1 Desktop Layout (>= 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ [App Bar]  Character ▼  │  ───  spellbook title  ───  │ 🌙 ⚙  │
├───────────┬─────────────────────────────────────────────────────┤
│  SIDEBAR  │              MAIN CONTENT AREA                      │
│  250px    │              (scrollable, fills remaining width)     │
│           │                                                     │
│ ┌───────┐ │  ┌──────────────────────────────────────────────┐  │
│ │ HERO  │ │  │ SECTION HEADER                           [▼] │  │
│ │ CARD  │ │  ├──────────────────────────────────────────────┤  │
│ │       │ │  │                                              │  │
│ │ Name  │ │  │  Current tab/accordion content               │  │
│ │ Lvl   │ │  │                                              │  │
│ │ HP    │ │  │  (see Section 6 wireframes per section)      │  │
│ │ AC    │ │  │                                              │  │
│ │ Init  │ │  │                                              │  │
│ │ Speed │ │  │                                              │  │
│ │ PP    │ │  │                                              │  │
│ │ PB    │ │  │                                              │  │
│ └───────┘ │  │                                              │  │
│           │  └──────────────────────────────────────────────┘  │
│ ┌───────┐ │                                                     │
│ │ NAV   │ │  ┌──────────────────────────────────────────────┐  │
│ │ TABS  │ │  │ NEXT SECTION...                              │  │
│ │       │ │  └──────────────────────────────────────────────┘  │
│ │Comb.  │ │                                                     │
│ │Abil.  │ │  (all sections visible as accordion, or one at a   │
│ │Skills │ │   time with tab selection — configurable)           │
│ │Spells │ │                                                     │
│ │Equip. │ │                                                     │
│ │Feat.  │ │                                                     │
│ │Notes  │ │                                                     │
│ └───────┘ │                                                     │
│           │                                                     │
│ REST BTNS │                                                     │
│ Short R. │                                                     │
│ Long R.  │                                                     │
│           │                                                     │
│ Char Mgmt │                                                     │
│ + New    │                                                     │
│ Export   │                                                     │
│ Import   │                                                     │
└───────────┴─────────────────────────────────────────────────────┘
```

**Key specs**:

- Sidebar: Fixed 250px, flex-col, `--color-bg-secondary` background, `--space-xl` (24px) padding
- Hero card: Sticky top of sidebar, shows character identity + combat quick-stats (all values are **read-only display** — names resolved via ContentResolver §2.5)
- Nav tabs: Vertical list, `--space-sm` (8px) gaps
- Main content: Scrollable, `--space-2xl` (32px) padding, sections as stacked accordion panels
- Rest buttons: Sticky to sidebar bottom (container uses `overflow-y: auto` with scrolling above the button area)

### 4.2 Mobile Layout (< 768px)

```
┌─────────────────────┐
│ CHAR SELECTOR ▼     │  ← Fixed top bar, 48px (shows character name + class)
├─────────────────────┤
│                     │
│  HERO STRIP         │  ← Sticky, always visible
│  HP 34/45 AC 18 +3  │     Compact: only HP + AC + PB shown
│                     │     (Name/class in top bar, full stats on tap)
├─────────────────────┤
│                     │
│  SCROLLABLE         │
│  CONTENT            │  ← Accordion sections, one open at a time
│                     │
│  ▼ COMBAT           │
│  [expanded content] │
│                     │
│  ▶ ABILITIES        │
│  ▶ SKILLS           │
│  ▶ SPELLS           │
│  ▶ EQUIPMENT        │
│  ▶ FEATURES         │
│  ▶ NOTES            │
│                     │
├─────────────────────┤
│ Combat│Skills│Spells│More │ ← Bottom tab bar, 56px
└─────────────────────┘
```

**Key specs**:

- Top bar: Character name + class/level, dropdown for character selector, 48px, `--color-bg-secondary`
- Hero strip: Sticky, compact horizontal layout showing **only HP, AC, and PB** (avoids crowding). Tap to expand full combat stats. Height: 48px, font: `--font-body` (14px) with values bold
- Content: Single column, accordion sections, `--space-lg` (16px) horizontal padding
- Bottom tab bar: 4 tabs, 56px, `--color-bg-secondary`, active tab = `--color-primary-600`
- Tab "More": opens overflow menu for Equipment, Features, Notes, Settings, and Rest Actions

---

## 5. Shared Components

### 5.1 DiceRollOverlay (inherited from spellbook, extracted to @open20/ui)

```
┌──────────────────────────┐
│                    [✕]   │
│                          │
│   Skill: Perception      │
│   d20 + 5                │  ← Expression line
│   WIS +3 | PB +2         │  ← Modifier breakdown (new field)
│                          │
│   ┌──────────────────┐   │
│   │                  │   │
│   │       ⚁ 17       │   │  ← Large d20 result display
│   │    Total: 22      │   │
│   │                  │   │
│   └──────────────────┘   │
│                          │
│   [Roll Again]           │
│                          │
└──────────────────────────┘
```

**Dimensions**: 320px wide modal, centered with backdrop
**Animation**: 300ms dice shake → result reveal
**States**: Normal / Critical Hit (green) / Critical Miss (red)
**NFR-01**: Critical hit shows "🎯" glyph; critical miss shows "💥" — non-color-only distinction

**RollResult type extension**: The extracted `useRollStore` must add a `components` field for modifier breakdown:

```typescript
interface RollResult {
  id: string;
  label: string; // "Skill: Perception"
  expression: string; // "d20 + 5"
  total: number; // 22
  components?: Array<{
    // NEW — modifier breakdown
    source: string; // "WIS", "PB"
    value: number; // +3, +2
  }>;
  timestamp: number;
}
```

**Weapon attack dual-roll mode**: When both `rollCharacterAttack()` and `rollCharacterWeaponDamage()` are called together (see §6.6), the overlay shows a two-row result:

```
┌──────────────────────────┐
│                    [✕]   │
│                          │
│   Attack: Longsword      │
│   d20 + 6 → 22 (Hit!)   │  ← Attack result on top
│   STR +3 | PB +3         │
│                          │
│   Damage: 1d8+3 Slashing │  ← Damage result below
│   ⚄ 5 + 3 = 8           │
│                          │
│   [Roll Again]           │
└──────────────────────────┘
```

### 5.2 HP Bar (new component for @open20/ui)

```
┌────────────────────────────────────────┐
│ HP                                     │
│  ┌─────────────────────────────────┐   │
│  │████████████████████░░░░░░░░░░░░░│   │  ← Filled portion = current/max
│  │████████████████████░░░░░░░░░░��░░│   │     Overlay band = temp HP (blue)
│  └─────────────────────────────────┘   │
│  34 / 45                    +10 Temp   │
│  [-10] [-5] [-1] [+1] [+5] [+10]     │  ← Quick-adjust buttons
└────────────────────────────────────────┘
```

**Bar height**: 24px
**Colors**: fill `--color-success`, background `--color-bg-tertiary`, danger `<25%` = `--color-danger`
**Temp HP**: `--color-info` overlay band above fill
**Quick buttons**: Small (28px height), `--space-xs` (4px) gap
**NFR-02**: Buttons ≥ 44×44 px touch target on mobile

**State update pattern**: Each quick button calls `modifyHP(character, delta)` which returns a new `Character` — store replaces entire state (§2.1). The `HpBar` component is presentational; the HP value flows down as a prop from the Zustand store.

### 5.3 Death Save Tracker

```
┌──────────────────┐
│ DEATH SAVES       │
│                   │
│  ✓  ✓  ◯         │  ← Successes: filled green circle + bold check glyph
│  ✗  ◯  ◯         │  ← Failures: filled red circle + bold X glyph
│                   │
│  Stable at 3✓     │
│  Death at 3✗      │
└──────────────────┘
```

**Circle size**: 32px (increased from 28px for readability)
**Glyph weight**: Use bold/solid filled shapes instead of thin Unicode characters. Render success as a filled circle with thick white checkmark (CSS or SVG, not `✓` text), and failure as a filled circle with thick white X.
**Interaction**: Tap circle to toggle success/failure — calls a Zustand store action that updates the character
**NFR-01**: Check/X glyphs provide non-color redundancy for state
**Auto-reset**: Clears on long rest (`longRest()` handles this). The HP 0→>0 reset requires a **core extension** (Phase 0.5, see §2.4) — until then, the sheet manually resets `deathSaves` when `modifyHP` transitions from 0 to > 0

### 5.4 Ability Score Block

```
┌──────────────────────────────────────────┐
│ ABILITY SCORES                           │
│                                          │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐ │
│  │STR │  │DEX │  │CON │  │INT │  │WIS │ │  ← 6-column grid on desktop
│  │ 16 │  │ 14 │  │ 14 │  │ 12 │  │ 15 │ │    3×2 + 1 on mobile
│  │ +3 │  │ +2 │  │ +2 │  │ +1 │  │ +2 │ │
│  └────┘  └────┘  └────┘  └────┘  └────┘ │
│  ┌────┐                                 │
│  │CHA │                                 │
│  │ 10 │                                 │
│  │ +0 │                                 │
│  └────┘                                 │
│                                          │
│  Tap any score to roll ability check     │
└──────────────────────────────────────────┘
```

**Cell size**: Desktop 72×80px, Mobile 64×68px
**Layout**: 6-col on desktop, 3×2 + 1 on mobile
**Font**: Score `--font-h1` (20px), Modifier `--font-body` (14px) in badge
**Modifier badge**: `--color-primary-600` bg if positive, `--color-danger` if negative, `--color-text-secondary` if 0
**Tap**: Calls roll adapter → `rollCharacterSkillCheck({ character, skill: 'Athletics', rng: Math.random })` → updates `useRollStore` → DiceRollOverlay renders

### 5.5 Skill Row

```
┌──────────────────────────────────────┐
│ ▣  Perception              +5  [🎲] │  ← Proficient = filled dot
│ ★  Stealth                 +7  [🎲] │  ← Expertise = star icon
│ ○  Arcana                  +1  [🎲] │  ← Not proficient = empty circle
│ ○  Athletics               +3  [🎲] │
│ ...                                  │
└──────────────────────────────────────┘
```

**Row height**: 40px
**Proficiency mark**: 12px circle/star, `--color-primary-600`
**Bonus**: Right-aligned, `--font-h2` (16px), bold
**Dice button**: 32px icon button, tap → DiceRollOverlay with skill check
**Grouping**: Skills listed under ability score header (e.g., "STRENGTH" divider bar)

### 5.6 Spell Slot Row

```
┌────────────────────────────────────────┐
│ Level 1    ● ● ● ● ○ ○    4/6         │
│                                        │
│  ● = Available (filled green)          │
│  ○ = Expended (dashed outline)         │
└────────────────────────────────────────┘
```

**Circle size**: 24px (uses `SlotPips` from `@open20/ui`)
**Tap behavior**: **Read-only display** in the slot tracker view. Slots are only recovered via Short/Long Rest actions (core handles recovery). Casting a spell (tapping a prepared spell card) consumes one slot via a core function — see §6.12.
**Color**: Available `--color-success`, Expended `--color-border` with dashed stroke
**Counter**: Right-aligned "N/M" text

---

## 6. Section Wireframes (by PRD area)

### 6.1 HP & Death Saves (FR-100~103)

Merged into the Hero Card / Hero Strip (see sections 6.5 and 4.2).

### 6.2 Ability Scores (FR-104~106)

See shared component §5.4.

### 6.3 Skills (FR-107~108)

```
┌──────────────────────────────────────────┐
│ SKILLS                                   │
│  [🔍 Filter skills...]                   │  ← Search input (standard Input pattern)
│                                          │
│ ── STRENGTH ──────────────────────────  │
│   ○  Athletics                  +3  [🎲] │
│                                          │
│ ── DEXTERITY ─────────────────────────  │
│   ○  Acrobatics                 +2  [🎲] │
│   ○  Sleight of Hand            +2  [🎲] │
│   ▣  Stealth                    +5  [🎲] │  ← Rogue expertise, starred
│                                          │
│ ── INTELLIGENCE ────���─────────────────  │
│   ○  Arcana                     +1  [🎲] │
│   ○  History                    +1  [🎲] │
│   ○  Investigation              +4  [🎲] │
│   ○  Nature                     +1  [🎲] │
│   ○  Religion                   +1  [🎲] │
│                                          │
│ ── WISDOM ────────────────────────────  │
│   ▣  Animal Handling            +5  [🎲] │
│   ○  Insight                    +2  [🎲] │
│   ○  Medicine                   +2  [🎲] │
│   ▣  Perception                 +5  [🎲] │
│   ○  Survival                   +2  [🎲] │
│                                          │
│ ── CHARISMA ──────────────────────────  │
│   ○  Deception                  +0  [🎲] │
│   ○  Intimidation               +0  [🎲] │
│   ○  Performance                +0  [🎲] │
│   ○  Persuasion                 +0  [🎲] │
│                                          │
│  ▣ Proficient  ★ Expertise  ○ Normal    │
└───���──────────────────────────────────────┘
```

**FR-108**: Tapping [🎲] triggers `rollCharacterSkillCheck()` → opens DiceRollOverlay

### 6.4 Saving Throws (FR-109~110)

```
┌──────────────────────────────────────────┐
│ SAVING THROWS                            │
│                                          │
│  ┌─────┐ ┌─────┐ ┌───���─┐ ┌─────┐ ┌─────┐│
│  │STR  │ │DEX  │ │CON  │ │INT  │ │WIS  ││
│  │ +3  │ │ +2  │ │ +5  │ │ +1  │ │ +5  ││
│  │ [🎲]│ │ [🎲]│ │ [🎲]│ │ [🎲]│ │ [🎲]││
│  └─────┘ └─────┘ ���─────┘ └─────┘ ���─────┘│
│                     ┌─────┐              │
│                     │CHA  │              │
│                     │ +0  │              │
│                     │ [🎲]│              │
│                     └─────┘              │
│                                          │
│  ▣ Proficient  ○ Normal                  │
└──────────────────────────────────────────┘
```

**Layout**: Same grid pattern as ability scores
**Proficiency highlight**: `--color-primary-600` border on proficient saves
**FR-110**: Tap [🎲] triggers `rollCharacterSavingThrow()` → DiceRollOverlay

### 6.5 Combat Stats (FR-111~115, FR-157)

```
┌─���──────────────────────────────────────┐
│ COMBAT STATS                           │
│                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 🛡 AC │ │ ⚡ INI│ │ 🏃 SPD│ │ 👁 PP │  │  ← Desktop: horizontal row
│  │  18  │ │  +3  │ │ 30ft │ │  15  │  │     Mobile: 2×2 grid
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                        │
│  ┌──────┐ ┌──────┐                    │
│  │ ⭐ PB │ │ ✦ IN │                    │  ← PB: always visible
│  │  +3  │ │  ON  │                    │     Inspiration: toggleable (FR-157)
│  └──────┘ └──────┘                    │
└────────────────────────────────────────┘
```

**AC cell**: Shield icon + number, `--font-display` (28px), `--color-primary-600`
**Initiative cell**: Lightning icon + `+N`, tap → `rollCharacterInitiative()`
**Speed cell**: Running figure icon + value
**PP cell**: Eye icon + value
**PB cell**: Star icon + `+N`, `--font-h2` (16px), `--color-primary-400`
**Inspiration cell** (FR-157): Star/sparkle icon, tap to toggle, filled = `--color-primary-400`, empty = `--color-text-tertiary`

### 6.6 Weapon Attacks (FR-116~117)

```
┌──────────────────────────────────────────┐
│ WEAPON ATTACKS                           │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ⚔ Longsword               +6      │  │  ← Attack bonus on right
│  │    1d8+3 Slashing          [🎲]   │  │  ← Damage dice + type
│  │    Versatile (1d10)                │  │  ← Properties
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 🏹 Longbow                 +4      │  │
│  │    1d8+2 Piercing          [🎲]   │  │
│  │    Range (150/600)                 │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 🗡 Dagger (off-hand)        +5     │  │
│  │    1d4+3 Piercing          [🎲]   │  │
│  │    Finesse, Light, Thrown          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  + Add Weapon                            │
└──────────────────────────────────────────┘
```

**Card height**: 56px
**Attack bonus**: Right-aligned, `--font-h3` (14px), `--color-primary-600` badge
**Dice button**: 32px at row bottom, tap → attack roll + damage roll simultaneously

**FR-117 — Dual-roll implementation**: Tapping [🎲] calls:

1. `rollCharacterAttack({ character, weapon, rng: Math.random })` → the attack result
2. `rollCharacterWeaponDamage({ character, weapon, isCritical: result.isCritical, rng: Math.random })` → damage roll
3. Both results are stored in `useRollStore` as a single `RollResult` with `components` for the dual-roll breakdown
4. DiceRollOverlay enters **weapon attack mode** (§5.1) showing attack (hit/miss/crit) and damage in two stacked rows

**Weapon icon**: Different icon per weapon type (sword = melee, bow = ranged, dagger = finesse)

### 6.7 Species, Background, Feats (FR-118~121, FR-159~162)

```
┌──────────────────────────────────────────┐
│ CHARACTERISTICS                          │
│                                          │
│ ── SPECIES ────────────────────────────  │
│  High Elf                                │
│  ┌────────────────────────────────────┐  │
│  │ Senses                             │  │
│  │  👁 Darkvision 60 ft.              │  │  ← FR-159
│  │                                    │  │
│  │ Traits                             │  │
│  │  • Fey Ancestry                    │  │  ← FR-119 (expandable)
│  │  • Trance                          │  │
│  │  • Keen Senses                     │  │
│  │  • Elf Weapon Training             │  │
│  │                                    │  │
│  │ Languages                          │  │  ← FR-160
│  │  Common, Elvish                     │  │
│  │                                    │  │
│  │ Size: Medium                       │  │  ← FR-161
│  └────────────────────────────────────┘  │
│                                          │
│ ── BACKGROUND ────────────────────────  │
│  Sage                                    │
│  Researcher feature                      │  ← FR-120
│                                          │
│ ── FEATS ─────────────────────────────  │
│  ┌─ War Caster ─────────────── [▼] ─┐  │
│  │  Advantage on CON saves for       │  │  ← FR-121 (expandable)
│  │  concentration. Can cast spells   │  │
│  │  as opportunity attacks.          │  │
│  └───────────────────────────────────┘  │
│  ┌─ Magic Initiate ──────────── [▼] ─┐  │
│  │  Learn 2 cantrips + 1 level-1     │  │
│  │  spell from chosen class list.    │  │
│  └───────────────────────────────────┘  │
│                                          │
│ ── CLASS FEATURES ────���───────────────  │
│  Wizard 5                                │
│  ┌─ Arcane Recovery ─────────── [▼] ─┐  │  ← FR-162
│  │  Recover spell slots (combined     │  │
│  │  levels ≤ 3) during short rest.   │  │
│  └───────────────────────────────────┘  │
│  ┌─ Spellcasting ────────────── [▼] ─┐  │
│  │  Full arcane spellcasting with     │  │
│  │  spellbook preparation.           │  │
│  └───────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Traits**: Expandable cards, collapsed by default (mobile), expanded on desktop
**FR-121**: Feat cards expand inline to show description
**FR-162**: Class features derived from content-srd `featuresByLevel` at render time. All display names resolved via ContentResolver (§2.5).

### 6.8 Equipment & Currency (FR-122~126)

```
┌──────────────────────────────────────────┐
│ EQUIPMENT                                │
│                                          │
│ WEAPONS ─────────────────────────────  │
│  ☑ Longsword         1d8 Slashing   [-] │  ← Equipped = checkmark
│  ☐ Dagger            1d4 Piercing   [-] │  ← Unequipped = empty box
│                                          │
│ ARMOR ────────────────────────────────  │
│  ☑ Chain Mail        AC 16           [-] │
│  ☑ Shield            AC +2           [-] │
│                                          │
│ GEAR ─────────────────────────────────  │
│  ☑ Explorer's Pack                    [-] │
│  ☐ Spellbook                           [-] │
│  ☐ Component Pouch                     [-] │
│                                          │
│ [+ Add Equipment]                        │
│                                          │
│ ── CURRENCY ──────────────────────────  │
│  ┌──────┬──────┬──────┬──────┬──────┐  │
│  │  CP  │  SP  │  EP  │  GP  │  PP  │  │
│  │  12  │  45  │   0  │ 250  │   0  │  │
│  │[-][+]│[-][+]│[-][+]│[-][+]│[-][+]│  │
│  └──────┴──────┴──────┴──────┴──────┘  │
└──────────────────────────────────────────┘
```

**Equip toggle**: Checkbox/toggle, triggers `equipItemAndRecompute()` / `unequipItemAndRecompute()` — both require `RecomputeDerivedStatsDeps` from ContentResolver
**Add Equipment**: Search + select from SRD content pack
**Currency**: 5 columns, coin icon + amount + +/- stepper (calls a state mutation that replaces `character.currency`)
**FR-125**: Equipping armor/weapons triggers AC/attack recomputation

### 6.9 Hit Dice (FR-127~128)

```
┌──────────────────────────────────────────┐
│ HIT DICE                                 │
│                                          │
│  Wizard    d6     2 / 5         [Spend] │
│  Fighter   d10    1 / 3         [Spend] │
│                                          │
│  Spend during Short Rest to heal:        │
│  d6 + CON mod (+2) per hit die           │
└──────────────────────────────────────────┘
```

**Row**: Class name, die type, used/total, "Spend" button
**Data source**: `CharacterClass.hitDice = { die: DieType; used: number }`. The `total` per class equals the class level. Displayed as `used / level`.
**Spend button**: Opens short rest hit dice selector (see §7.2)

**Core API gap — per-class hit dice**: Core's `shortRest(char, hitDiceToSpend, deps, rng?)` takes a single total number, not per-class breakdown. The sheet wraps this:

1. User selects how many hit dice to spend per class in the dialog (§7.2)
2. Sheet sums the selections → calls `shortRest(character, totalHitDice, deps, rng)`
3. The sheet must additionally track which class's `hitDice.used` increased (the core function handles this internally via `CharacterClass.hitDice.used`)

### 6.10 Conditions & Concentration (FR-129~131, FR-158)

```
┌──────────────────────────────────────────┐
│ CONDITIONS                               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ⚠ CONCENTRATING: Haste      [✕]  │  │  ← FR-131 (P0), amber bg
│  │  DC 10 CON save on damage          │  │     (DC = max(10, half damage taken))
│  │  [Roll CON Save]                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Active:                                 │  ← FR-129 (P1)
│  ┌──────────┐ ┌──────────┐              │
│  │ Poisoned ✕│ │Frightened✕│              │  ← Dismissible chips
│  └──────────┘ └──────────┘              │
│                                          │
│  Exhaustion: [2] [-][+]                 │  ← FR-158 (P1)
│  ─2 to D20 Tests, ─10 ft Speed         │
│                                          │
│  [+ Add Condition ▼]                     │  ← FR-130 (P1)
│  Blinded | Charmed | Deafened | ...     │
└──────────────────────────────────────────┘
```

**Concentration banner**: `--color-warning` bg, `--space-md` padding, amber left-border accent
**Concentration DC**: Standard D&D 2024 rule — DC 10 Constitution saving throw, or half the damage taken, whichever is higher
**[Roll CON Save] calls**: `rollCharacterSavingThrow({ character, ability: 'CON', dc: calcConcentrationDC(damageTaken), rng: Math.random })` — no dedicated core function needed; uses the existing saving throw API
**Condition chips**: `--color-warning` bg, dismiss X button, `--radius-full`
**Add Condition**: Dropdown of 15 D&D 2024 conditions with descriptions
**Exhaustion**: Numeric stepper, penalty description updates in real-time, `--color-danger` tint at 4+

### 6.11 Damage Defenses (FR-132)

```
┌──────────────────────────────────────────┐
│ DAMAGE DEFENSES                          │
│                                          │
│  Resistances (½ damage):                 │
│  ┌────────────┐                          │
│  │ Fire       │  ← Orange-red badge     │
│  │ Cold       │  ← Ice-blue badge        │
│  └────────────┘                          │
│                                          │
│  Immunities (0 damage):                  │
│  ┌────────────┐                          │
│  │ Poison     │  ← Green badge           │
│  └────────────┘                          │
│                                          │
│  Vulnerabilities (2× damage):            │
│  (none)                                  │
└──────────────────────────────────────────┘
```

**Badge style**: `--color-primary-100` bg, `--color-primary-800` text, `--radius-full`
**Resistance**: Shield icon + damage type
**Immunity**: Shield with checkmark icon
**Vulnerability**: Broken shield icon

### 6.12 Spell Management (FR-152~156)

```
┌──────────────────────────────────────────┐
│ SPELLCASTING                             │
│                                          │
│  ┌──────────────┐ ┌──────────────┐      │
│  │ Spell DC: 15 │ │ Atk Bonus:+7 │      │  ← FR-152 (P0)
│  └──────────────┘ └──────────────┘      │
│                                          │
│ ── SPELL SLOTS ───────────────────────  │  ← FR-153 (P0)
│  Cantrip       ∞                        │
│  1st   ● ● ● ● ○ ○     4/6             │
│  2nd   ● ● ● ○ ○ ○     3/6             │
│  3rd   ● ● ○ ○ ○ ○     2/6             │
│                                          │
│  [Short Rest] [Long Rest]               │
│                                          │
│ ── PREPARED SPELLS (6/8) ────────────  │  ← FR-154 (P0)
│                                          │
│  ✦ Fire Bolt              Cantrip [🎲] │  ← Prepared = filled star
│  ✦ Shield                 1st     [🎲] │
│  ✦ Mage Armor             1st     [🎲] │
│  ✦ Misty Step             2nd     [🎲] │
│  ✦ Web                    2nd     [🎲] │
│  ✦ Fireball               3rd     [🎲] │  ← FR-156: tap = consume slot + roll
│                                          │
│  [+ Prepare More Spells]                │  ← Opens spell browser modal
│                                          │
│ ── ALL KNOWN SPELLS ──────────────────  │  ← FR-155 (P1)
│  [🔍 Search spells...]                  │
│  [All] [Cantrip] [1st] [2nd] [3rd]     │
│  Fire Bolt      Cantrip  Evocation   ✦ │
│  Shield         1st      Abjuration  ✦ │
│  Burning Hands  1st      Evocation   ○ │  ← Known but not prepared
│  ...                                    │
└──────────────────────────────────────────┘
```

**FR-152**: Spell DC and attack bonus in side-by-side highlighted bars, `--color-primary-600` accent. These values are derived from `recomputeDerivedStats()` — no separate storage.
**FR-153**: SlotPips component (see §5.6), **read-only display**. Slots are consumed when a spell is cast and recovered via rests. No manual slot toggling.
**FR-154**: Prepared/Known toggle, star icon for prepared status
**FR-155**: Search + level filter, spell cards with school color + level badge (inherit spellbook patterns)
**FR-156**: Tapping spell name → consumes one slot via core function → opens DiceRollOverlay with attack roll or damage/heal roll

### 6.13 Rest Actions (FR-138~139)

```
┌──────────────────────────────────────────┐
│ RESTS                                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         ☕ SHORT REST              │  │  ← Full-width button
│  │    Spend hit dice, recover        │  │
│  │    short-rest resources           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         🌙 LONG REST              │  │  ← Full-width button
│  │    Full HP, all HD, all slots,    │  │
│  │    reset death saves, conditions  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Desktop**: Sticky at sidebar bottom (sidebar uses `overflow-y: auto` with buttons fixed below scroll content)
**Mobile**: In the "More" tab overflow menu

**State update**: Both rest buttons call their respective core functions (`shortRest` / `longRest`), which return a new `Character`. Short rest requires `RecomputeDerivedStatsDeps` from ContentResolver. Long rest only needs the character object (the `_deps` parameter in `longRest` is currently unused).

---

## 7. Modal / Dialog Wireframes

### 7.1 Character Selector / Management (FR-143~146)

```
┌────────────────────────────────────────┐
│  CHARACTERS                    [+ New] │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ⚔ Tharion, Level 5 Wizard      │  │  ← Active = --color-primary-100 bg
│  │    HP 34/45 | AC 18 | PP 15     │  │     + primary left border
│  │                        [Edit]   │  │     Names resolved via ContentResolver
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🗡 Lyra, Level 3 Rogue          │  │
│  │    HP 24/24 | AC 15 | PP 17     │  │
│  │                        [Edit]   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🌿 Kael, Level 1 Druid         │  │
│  │    HP 10/10 | AC 13 | PP 14     │  │
│  │                        [Edit]   │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

**Dialog width**: 480px max, centered modal
**Character card**: `--color-bg-secondary`, `--radius-lg`, hover = `--shadow-md`
**Active indicator**: `--color-primary-600` left border (3px)
**Delete**: Swipe left (mobile) or right-click menu (desktop), confirmation dialog
**FR-146**: Delete shows "Are you sure? This cannot be undone." confirmation

### 7.2 Short Rest — Hit Dice Selector (FR-127~128, FR-138)

```
┌────────────────────────────────────────┐
│  SHORT REST - Spend Hit Dice           │
│                                        │
│  Wizard           d6     2/5          │
│  Spend:  [2] [-][+]                   │
│  Heal: 2d6 + 4 (CON) = ~11 HP        │
│                                        │
│  Fighter          d10    1/3          │
│  Spend:  [1] [-][+]                   │
│  Heal: 1d10 + 2 (CON) = ~7 HP        │
│                                        │
│  ──────────────────────────────────── │
│  Total recovery: ~18 HP               │
│  HP after rest: 34 → 45/45           │
│                                        │
│            [Cancel]  [Take Rest]      │
└────────────────────────────────────────┘
```

**Dialog width**: 400px
**Hit die row**: Class name, die type, remaining count, stepper for how many to spend
**Preview**: Shows estimated recovery and new HP total

**Implementation**: On "Take Rest", the sheet:

1. Sums per-class hit dice selections → `totalHitDice`
2. Calls `shortRest(character, totalHitDice, deps, rng)`
3. Stores the returned `Character` in Zustand
4. Core handles the internal per-class hit-dice tracking (`CharacterClass.hitDice.used`)

### 7.3 Long Rest Confirmation (FR-139)

```
┌──────────────────────────────────────┐
│  LONG REST                             │
│                                        │
│  This will:                            │
│  ✓ Restore all HP                      │
│  ✓ Recover all hit dice                │
│  ✓ Recover all spell slots             │
│  ✓ Reset death saves                   │
│  ✓ Reset once-per-rest abilities       │
│  ✓ Remove all conditions               │
│  ✓ End concentration                   │
│                                        │
│            [Cancel]  [Long Rest]       │
└────────────────────────────────────────┘
```

**State update**: Calls `longRest(character, deps)`, stores the returned `Character` in Zustand.

### 7.4 Character Creation (FR-144)

```
┌────────────────────────────────────────┐
│  CREATE CHARACTER                      │  ← Multi-step wizard
│                                        │
│  Step 1 of 5: Basics                   │
│  ──────────────────────────────────── │
│                                        │
│  Character Name                        │
│  [________________________]           │
│                                        │
│  Species                        [▼]    │
│  Background                     [▼]    │
│                                        │
│  Alignment                      [▼]    │
│                                        │
│            [Back]     [Next →]        │
└───���────────────────────────────────────┘
```

```
Step 2: Class Selection
┌─���──────────────────────────────────────┐
│  Primary Class                         │
│  [Barbarian] [Bard] [Cleric] [Druid]  │  ← Grid of class buttons
│  [Fighter] [Monk] [Paladin] [Ranger]  │
│  [Rogue] [Sorcerer] [Warlock][Wizard] │
│                                        │
│  Level:  [1]  [-][+]                  │
│                                        │
│  + Add Class (multiclass)              │  ← Opens secondary class selector
│    Class [▼]  Level [▼]               │
└────────────────────────────────────────┘
```

```
Step 3: Ability Scores
┌────────────────────────────────────────┐
│  Method: [Point Buy] [▼]               │
│                                        │
│  STR [15] [-][+]    INT [ 8] [-][+]   │
│  DEX [14] [-][+]    WIS [12] [-][+]   │
│  CON [13] [-][+]    CHA [10] [-][+]   │
│                                        │
│  Points remaining: 0 / 27              │
└────────────────────────────────────────┘
```

**FR-144**: Supports point buy, standard array, and manual input modes
**CreateCharacter call**: Calls `createCharacter(params, deps)` and `recomputeDerivedStats(char, deps)` — both require `RecomputeDerivedStatsDeps` from ContentResolver.

### 7.5 Level-Up Wizard (FR-133~137)

```
┌────────────────────────────────────────┐
│  LEVEL UP: Wizard 5 → 6                │
│                                        │
│  Step 1: Choose Class                  │
│  Wizard 5 → 6                          │
│  Fighter 3 → 4                         │  ← Multiclass aware
│                                        │
│  Step 2: HP Increase                   │
│  Hit Die: d6  + CON (+2)              │
│         [Roll d6]   [Take Average: 4] │  ← Two options
│  New max HP: 45 → 51 (if average)     │
│                                        │
│  Step 3: New Features                  │
│  • Arcane Tradition feature (L6)      │
│  • +1 3rd-level spell slot            │
│  • +1 prepared spell                  │
│                                        │
│  Step 4: Spell Selection               │
│  Learn 2 new spells:                   │
│  [2/2 selected]                        │
│  ┌── Haste                     [Add] ┐│
│  └───────────────────────────────────┘│
│                                        │
│  Step 5: Subclass (if applicable)     ��
│  Not at subclass level                 │
│                                        │
│            [Cancel]  [Confirm]        │
└────────────────────────────────────────┘
```

**FR-133**: Select which class to advance (multiclass-aware)
**FR-134**: Roll hit die (animated) or take fixed value
**FR-135**: ASI/Feat step appears at levels 4, 8, 12, 16, 19
**FR-136**: Auto-recalculation after confirm via `levelUp(char, options, deps, rng)`, shows change summary
**FR-137**: Subclass selection step when reaching required level

### 7.6 Spell Browser (FR-155)

```
┌─���──────────────────────────────────────┐
│  PREPARE SPELLS      6/8 prepared  [✕] │
│                                        │
│  [🔍 Search spells...]                 │
│                                        │
│  [All] [0] [1] [2] [3] [4] [5] [6+]  │  ← Level tabs
│  [Abj] [Conj] [Div] [Enc] [Evo] ...  │  ← School chips
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ☑ Fireball      3rd  Evoc   [V] │  │  ← Green check = prepared
│  │   8d6 fire, 20ft sphere         │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ☐ Counterspell  3rd  Abj    [S] │  │  ← Empty box = not prepared
│  │   Reaction, 60 ft range         │  │
│  └──────────────────────────────────┘  │
│                                        │
│                  [Done]                │
└────────────────────────────────────────┘
```

**Inherited**: Reuses spell card patterns from `@open20/spellbook` Spell Library (PRD §7 Appendix C: "layout patterns only, not code reuse")

### 7.7 Equipment Add Dialog (FR-123)

```
┌────────────────────────────────────────┐
│  ADD EQUIPMENT                    [✕]  │
│                                        │
│  [🔍 Search equipment...]              │
│                                        │
│  Category: [All] [Weapon] [Armor] [Gear]│
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Longsword               15 GP   │  │
│  │ 1d8 slashing, versatile       [+]│  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Shield                  10 GP   │  │
│  │ +2 AC                        [+]│  │
│  └──────────────────────────────────┘  │
│  ...                                   │
│                                        │
│  ── Custom Entry ────────────────────  │
│  Name: [_______________]              │
│  Type: [▼]    Weight: [__]           │
│  [Add Custom]                          │
└────────────────────────────────────────┘
```

---

## 8. Interaction Flows

### 8.1 Main Navigation (Desktop)

```
Start → Load active character from localStorage (deserialize JSON → Character)
     → Resolve content deps via ContentResolver for display names
     → Show sheet with sidebar + content
     → User clicks nav tab: switch main content panel (no state mutation)
     → User clicks ability/skill/save: roll adapter → roll function → useRollStore → DiceRollOverlay
     → User clicks attack: roll adapter → rollCharacterAttack + rollCharacterWeaponDamage → useRollStore → overlay (dual-roll mode)
     → User clicks Short Rest: hit dice selector dialog
         → sum selections → shortRest(character, totalHD, deps, rng) → new Character
         → store.setState({ character: newCharacter })
     → User clicks Long Rest: confirmation dialog
         → longRest(character, deps) → new Character
         → store.setState({ character: newCharacter })
```

### 8.2 Main Navigation (Mobile)

```
Start → Load active character from localStorage
     → Show sheet with hero strip (HP + AC + PB only) + accordion sections
     → Tap bottom tab: scroll to that section + expand it
     → Tap hero strip: expand to show full combat stats overlay
     → Tap [🎲] on any section: DiceRollOverlay (bottom sheet)
     → Tap Short/Long Rest (in "More" tab): same dialogs as desktop
```

### 8.3 Dice Rolling Flow

```
Tap any [🎲] button
  → Roll adapter calls core function with current character + Math.random
  → Result pushed to useRollStore.addRoll({ label, expression, total, components })
  → DiceRollOverlay opens (modal desktop, bottom sheet mobile)
  → d20 result animated + total + modifier breakdown displayed
  → User taps "Roll Again" or closes overlay
  → Result added to roll history (FR-148, P2)
```

### 8.4 HP Adjustment Flow

```
Tap +/- button on HpBar
  → modifyHP(character, delta) → returns new Character
  → store.setState({ character: newCharacter })
  → HP bar animates to new value
  → If HP transitions from 0 → >0: sheet manually resets deathSaves (until core ext, §2.4)
  → If concentrating and HP was reduced: show CON save reminder (§6.10)
```

### 8.5 Level-Up Flow

```
Tap "Level Up" (in Features tab or character menu)
  → Level-up wizard opens (see §7.5)
  → Step through class selection, HP, features, spells, subclass
  → Confirm → levelUp(character, levelUpOptions, deps, rng) → new Character
  → store.setState({ character: newCharacter })
  → Show change summary: what increased
  → Close wizard, sheet reflects new level
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width          | Layout                                                                 |
| ---------- | -------------- | ---------------------------------------------------------------------- |
| Desktop    | ≥ 1024px       | Sidebar + content, all sections expanded/accordion                     |
| Tablet     | 768px – 1023px | Sidebar collapses to icon bar, content = single column                 |
| Mobile     | < 768px        | Hero strip top (HP + AC + PB only), accordion sections, bottom tab bar |

### Tablet Detail

```
┌──────────────────────────────────────────┐
│ [☰] CHAR SELECTOR ▼         🌙 ⚙       │  ← Collapsed sidebar as hamburger menu
├──────────────────────────────────────────┤
│ HERO STRIP (always visible)              │
│ Tharion | L5 Wizard | HP 34/45 | AC 18  │
├──────────────────────────────────────────┤
│ SECTION 1                           [▼] │
│ (content)                                │
├──────────────────────────────────────────┤
│ SECTION 2                           [▼] │
│ (content)                                │
└──────────────────────────────────────────┘
```

### Mobile Detail

See §4.2 for the full mobile layout.

---

## 10. State Handling

### 10.1 Empty States

```
┌──────────────────────────────────────────┐
│                                          │
│         No Character Yet                 │
│                                          │
│    Create your first D&D 2024            │
│    character to get started.             │
���                                          │
│       [+ Create Character]               │
│                                          │
│    Or import from JSON:                  │
│    [Import Character]                    │
│                                          │
└──────────────────────────────────────────┘
```

### 10.2 Error States

- **localStorage full** (~5MB limit): Toast: "Storage is full. Export your characters to free up space, or delete unused characters." Mitigation: compress character JSON before storage; consider IndexedDB as a fallback for larger data sets (Phase 2+)
- **Import fails**: Toast: "Could not import character. This file may be from an incompatible version."
- **Validation error**: Inline field error with red border + message
- **Core function error**: Toast with error message, do not crash the sheet

### 10.3 Loading States

- **Character loading**: Brief skeleton card with pulsing placeholders
- **Roll resolving**: DiceRollOverlay with spinner during roll animation
- **Content pack loading**: Section shows "Loading..." text until SRD data is available (ContentResolver async initialization)

### 10.4 Persistent Storage Strategy

**Primary**: `localStorage` keyed by character ID
**Schema versioning**: Store a `schemaVersion` alongside each character. On load, check compatibility with the current core schema version. Display an upgrade prompt or migration notice if versions diverge.
**Storage estimate**: ~1-2 KB per character (compact JSON, no bloat). localStorage limit is ~5 MB — approximately 2,500+ characters. No immediate concern for typical usage.
**Future (Phase 2+)**: If storage becomes an issue, add optional IndexedDB with gzip compression, and an export-all / import-all feature.
**Backup**: Export to JSON file is the safety net. Encourage users to export periodically.

---

## 11. Accessibility Checklist (NFR-01 / NFR-02)

Per the PRD non-functional requirements, every interactive element must satisfy:

| Requirement              | Implementation                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Tap targets ≥ 44×44 px   | All dice buttons, +/- buttons, tab icons, condition chips                                         |
| Color-independent status | Death saves: bold filled shape glyphs; Skills: ○/▣/★ icons; Critical: text labels                 |
| Keyboard operable        | Full Tab order through all interactions; Enter/Space to activate                                  |
| Focus indicators         | `focus-visible:ring-2 ring-primary-600` on all interactive elements                               |
| Screen reader labels     | `aria-label` on all icon-only buttons (e.g., "Roll Strength check", "Spend 1st-level spell slot") |
| Reduced motion           | `prefers-reduced-motion`: disable HP bar animation, dice shake, concentration pulse               |

---

## 12. Component Inventory

New components needed vs. reused from `@open20/ui`:

### Reused from `@open20/ui`

- `Button`, `Badge`, `CardSurface`, `CardMetaItem`, `Surface`, `Text`, `SectionHeader`, `SlotPips`
- `Tabs`, `Input`, `Select`, `Switch`, `Toggle`, `Tooltip`, `Dialog`, `Sheet`
- `EmptyState`, `Divider`, `FilterChip`

### New for `@open20/ui` (extracted from spellbook, extended)

- `DiceRollOverlay` — extracted from spellbook, extended for all roll types (FR-147) and weapon dual-roll mode
- `useRollStore` — extracted from spellbook, extended with `RollResult.components[]` for modifier breakdown and roll history (FR-148)

### New for `@open20/character-sheet` (app-specific)

- `HpBar` — current/max/temp HP with +/- adjustment bar (presentational, HP from store)
- `DeathSavesTracker` — 3 success/3 failure toggle circles (32px, bold filled glyphs)
- `AbilityScoreCard` — single ability score with modifier + tap-to-roll
- `AbilityScoresGrid` — 6-column grid of AbilityScoreCards
- `SkillRow` — single skill with proficiency mark, bonus, roll button
- `SavingThrowCard` — saving throw with bonus + roll button
- `CombatStatCard` — AC / Initiative / Speed / PP / PB stat display
- `CombatStatsBar` — horizontal stat bar (desktop) / grid (mobile)
- `WeaponAttackCard` — weapon card with attack bonus + damage + dual-roll trigger
- `ConditionChip` — dismissible condition badge
- `ConcentrationBanner` — already exists in spellbook (will need extraction or recreation)
- `SpellSlotRow` — per-level slot tracker with SlotPips (read-only display)
- `SpellcastingHeader` — DC + attack bonus display
- `PreparedSpellList` — prepared spell manifest
- `HitDiceRow` — per-class hit dice tracker
- `CurrencyRow` — 5-coin currency tracker
- `CharacterSelector` — multi-character dropdown/dialog
- `RestActions` — Short/Long Rest buttons
- `CharacterCreateWizard` — multi-step character creation
- `LevelUpWizard` — guided level-up flow
- `EquipmentCard` — equipment item with equip toggle
- `FeatCard` — feat with expandable description
- `SpeciesPanel` — species traits + senses + languages
- `DamageDefensesSection` — resistances/immunities/vulnerabilities display

### New internal services

- `ContentResolver` — resolves IDs to display names and builds `RecomputeDerivedStatsDeps` from `@open20/content-srd`
- `rollAdapter` — wraps core roll functions with `RandomProvider` injection

---

## 13. File Structure (Planned)

```
packages/character-sheet/src/
├── components/
│   ├── character/       # CharacterSheet, HpBar, AbilityScores, Skills, etc.
│   ├── layout/          # App shell, sidebar, mobile navigation
│   ├── dice/            # DiceRollOverlay (re-exported from @open20/ui after extraction)
│   └── shared/          # Reusable sheet-specific primitives
├── stores/
│   └── characterStore.ts   # Zustand store — single-character, delegates to core
├── core/
│   ├── content-resolver.ts # ContentResolver service (§2.2, §2.5)
│   └── roll-adapter.ts     # RandomProvider injection layer (§2.3)
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

**Store shape**:

```typescript
interface CharacterSheetState {
  character: Character | null; // current active character (immutable)
  characters: Record<string, Character>; // all saved characters by ID
  activeCharacterId: string | null;
  isLoaded: boolean;

  // Actions — every mutation replaces the character via setState
  loadCharacter: (id: string) => void;
  createCharacter: (params: CreateCharacterParams) => void;
  modifyHP: (delta: number) => void;
  shortRest: (hitDiceToSpend: number) => void;
  longRest: () => void;
  levelUp: (options: LevelUpOptions) => void;
  // ... plus skill check, attack roll, save roll, equip toggle, etc.
}
```

---

## 14. Implementation Order (mapped to PRD phases)

| Phase        | Components                                                                                                                     | PRD FRs                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Phase 0      | Package scaffold, PWA config, ContentResolver, rollAdapter                                                                     | FR-163                            |
| Phase 0.5    | Core extensions + DiceRollOverlay extraction + useRollStore extension                                                          | FR-103, 105, 117, 147             |
| Phase 1 (P0) | HpBar, DeathSaves, Abilities, Skills, Saves, CombatStats, WeaponAttacks, Species/BG/Feats, Spellcasting, Rests, Character CRUD | FR-100~121, 131, 138~146, 152~156 |
| Phase 2 (P1) | Equipment, Currency, HitDice, Conditions, Exhaustion, ClassFeatures, LevelUp, Defenses, Senses/Languages/Size, SpellBrowser    | FR-122~130, 132~137, 155, 157~162 |
| Phase 3 (P2) | Notes, Export/Import, RollHistory                                                                                              | FR-148~151                        |

---

_End of wireframe design_
