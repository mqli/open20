# UI Design Document — DND 2024 Character Sheet

> **Version**: 1.0 (Draft)
> **Date**: 2025-05-06
> **Status**: Pre-implementation
> **Depends on**: PRD v4.0, all requirement specs, HLD, data-model

---

## 1. Overview

### 1.1 Purpose

This document consolidates all UI-related requirements scattered across `requirements/`, `PRD.md`, and `spec/` into a single, actionable design reference. It fills the gap between **"what the engine can do"** (complete) and **"what the user sees and touches"** (not started).

### 1.2 Design Philosophy

These principles are non-negotiable. Every UI decision must pass this checklist:

| # | Principle | Rationale |
|---|-----------|-----------|
| D1 | **3-second rule** — find any data in 3 seconds at the game table | The #1 reason this app exists |
| D2 | **Mobile-first, one-handed** — 44×44pt minimum touch targets | One hand holds phone, other holds dice |
| D3 | **Dark theme default** — dark bg, bright text/accent | Most game tables are dim rooms |
| D4 | **One screen, no scroll** — game mode fits on one viewport | Scrolling = wasted time during combat |
| D5 | **Progressive disclosure** — show essentials, expand for details | 18 skills, 75 feats → can't show everything |
| D6 | **Context-aware visibility** — hide irrelevant sections | Non-casters see no spell UI, non-mastery classes see no mastery section |
| D7 | **Rules accuracy > UI polish** — better to show ugly correct data than pretty wrong data | Trust is everything for a rules tool |
| D8 | **Offline-first** — zero network dependency after initial load | No Wi-Fi at most game tables |

### 1.3 Target Platforms

| Platform | Priority | Notes |
|----------|----------|-------|
| Mobile Web (responsive) | P0 | Primary target, 375px–428px width |
| Desktop Web | P0 | Wider layout, keyboard shortcuts |
| PWA (installable) | P1 | Same codebase, service worker |
| Native (Electron/RN) | P2 | Future consideration |

---

## 2. Technology Stack

### 2.1 Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **React 19** | Largest ecosystem, headless core is framework-agnostic, team familiarity |
| Build | **Vite 6** | Fast HMR, native ESM, same toolchain as vitest |
| Styling | **Tailwind CSS 4** | Utility-first = rapid prototyping, dark mode built-in, responsive utilities |
| State | **Zustand** | Minimal boilerplate, works with immutable state from `@dnd2024/core` |
| Routing | **React Router 7** | Standard, supports lazy loading |
| Animation | **Framer Motion** | Conditional section expand/collapse, page transitions |
| Icons | **Lucide React** | Consistent icon set, tree-shakeable |
| Forms | **React Hook Form + Zod** | Zod already in engine, reuse schemas |
| Virtual scroll | **@tanstack/virtual** | 75 feats, 391 spells → need virtualized lists |

### 2.2 Project Structure (Proposed)

```
packages/
  core/               ← existing @dnd2024/core (headless engine)
  web/                ← new React app
    src/
      app/            ← routing, layout shell
      features/
        game-mode/    ← primary game view
        character-creation/
        character-sheet/
        level-up/
        settings/
      components/     ← shared UI components
      hooks/          ← custom React hooks wrapping core engine
      stores/         ← Zustand stores
      theme/          ← Tailwind config, design tokens
```

### 2.3 Integration with Headless Core

The UI layer consumes `@dnd2024/core` through React hooks:

```typescript
// hooks/useCharacter.ts
import { createCharacter, mutateCharacter, recomputeDerivedStats } from '@dnd2024/core';

function useCharacter(id: string) {
  const [character, setCharacter] = useState<Character | null>(null);

  const applyMutation = useCallback((mutation: CharacterMutation) => {
    setCharacter(prev => {
      if (!prev) return prev;
      const mutated = mutateCharacter(prev, mutation);
      return recomputeDerivedStats(mutated);
    });
  }, []);

  return { character, applyMutation };
}
```

All state mutations flow through core engine functions — the UI never modifies `Character` directly.

---

## 3. Design Tokens

### 3.1 Color Palette

#### Dark Theme (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f1117` | Page background |
| `--bg-surface` | `#1a1d27` | Card/panel background |
| `--bg-elevated` | `#252836` | Elevated cards, popovers |
| `--text-primary` | `#e8e8ed` | Body text |
| `--text-secondary` | `#8b8d9a` | Labels, descriptions |
| `--text-muted` | `#5c5e6e` | Disabled, placeholders |
| `--accent-gold` | `#c9a84c` | D&D gold, primary actions, AC |
| `--accent-red` | `#e74c3c` | HP damage, death, errors |
| `--accent-green` | `#2ecc71` | HP healing, success, stable |
| `--accent-blue` | `#3498db` | Temporary HP, spell slots |
| `--accent-purple` | `#9b59b6` | Spellcasting, magic effects |
| `--border` | `#2a2d3a` | Card borders, dividers |

#### Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#f5f5f0` | Parchment-like background |
| `--bg-surface` | `#ffffff` | Card background |
| `--text-primary` | `#1a1a2e` | Body text |
| `--accent-gold` | `#8b6914` | Darker gold for light bg |

### 3.2 Typography

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Combat stat (AC, HP) | 28–32pt | Bold | The most important numbers |
| Section heading | 20pt | Semi-bold | "WEAPONS", "SKILLS" |
| Body text | 16pt | Regular | Minimum readable size |
| Stat modifier | 18pt | Bold | "+7", "+4" next to skill names |
| Button label | 14pt | Medium | Compact but tappable |
| Caption/label | 12pt | Regular | "STR", "DEX" abbreviations |

Font stack: `Inter, system-ui, -apple-system, sans-serif` (clean, highly legible at small sizes).

### 3.3 Spacing & Sizing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Inline gaps |
| `--space-sm` | 8px | Within-card padding |
| `--space-md` | 16px | Between sections |
| `--space-lg` | 24px | Page-level padding |
| `--radius-sm` | 6px | Small buttons |
| `--radius-md` | 10px | Cards |
| `--radius-lg` | 16px | Modals |
| `--touch-min` | 44px | Minimum touch target (per D2) |

### 3.4 Component Sizes

| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| Game stat card (AC/HP) | 100px | 80px | Prominent display |
| Weapon row | full | 48px | Name + bonus + damage |
| Skill row | full | 40px | Name + modifier + tap |
| Resource dots row | full | 36px | ●●○ + label |
| Spell slot circle | 36px | 36px | Filled/empty per slot |
| Quick action button | full/2 | 48px | Short Rest, Long Rest |
| Condition chip | auto | 32px | Horizontally scrollable |

---

## 4. Page Architecture

### 4.1 Navigation Flow

```
┌─────────────────────────────────────────────┐
│                    App                        │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Game Mode│  │  Char    │  │  Settings  │ │
│  │ (default)│  │ Creation │  │            │ │
│  └──────────┘  └──────────┘  └────────────┘ │
│       │             │                         │
│       ├─ Full Sheet │                         │
│       ├─ Edit       │                         │
│       └─ Level Up   │                         │
│                                               │
│  ┌──────────┐                                 │
│  │  Char    │                                 │
│  │  List    │                                 │
│  └──────────┘                                 │
└─────────────────────────────────────────────┘
```

**Navigation rules:**
- App opens to **Game Mode** of last active character (D1, D2 from PRD)
- If no character exists, auto-redirect to **Character Creation**
- **Character List** is accessible from Game Mode header (character name tap)
- **Full Sheet** and **Edit** are secondary views from Game Mode
- **Level Up** is a modal/overlay workflow triggered from Game Mode or Full Sheet

### 4.2 Route Map

| Route | View | Auth |
|-------|------|------|
| `/` | Redirect to `/game/{lastCharId}` | — |
| `/game/:id` | Game Mode | Primary |
| `/create` | Character Creation (wizard) | Primary |
| `/sheet/:id` | Full Character Sheet | Secondary |
| `/edit/:id` | Character Editor | Secondary |
| `/settings` | App Settings | Secondary |
| `/characters` | Character List | Secondary |

---

## 5. Screen Designs

### 5.1 Game Mode — The Primary Screen

> This is where players spend 90% of their time. **Must fit on one screen.**

#### Mobile Layout (375px width)

```
┌─────────────────────────────────┐
│ 🛡️  Borin Ironforge      [≡]  │ ← Header: avatar, name, menu
│     Dwarf Fighter 5             │
│                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ AC   │  │ HP   │  │Init  │ │ ← Combat Stats Row
│  │  18  │  │38/42 │  │  +2  │ │
│  └──────┘  └──────┘  └──────┘ │
│                                 │
│  ⚔ Longsword  +7  1d8+4       │ ← Weapons (compact)
│  ⚔ Hand Axe   +7  1d6+4       │
│                                 │
│  Athletics ⚡ +7  Perception ≈ +3│ ← Pinned Skills (2-line)
│  [··· more]                     │
│                                 │
│  Second Wind ●○  Rage ●●○      │ ← Resources (inline)
│                                 │
│  ○○○ ○○○                        │ ← Spell Slots L1: 2/3
│                                 │
│  [🟢] [+Cond]                   │ ← Condition bar
│                                 │
│  [Short Rest]  [Long Rest]     │ ← Quick Actions
└─────────────────────────────────┘
```

#### Desktop Layout (1280px+)

```
┌────────────────────────────────────────────────────────────┐
│ 🛡️ Borin Ironforge · Dwarf Fighter 5              [≡]    │
├──────────────┬──────────────────┬──────────────────────────┤
│              │                  │                          │
│   AC  18     │   WEAPONS        │   SKILLS                 │
│   HP 38/42   │   Longsword +7  │   Athletics ⚡ +7        │
│   Init +2    │   Hand Axe  +7  │   Intimidation  +4      │
│   PP  13     │                  │   Perception ≈  +3      │
│              │   RESOURCES      │   [Show All Skills...]   │
│   COMBAT     │   Second Wind ●○ │                          │
│   STATS      │   Action Surge ● │   SPELL SLOTS           │
│              │   Rage ●●○       │   L1: ○○○ (2/3)        │
│              │                  │   L2: ○ (1/2)           │
│              │   CONDITIONS     │                          │
│              │   [🟢] [+Cond]   │                          │
├──────────────┴──────────────────┴──────────────────────────┤
│  [🌀 Short Rest]  [🌙 Long Rest]  [📋 Full Sheet]  [✏️]  │
└────────────────────────────────────────────────────────────┘
```

#### Component Breakdown

| Section | Data Source | Interaction | Component |
|---------|------------|-------------|-----------|
| Header | `Character.name`, species, class, level | Tap name → character list; Tap [≡] → menu | `<GameHeader>` |
| Combat Stats | `CombatStats.AC`, `HitPoints`, `initiative`, `passivePerception` | Tap HP → HP modify panel | `<CombatStats>`, `<HPDisplay>`, `<StatCard>` |
| Weapons | `Equipment[]` (equipped, type=weapon) | Tap → attack detail popover | `<WeaponList>`, `<WeaponRow>` |
| Pinned Skills | `Skills[]` (pinned flag) | Tap → copy "1d20+X" to clipboard | `<SkillChips>`, `<SkillBadge>` |
| Resources | `Resources[]` | Tap dot → consume/recover | `<ResourceTracker>`, `<ResourceDots>` |
| Spell Slots | `SpellSlots` | Tap slot → consume/recover | `<SpellSlotTracker>`, `<SlotCircle>` |
| Conditions | `Conditions[]` | Tap → toggle; Tap [+] → add condition | `<ConditionBar>`, `<ConditionChip>` |
| Quick Actions | — | Tap → rest / navigate | `<QuickActionBar>` |

### 5.2 Character Creation — Wizard Flow

> Step-by-step guided creation. Each step is one screen.

#### Wizard Steps

```
Step 1: Species        →  Step 2: Class         →  Step 3: Background
  (10 cards)              (12 cards)               (16 cards)
     │                       │                        │
     ▼                       ▼                        ▼
Step 4: Abilities     →  Step 5: Skills        →  Step 6: Feats
  (Standard Array/         (auto-assigned +          (Origin feat auto,
   Point Buy/               pick remaining)           1st level choice)
   Manual)                      │
     │                         │
     ▼                         ▼
Step 7: Equipment     →  Step 8: Details       →  Step 9: Review
  (starting gear)          (name, portrait,            (summary,
                             backstory)                  confirm → create)
```

#### Step Progress Indicator

```
 ●───●───●───○───○───○───○───○───○
 SPC  CLS  BGD  ABI  SKL  FTT  EQP  DET  REV
```

Each step:
- Has **Back** and **Next** buttons
- Auto-saves progress to LocalStorage (debounce 500ms)
- Validates before allowing **Next** (inline errors, not alerts)
- Shows completed steps as ✓ in progress indicator

#### Species Selection (Step 1)

```
┌──────────────────────────────┐
│ Choose Your Species      1/9 │
│                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ 🧝  │ │ 🪓  │ │ 👤  │ │
│ │Elf   │ │Dwarf │ │Human │ │
│ │"Grace│ │"Stou"│ │"Flex"│ │
│ └──────┘ └──────┘ └──────┘ │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ 😈  │ │ 🦶  │ │ 🏔️  │ │
│ │Tiefl│ │Halfl │ │Goliat│ │
│ └──────┘ └──────┘ └──────┘ │
│ ...                          │
│                              │
│ Selected: Dwarf              │
│ ┌──────────────────────────┐ │
│ │ Dwarf Traits:            │ │
│ │ • Con +2, Str +1         │ │
│ │ • Darkvision 60ft        │ │
│ │ • Dwarven Resilience     │ │
│ │ • Dwarven Combat Training│ │
│ │ • Stonecunning           │ │
│ └──────────────────────────┘ │
│                              │
│ [Back]              [Next →] │
└──────────────────────────────┘
```

#### Ability Assignment (Step 4)

```
┌──────────────────────────────┐
│ Assign Abilities         4/9 │
│                              │
│ [Standard Array] [Point Buy] │ ← Mode switcher
│ [Manual Input]               │
│                              │
│ Standard Array: 15 14 13 12  │ ← Unassigned pool
│                  10  8       │
│                              │
│ STR  DEX  CON  INT  WIS  CHA│
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ │15│ │12│ │13│ │10│ │14│ │8 │ ← Tap to assign
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
│ +2   +0   +1   +0   +0   +0  ← Racial bonus
│ =17  =12  =14  =10  =14  =8  ← Total
│ +3   +1   +2   +0   +2   -1  ← Modifier
│                              │
│ [Back]              [Next →] │
└──────────────────────────────┘
```

### 5.3 Full Character Sheet

> Detailed view of all character data. Scrollable, tabbed.

```
┌──────────────────────────────────┐
│ ← Borin Ironforge          [Edit]│
├──────────────────────────────────┤
│ [Combat] [Skills] [Spells] [More]│ ← Tabs
├──────────────────────────────────┤
│                                  │
│  ABILITIES                       │
│  STR 17 (+3)  DEX 12 (+1)       │
│  CON 14 (+2)  INT 10 (+0)       │
│  WIS 14 (+2)  CHA  8 (-1)       │
│                                  │
│  COMBAT STATS                    │
│  AC 18 (Chain Mail + Shield)     │
│  HP 38/42  Temp 0               │
│  Initiative +1                   │
│  Speed 25ft  Prof +3             │
│                                  │
│  SAVING THROWS                   │
│  STR +6✓  DEX +1   CON +5✓      │
│  INT +0   WIS +2   CHA -1       │
│  (✓ = proficient)                │
│                                  │
│  ATTACKS                         │
│  Longsword +7  1d8+4 slashing   │
│  Hand Axe   +7  1d6+4 slashing  │
│  Unarmed    +4  1 + 2 bludgeon  │
│                                  │
│  ...                             │
└──────────────────────────────────┘
```

### 5.4 Level Up — Modal Workflow

```
┌──────────────────────────────┐
│ ⬆️ Level Up!  Level 4 → 5   │
│                              │
│ HP Increase                  │
│ ┌──────────────────────────┐ │
│ │ Fixed: 6 (d10 avg +2)   │ │ ← Radio: Fixed or Roll
│ │ Roll:  [🎲 Roll d10]    │ │
│ └──────────────────────────┘ │
│                              │
│ New Features                 │
│ • Extra Attack              │
│                              │
│ ASI or Feat?                 │
│ ┌──────────┐ ┌────────────┐ │
│ │ +2 Stats │ │ Choose Feat│ │ ← Toggle
│ └──────────┘ └────────────┘ │
│                              │
│ (If ASI selected:)           │
│ STR +1  DEX +1  [pick two]  │
│                              │
│ (If Feat selected:)          │
│ [Search feats...]            │
│ • Great Weapon Fighting      │
│ • Heavy Armor Master         │
│                              │
│         [Cancel]  [Confirm]  │
└──────────────────────────────┘
```

### 5.5 Settings

```
┌──────────────────────────────┐
│ Settings                     │
│                              │
│ Appearance                   │
│ Theme    [Dark] [Light] [Auto]│
│                              │
│ Characters                   │
│ [Manage Characters...]       │
│ [Import Character]           │
│ [Export Current Character]   │
│                              │
│ About                        │
│ Version 0.1.0 (MVP)         │
│ DND 2024 Character Sheet     │
│ [Reset All Data]             │
└──────────────────────────────┘
```

---

## 6. Interaction Specifications

### 6.1 Tap Actions (Game Mode)

| Tap Target | Action | Feedback |
|------------|--------|----------|
| HP number | Open HP modify panel | Bottom sheet slides up |
| AC number | Show AC breakdown tooltip | Tooltip popup |
| Skill chip | Copy "1d20+X" to clipboard | Toast "Copied 1d20+7" |
| Resource dot | Consume (+1 used) / Recover (-1 used) | Dot fills/unfills with animation |
| Spell slot circle | Consume / Recover | Circle fills/unfills |
| Condition chip | Toggle condition on/off | Chip appears/disappears |
| [+Condition] | Open condition picker | Bottom sheet with condition list |
| [Short Rest] | Execute short rest workflow | Confirmation → apply → toast |
| [Long Rest] | Execute long rest workflow | Confirmation → apply → toast |
| [Full Sheet] | Navigate to `/sheet/:id` | Page transition |
| [Edit] | Navigate to `/edit/:id` | Page transition |
| Weapon row | Show attack detail popover | Popover with range, properties, mastery |

### 6.2 HP Modify Panel (Bottom Sheet)

```
┌──────────────────────────────────┐
│ HP: 38 / 42                     │
│                                  │
│ Temp HP: [  0  ]                │
│                                  │
│ Damage / Healing:                │
│  [-5] [-1]  [  3  ]  [+1] [+5] │
│                                  │
│ [Apply Damage]  [Apply Healing]  │
│                                  │
│ ─── Death Saves ───             │
│ Success: ● ○ ○                  │
│ Failure: ● ○ ○                  │
│                                  │
│          [Close]                 │
└──────────────────────────────────┘
```

### 6.3 Short Rest Flow

```
Step 1: Confirm Short Rest
  "Spend Hit Dice to recover HP?"
  Hit Dice: d10 (3 remaining)

Step 2: Choose Hit Dice
  [Spend 1 HD] [Spend 2 HD] [Skip]

Step 3: Results
  "Recovered 8 HP (d10+2 × 1)"
  "Resources reset: Second Wind, Action Surge"

Step 4: [Done] → back to Game Mode
```

### 6.4 Long Rest Flow

```
Step 1: Confirm Long Rest
  "8 hours of rest. This will:"
  • Restore HP to maximum
  • Reset all resources
  • Recover half of used Hit Dice
  • Recover all spell slots
  • Clear all conditions

Step 2: [Confirm Long Rest]  [Cancel]

Step 3: Results (auto-dismiss after 2s)
  "HP restored to 42/42"
  "Hit Dice recovered: 1 (3 remaining)"
```

### 6.5 Character Creation Interactions

| Step | Key Interactions |
|------|-----------------|
| Species | Card grid → tap to select → traits panel slides in from bottom |
| Class | Card grid → tap to select → features list expands below |
| Background | Card grid → tap to select → skill/tool/feat grants shown |
| Abilities | Mode switcher (tabs) → Standard Array: drag or tap-assign; Point Buy: +/- buttons; Manual: number input |
| Skills | Auto-checked from class/background → tap to toggle additional → expertise picker for Rogue/Bard |
| Feats | Categorized list → search bar → tap card to expand → "Select" button (disabled if prerequisites unmet) |
| Equipment | Starting equipment auto-filled → tap to swap from catalog |
| Details | Text inputs: name, backstory; Portrait placeholder (MVP: no image upload) |
| Review | Read-only summary → "Create Character" button |

---

## 7. Component Library

### 7.1 Core Components

| Component | Props | Used In |
|-----------|-------|---------|
| `<StatCard>` | `label, value, accent?, onTap?` | AC, HP, Initiative, PP |
| `<HPDisplay>` | `current, max, temporary` | Game Mode, Full Sheet |
| `<ResourceTracker>` | `name, current, max, displayType, resetOn, onChange` | Game Mode |
| `<ResourceDots>` | `current, max, onChange` | Inside ResourceTracker |
| `<SpellSlotTracker>` | `slots: {level, current, max}[], onChange` | Game Mode |
| `<SlotCircle>` | `filled, onTap` | Inside SpellSlotTracker |
| `<ConditionBar>` | `active: string[], available: string[], onToggle` | Game Mode |
| `<ConditionChip>` | `name, active, onTap` | Inside ConditionBar |
| `<WeaponRow>` | `weapon, attackBonus, damage, mastery?` | Game Mode, Full Sheet |
| `<SkillBadge>` | `name, bonus, proficient?, pinned?, onTap` | Game Mode |
| `<CardGrid>` | `items, selectedId, onSelect, renderCard` | Creation steps |
| `<StepWizard>` | `steps, currentStep, onNext, onBack` | Character Creation |
| `<HPModifyPanel>` | `hp, temporaryHp, deathSaves, onApply` | Game Mode (bottom sheet) |
| `<RestFlowDialog>` | `type: 'short' \| 'long', character, onComplete` | Game Mode |
| `<LevelUpModal>` | `character, newLevel, onConfirm` | Game Mode |
| `<SearchFilter>` | `value, onChange, placeholder, filters?` | Feats, Spells |

### 7.2 Layout Components

| Component | Purpose |
|-----------|---------|
| `<GameLayout>` | Game Mode page shell (header + scrollable content + action bar) |
| `<SheetLayout>` | Full Sheet page shell (header + tabs + content) |
| `<WizardLayout>` | Creation flow shell (progress bar + content + nav buttons) |
| `<ModalLayout>` | Bottom sheet / dialog wrapper |
| `<EmptyState>` | "No spells available", "No matching feats" |

---

## 8. Responsive Design

### 8.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `sm` | 375px | Single column, stacked sections |
| `md` | 768px | Two-column (stats left, lists right) |
| `lg` | 1024px | Three-column (stats / actions / info) |
| `xl` | 1280px | Full desktop layout with sidebar |

### 8.2 Mobile Adaptations

| Desktop Element | Mobile Adaptation |
|-----------------|-------------------|
| Three-column layout | Single column, vertical stack |
| Hover popovers | Tap to expand bottom sheet |
| Keyboard shortcuts | Long-press alternatives |
| Wide weapon table | Compact rows (name + bonus + damage) |
| Full skill list | Pinned skills + "Show More" |

### 8.3 Critical Viewport: 375px (iPhone SE)

At this width, **every pixel counts**. Specific adaptations:
- Combat stats row: 3 compact cards (AC | HP | Init) → PP moved below
- Weapon rows: hide mastery property, show on tap
- Resource trackers: horizontal layout (name + dots in one line)
- Spell slots: single row of circles per level
- Condition bar: horizontally scrollable chips
- Quick actions: 2×2 grid instead of horizontal row

---

## 9. Dark Mode & Theming

### 9.1 Implementation

```css
/* Tailwind config */
module.exports = {
  darkMode: 'class',  // toggle via <html class="dark">
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        accent: {
          gold: 'var(--accent-gold)',
          red: 'var(--accent-red)',
          green: 'var(--accent-green)',
          blue: 'var(--accent-blue)',
          purple: 'var(--accent-purple)',
        },
      },
    },
  },
};
```

### 9.2 Theme Toggle

- **Default**: Dark (per D3)
- **Persistence**: `localStorage.setItem('theme', 'dark' | 'light')`
- **System preference**: Respect `prefers-color-scheme` on first visit
- **Toggle location**: Settings page only (not in Game Mode to save space)

### 9.3 High Contrast Mode (Optional P1)

- Thicker borders (2px → 3px)
- Larger stat fonts (+4pt)
- Remove subtle gradients
- Intended for projector/shared-screen use

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen reader | Semantic HTML + ARIA labels on all interactive elements |
| Color-blind safe | Never rely solely on color; use icons + text labels |
| Keyboard navigation | Tab order follows visual order; Enter/Space activates |
| Focus management | Modals trap focus; return focus on close |
| Touch targets | Minimum 44×44px (per D2) |
| Font scaling | Respect `font-size: 100%` base; use `rem` units |
| Reduced motion | Respect `prefers-reduced-motion`; disable animations |

---

## 11. Performance Budget

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint | < 1.5s | Game table = no patience |
| Time to Interactive | < 3s | See D1 principle |
| Bundle size (gzipped) | < 200KB | Mobile data awareness |
| Game Mode render | < 100ms | Must feel instant |
| 75-feat list scroll | 60fps | Virtual scrolling required |
| Auto-save latency | < 50ms | Debounced 500ms, write < 50ms |

### 11.1 Optimization Strategies

- **Code splitting**: Route-based lazy loading (`React.lazy`)
- **Data loading**: Load `static/*.json` on demand (feats/spells only when needed)
- **Virtual scrolling**: `@tanstack/virtual` for feats list, spells list
- **Memoization**: `React.memo` for stat cards (re-render only when data changes)
- **Service Worker**: Cache static JSON + app shell for offline use

---

## 12. Data Flow

### 12.1 Read Path (Game Mode → Display)

```
Character (immutable object)
    │
    ├─ recomputeDerivedStats() → CombatStats (AC, Init, PP)
    │
    ├─ HitPoints → <HPDisplay>
    │     └─ current, max, temporary → rendered
    │
    ├─ Equipment[] → <WeaponList>
    │     └─ filter(equipped, type=weapon) → attack rows
    │
    ├─ Skills[] → <SkillChips>
    │     └─ filter(pinned) → rendered chips
    │
    ├─ Resources[] → <ResourceTracker>
    │     └─ displayType → dots/points/counter
    │
    ├─ SpellSlots → <SpellSlotTracker>
    │     └─ per level → circles
    │
    └─ Conditions[] → <ConditionBar>
          └─ map → chips
```

### 12.2 Write Path (User Interaction → State Update)

```
User Tap (e.g., HP +5)
    │
    ▼
HPModifyPanel.onApply({type: 'heal', amount: 5})
    │
    ▼
useCharacter.applyMutation({type: 'modifyHP', delta: 5})
    │
    ▼
mutateCharacter(character, {type: 'modifyHP', delta: 5})
    │  ← core engine validates & returns new immutable Character
    ▼
recomputeDerivedStats(mutatedCharacter)
    │  ← core engine recalculates derived stats
    ▼
setCharacter(recomputed)  ← React re-renders
    │
    ▼
autoSave(recomputed)  ← debounce 500ms → LocalStorage
```

### 12.3 Auto-Save Strategy

```
Every mutation
    │
    ▼
debounce(500ms)
    │
    ▼
serialize(character) → JSON
    │
    ▼
localStorage.setItem(`char-${id}`, json)
```

- No "Save" button needed (autosave is sufficient for local-first)
- Export is explicit (user-triggered, generates `.dnd2024.json` file)

---

## 13. Implementation Phases

### Phase 1: Game Mode MVP (Week 1-2)

> Get the primary screen working end-to-end.

| Task | Est. | Priority |
|------|------|----------|
| Project setup (Vite + React + Tailwind) | 4h | P0 |
| Design tokens + theme config | 2h | P0 |
| `<GameLayout>` shell | 4h | P0 |
| `<StatCard>`, `<HPDisplay>` | 4h | P0 |
| `<WeaponRow>` list | 3h | P0 |
| `<ResourceTracker>` with dots | 4h | P0 |
| `<SpellSlotTracker>` | 3h | P0 |
| `<ConditionBar>` | 3h | P0 |
| `<QuickActionBar>` (rest buttons) | 2h | P0 |
| HP modify panel (bottom sheet) | 4h | P0 |
| Short/Long rest flows | 4h | P0 |
| `useCharacter` hook + Zustand store | 3h | P0 |
| Auto-save to LocalStorage | 2h | P0 |
| Dark/light theme toggle | 2h | P0 |
| **Total** | **~44h** | |

### Phase 2: Character Creation (Week 3-4)

| Task | Est. | Priority |
|------|------|----------|
| `<StepWizard>` + progress indicator | 4h | P0 |
| Species selection (card grid) | 4h | P0 |
| Class selection (card grid) | 4h | P0 |
| Background selection (card grid) | 4h | P0 |
| Ability assignment (3 modes) | 8h | P0 |
| Skill selection (grouped list) | 4h | P0 |
| Feat selection (virtual scroll) | 6h | P0 |
| Equipment (starting gear) | 3h | P0 |
| Details + Review | 3h | P0 |
| Creation → Game Mode handoff | 2h | P0 |
| **Total** | **~42h** | |

### Phase 3: Full Sheet + Polish (Week 5-6)

| Task | Est. | Priority |
|------|------|----------|
| Full Sheet (tabbed layout) | 8h | P0 |
| Level Up modal workflow | 6h | P0 |
| Character list + switching | 4h | P1 |
| Data export/import UI | 4h | P1 |
| Responsive breakpoints (md/lg) | 4h | P1 |
| Accessibility audit + fixes | 4h | P1 |
| Performance optimization | 4h | P1 |
| Settings page | 2h | P1 |
| **Total** | **~36h** | |

**Grand Total: ~122h (3 weeks full-time, 6 weeks part-time)**

---

## 14. Design Decisions (Confirmed)

Confirmed by project lead on 2025-05-06:

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| Q1 | CSS utility approach | **Tailwind CSS** | Fastest prototyping, dark mode built-in, shadcn compatibility |
| Q2 | State management | **Zustand** | Minimal boilerplate, works well with immutable `@dnd2024/core` objects |
| Q3 | PWA in MVP? | **No** | MVP scope: web app only; PWA deferred to post-MVP |
| Q4 | Character portrait | **Placeholder only** | MVP: generic icon; upload feature deferred to P1 |
| Q5 | Internationalization | **i18n from start** | Data model already has `name.en` / `name.zh`; UI should support both from day 1 |
| Q6 | Component library | **shadcn/ui** | Copy-paste components, Tailwind-native, excellent accessibility |
| Q7 | Animation approach | **CSS transitions** | Lighter than Framer Motion; sufficient for show/hide/color changes |
| Q8 | Mobile testing | **Browser DevTools** | Primary testing via Chrome DevTools device emulation; real device in P1 |

### i18n Implementation Plan (Q5)

Data model already stores bilingual strings:
```typescript
// static/feats.json, static/spells.json, etc.
{ "id": "savage-attacker", "name": { "en": "Savage Attacker", "zh": "野蛮攻击者" } }
```

UI implementation:
- Use `react-i18next` (lightweight, widely adopted)
- Language toggle in Settings (persist to `localStorage`)
- Default language: detect from `navigator.language` → fallback `en`
- Fallback chain: `zh` → `en` → raw key
- All user-facing strings go through `t('key')` — no hardcoded labels

```
hooks/useLocale.ts
const { t } = useLocale();
// t('gameMode.ac') → "AC" (en) or "AC" (zh, could be "护甲等级" in full version)
```

### CSS Transitions (Q7)

Replace Framer Motion with native CSS transitions:

| Interaction | CSS Property | Duration |
|-------------|---------------|-----------|
| Condition chip appear/disappear | `opacity`, `transform` | 0.2s ease |
| Resource dot fill/unfill | `background-color` | 0.15s ease |
| Bottom sheet slide-up | `transform: translateY()` | 0.3s ease-out |
| Theme toggle | `background-color`, `color` | 0.3s ease |
| Skill chip hover/copy feedback | `transform: scale()` | 0.1s ease |

No JS animation library needed — all transitions are simple state changes.

---

## 15. References
https://github.com/mqli/open20-core/
| Document | Relationship |
|----------|-------------|
| PRD v4.0 | Product requirements, design principles, non-goals |
| requirements/03-game-mode/layout.md | Detailed game mode spec (wireframe, interactions, data binding) |
| requirements/04-hp-tracking/* | HP panel, death saves, conditions |
| requirements/05-spell-management/* | Spell list, spell slots |
| requirements/06-resource-tracking/* | Resource display types |
| requirements/02-character-creation/* | All creation step specs |
| requirements/07-level-up/level-up.md | Level up workflow |
| requirements/08-equipment/* | Equipment, weapon mastery |
| requirements/09-data-safety/* | Auto-save, export/import |
| spec/high-level-design.md | Architecture, zero-UI-dependency principle |
| spec/data-model.md | Data structures feeding UI display |