# D&D Spellbook App — UI Design Specification

**Version**: v1.0  
**Date**: 2026-05-10  
**Designer**: UI Designer  
**Status**: Draft

---

## 1. Design Tokens

### 1.1 Color System

#### Primary — Arcane Purple
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-primary-50 | #EEEDFE | — | Subtle background tint |
| --color-primary-100 | #CECBF6 | #26215C | Light fills / dark backgrounds |
| --color-primary-400 | #7F77DD | #7F77DD | Interactive accents |
| --color-primary-600 | #534AB7 | #AFA9EC | Primary actions, links |
| --color-primary-800 | #3C3489 | #CECBF6 | Active states, headings |

#### Neutral — Stone Gray
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-bg-primary | #FFFFFF | #1A1A1E | Page background |
| --color-bg-secondary | #F5F5F0 | #242428 | Card / panel background |
| --color-bg-tertiary | #ECEAE3 | #2C2C30 | Inset areas, code blocks |
| --color-text-primary | #2C2C2A | #F1EFE8 | Body text |
| --color-text-secondary | #5F5E5A | #B4B2A9 | Secondary text, labels |
| --color-text-tertiary | #888780 | #888780 | Placeholders, hints |
| --color-border | #D3D1C7 | #444441 | Default borders |

#### Semantic — Spell Schools
| School | Color | Usage |
|--------|-------|-------|
| Abjuration | #378ADD (c-blue-400) | Shield icon, badge |
| Conjuration | #1D9E75 (c-teal-400) | Portal icon, badge |
| Divination | #7F77DD (c-purple-400) | Eye icon, badge |
| Enchantment | #D4537E (c-pink-400) | Heart icon, badge |
| Evocation | #D85A30 (c-coral-400) | Fire icon, badge |
| Illusion | #534AB7 (c-purple-600) | Mirror icon, badge |
| Necromancy | #A32D2D (c-red-400) | Skull icon, badge |
| Transmutation | #639922 (c-green-400) | Arrows icon, badge |

#### Semantic — Status
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-success | #1D9E75 | #5DCAA5 | Available spell slot, spell prepared |
| --color-danger | #E24B4A | #F09595 | Expended spell slot, error |
| --color-warning | #BA7517 | #FAC775 | Low spell slots, concentration warning |
| --color-info | #378ADD | #85B7EB | Ritual tag, tooltip |

#### Spell Level Colors
| Level | Color | Usage |
|-------|-------|-------|
| Cantrip (0) | #888780 (c-gray-400) | Badge, tag |
| Level 1 | #378ADD (c-blue-400) | Badge, tag |
| Level 2 | #7F77DD (c-purple-400) | Badge, tag |
| Level 3 | #1D9E75 (c-teal-400) | Badge, tag |
| Level 4 | #D4537E (c-pink-400) | Badge, tag |
| Level 5 | #D85A30 (c-coral-400) | Badge, tag |
| Level 6 | #BA7517 (c-amber-400) | Badge, tab |
| Level 7 | #639922 (c-green-400) | Badge, tab |
| Level 8 | #A32D2D (c-red-400) | Badge, tab |
| Level 9 | #E24B4A (c-red-400) | Badge, tab |

### 1.2 Typography

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| --font-display | 28px / 2rem | 500 | 1.2 | Spell name (detail page) |
| --font-h1 | 20px / 1.25rem | 500 | 1.3 | Page titles |
| --font-h2 | 16px / 1rem | 500 | 1.4 | Section headings |
| --font-h3 | 14px / 0.875rem | 500 | 1.5 | Sub-section headings |
| --font-body | 14px / 0.875rem | 400 | 1.6 | Body text, spell description |
| --font-caption | 12px / 0.75rem | 400 | 1.5 | Metadata labels, hints |
| --font-micro | 11px / 0.6875rem | 400 | 1.4 | Badges, tags, footnotes |

**Font stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`

### 1.3 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| --space-xs | 4px | Icon gaps, inline spacing |
| --space-sm | 8px | Compact padding, list item gaps |
| --space-md | 12px | Standard padding, form field gaps |
| --space-lg | 16px | Section padding, card padding |
| --space-xl | 24px | Major section gaps, page margins |
| --space-2xl | 32px | Large section dividers |
| --space-3xl | 48px | Page top/bottom padding |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 4px | Badges, small chips |
| --radius-md | 8px | Buttons, inputs, small cards |
| --radius-lg | 12px | Cards, panels, modals |
| --radius-xl | 16px | Page-level containers |
| --radius-full | 9999px | Circular icons, pills |

### 1.5 Elevation (Shadow)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 0 1px 2px rgba(0,0,0,0.2) | Subtle lift |
| --shadow-md | 0 4px 12px rgba(0,0,0,0.08) | 0 4px 12px rgba(0,0,0,0.3) | Cards, dropdowns |
| --shadow-lg | 0 8px 24px rgba(0,0,0,0.12) | 0 8px 24px rgba(0,0,0,0.4) | Modals, overlays |

### 1.6 Transitions

| Token | Value | Usage |
|-------|-------|-------|
| --transition-fast | 150ms ease | Hover, focus, active states |
| --transition-normal | 250ms ease | Theme switch, panel open |
| --transition-slow | 400ms ease | Page transitions |

---

## 2. Component Library

### 2.1 Button

**Variants**: Primary, Secondary, Ghost, Danger

| Property | Primary | Secondary | Ghost | Danger |
|----------|---------|-----------|-------|--------|
| Background | --color-primary-600 | --color-bg-tertiary | transparent | --color-danger |
| Text | #FFFFFF | --color-text-primary | --color-primary-600 | #FFFFFF |
| Border | none | --color-border | --color-primary-600 | none |
| Border radius | --radius-md | --radius-md | --radius-md | --radius-md |
| Padding | 8px 16px | 8px 16px | 6px 12px | 8px 16px |
| Hover | --color-primary-800 | --color-bg-tertiary | --color-primary-50 | darker red |

**Sizes**: Small (28px height), Medium (36px height), Large (44px height)

### 2.2 Badge / Chip

**Variants**: Spell level, School, Tag, Status

- Spell level badge: Colored background (20% opacity) + colored text, --radius-full
- School badge: Icon + school name, colored border-left accent
- Tag: Small pill, --color-bg-tertiary background, --font-micro text
- Status badge: Prepared (green dot), Concentration (amber pulse), Ritual (blue icon)

### 2.3 Card

- Background: --color-bg-secondary
- Border: 1px solid --color-border
- Border radius: --radius-lg
- Padding: --space-lg
- Shadow: --shadow-sm
- Hover state: --shadow-md, translateY(-1px)

### 2.4 Input / Search

- Background: --color-bg-primary
- Border: 1px solid --color-border
- Border radius: --radius-md
- Height: 40px
- Padding: 0 12px 0 40px (search icon left)
- Focus: Border --color-primary-600, 3px ring --color-primary-100

### 2.5 Tab Bar

- Horizontal scrollable list of tabs
- Active tab: --color-primary-600 text, 2px bottom border --color-primary-600
- Inactive tab: --color-text-secondary text
- Tab height: 44px

### 2.6 Spell Slot Tracker

- Row of circles (one per spell slot at that level)
- Available: Filled --color-success, 24px circle
- Expended: Empty outline --color-border, 24px circle with dashed stroke
- Interaction: Click circle to toggle expended/available
- Label: "Level N" on the left, "M/N remaining" on the right

### 2.7 Dice Roller

- Large rounded square button (56px)
- Dice face icon (d20, d4, d6, d8, d10, d12)
- Click triggers roll animation (brief rotation/shake, 300ms)
- Result displayed in large number overlay
- Color: --color-primary-600 background, white result text

### 2.8 Concentration Indicator

- Small amber dot (8px) with subtle pulse animation
- Text label: "Concentrating"
- Tooltip: Shows concentrated spell name
- Toggle: Click to dismiss concentration

---

## 3. Page Layouts

### 3.1 Spell Library

**Purpose**: Browse, search, and filter the complete SRD spell list (FR-001 ~ FR-005)

**Layout structure**:
```
+----------------------------------------------+
| [Search Bar]                     [Filter v]   |
+----------------------------------------------+
| [All] [L0] [L1] [L2] ... [L9]  (Level tabs) |
+----------------------------------------------+
| [Class chips] [School chips] [Ritual] [Conc] |
+----------------------------------------------+
| +------------------------------------------+ |
| | Spell Name          [L3] [Evocation] [V] | |
| | Casting: 1 Action    Range: 60 feet       | |
| | [Prepared] [Concentration]                | |
| +------------------------------------------+ |
| +------------------------------------------+ |
| | Spell Name          [L1] [Abjuration][VS] | |
| | Casting: 1 Action    Range: Touch          | |
| | [Prepared]                                  | |
| +------------------------------------------+ |
| ...                                          |
+----------------------------------------------+
```

**Key specifications**:
- Search bar: Sticky top, 40px height, search icon left-aligned
- Level tabs: Horizontally scrollable, sticky below search
- Filter chips: Wrap horizontally, multi-select
- Spell card: 80-96px height, 2-line preview (name + metadata)
- Each card shows: Name, level badge, school, components shorthand (V/S/M)
- Prepared indicator: Green checkmark icon on card
- Concentration indicator: Amber dot on card
- Click card → Open Spell Detail Flyout

### 3.2 Spell Detail — Flyout Panel

**Purpose**: Display complete spell information with dice rolling (FR-012 ~ FR-018)

**Pattern**: Flyout panel (right-side slide-over on desktop, bottom sheet on mobile) — NOT a separate page/tab. This allows users to quickly reference a spell while maintaining context of the spell list or character sheet.

**Layout structure (Desktop — 540px right-side flyout)**:
```
┌─────────────────────┬───────────────────────────┐
│                     │ [Back]              [X]  │
│   Spell Library     ├───────────────────────────┤
│   (still visible)   │ Fire Bolt                 │
│                     │ [Cantrip] [Evocation]     │
│   [spell list       ├───────────────────────────┤
│    remains          │ Cast Time  Range  Dur     │
│    scrollable]      │ 1 Action   120ft  Inst    │
│                     ├───────────────────────────┤
│                     │ Components: V  S          │
│                     ├───────────────────────────┤
│                     │ [d20 Attack] [d10 Damage] │
│                     ├───────────────────────────┤
│                     │ Spell description...      │
│                     │                           │
│                     │ At Higher Levels: ...     │
│                     ├───────────────────────────┤
│                     │ Classes: Sor, Wiz, War   │
│                     └───────────────────────────┘
```

**Layout structure (Mobile — 85vh bottom sheet)**:
```
┌─────────────────────┐
│  Spell Library      │
│  [list visible]     │
│  ┌───────────────┐  │
│  │   ═══ (drag)  │  │
│  │ [Back]    [X] │  │
│  │ Fire Bolt     │  │
│  │ ...           │  │
│  │               │  │
│  │ (scrollable)  │  │
│  └───────────────┘  │
└─────────────────────┘
```

**Key specifications**:
- **Trigger**: Click any spell card → flyout opens; clicking another spell swaps content
- **Close methods**: Back button, X button, Escape key, click backdrop overlay, swipe down (mobile)
- **Width**: 540px max (92vw fallback), full-width on mobile
- **Height**: 100vh on desktop, 85vh on mobile (bottom sheet)
- **Animation**: 300ms cubic-bezier(.4,0,.2,1) slide-in, 250ms fade for backdrop
- **Backdrop**: Semi-transparent overlay (rgba(0,0,0,.35)), click to close
- **Header**: Sticky top, Back button (left) + Close button (right), separated by border
- **Mobile**: Drag handle indicator at top, rounded corners at top (16px radius)
- **Body**: Scrollable independently from the main page
- **Spell name**: --font-display (26px desktop, 22px mobile), --font-weight 500
- **Metadata block**: 3-column grid on desktop, 2-column on mobile (Casting Time / Range / Duration)
- **Component icons**: V (speech bubble), S (hand), M (gem) — each as a small badge
- **Dice roller section**: Only visible when spell requires attack roll or deals damage
- **Description**: --font-body, full width, comfortable line height (1.7)
- **At Higher Levels**: Visually separated section with subtle left border accent (3px solid)
- **Available classes**: Small badges at the bottom

### 3.3 Character Sheet

**Purpose**: Manage spell slots, prepared spells, and concentration (FR-006 ~ FR-011)

**Layout structure**:
```
+----------------------------------------------+
| Character Name              [Edit] [Theme]  |
| Level 5 Wizard              INT +4  Prof +3  |
+----------------------------------------------+
| Spell Save DC: 15        Attack Bonus: +7   |
+----------------------------------------------+
| CONCENTRATION                                 |
| [Amber dot] Maintaining: Shield              |
| [Dismiss Concentration]                       |
+----------------------------------------------+
| SPELL SLOTS                                   |
|                                               |
| Cantrips     [Always available]               |
| Level 1      (o)(o)(o)(o)  4/4               |
| Level 2      (o)(o)(o)     3/3               |
| Level 3      (o)(o)        2/2               |
|                                               |
| [Long Rest — Recover All Slots]              |
+----------------------------------------------+
| PREPARED SPELLS  (6/8)                       |
| +------------------------------------------+ |
| | Fire Bolt         Cantrip  [Evocation]   | |
| | Shield            L1      [Abjuration]    | |
| | Magic Missile     L1      [Evocation]     | |
| | Detect Magic      L1      [Divination]    | |
| | Misty Step        L2      [Conjuration]   | |
| | Hold Person       L2      [Enchantment]   | |
| +------------------------------------------+ |
| [+ Prepare More Spells]                      |
+----------------------------------------------+
```

**Key specifications**:
- Character header: Name (h1), class + level (caption), stats in a row
- DC and Attack bonus: Prominent display in a highlighted bar
- Concentration section: Only visible when active, amber accent, dismiss button
- Spell slot tracker: Each level is a row, circles represent individual slots
  - Available: Filled green circle (--color-success)
  - Expended: Dashed outline (--color-border)
  - Click to toggle
- Long Rest button: Full-width, secondary style, at the bottom of slots section
- Prepared spells: List of prepared spell cards (compact), count shown in header
- Prepare button: Opens spell selection modal

### 3.4 Character Setup

**Purpose**: Create or edit a character profile (FR-006)

**Layout structure**:
```
+----------------------------------------------+
| Create Character                              |
+----------------------------------------------+
| Character Name                                |
| [________________________]                   |
|                                               |
| Class                                         |
| [Bard] [Cleric] [Druid] [Paladin]            |
| [Ranger] [Sorcerer] [Warlock] [Wizard]       |
|                                               |
| Character Level          [5]                  |
| Spellcasting Ability    [Intelligence v]      |
| Proficiency Bonus       [+3]                  |
+----------------------------------------------+
| Preview                                       |
| Spell Save DC: 15                            |
| Spell Attack: +7                             |
| Spell Slots: L1: 4, L2: 3, L3: 2            |
| Can prepare: 8 spells (Long Rest, any)       |
+----------------------------------------------+
|              [Cancel]  [Create Character]    |
+----------------------------------------------+
```

**Key specifications**:
- Class selection: Grid of buttons, selected state uses --color-primary-600
- Level: Number input or stepper (+/-) with range 1-20
- Spellcasting ability: Dropdown with auto-suggestion based on class
  - Wizard, Artificer → Intelligence
  - Cleric, Druid → Wisdom
  - Bard, Paladin, Sorcerer, Warlock → Charisma
- Preview section: Auto-calculated values update in real-time as user fills in fields
- Can prepare: Shows preparation rules for the selected class

---

## 4. Interaction Patterns

### 4.1 Spell Search
1. User taps search bar → Keyboard appears, search bar focuses
2. As user types, spell list filters in real-time (debounced 200ms)
3. Matching text highlighted in spell name
4. Clear button (x) appears when search bar has text
5. ESC key clears search and returns focus to list

### 4.2 Filter Behavior
- Level tabs: Single-select (one level at a time, "All" to show all)
- Class chips: Multi-select (toggle on/off)
- School chips: Multi-select (toggle on/off)
- Ritual/Concentration: Toggle chips (on/off)
- Active filter count shown as a badge on the filter icon
- "Clear all" option in filter dropdown

### 4.3 Spell Preparation
1. User taps "Prepare More Spells" on Character Sheet
2. Modal opens showing available spells for that character
3. Already-prepared spells shown with green checkmark
4. User taps a spell to toggle preparation
5. Counter shows "X/Y prepared" and updates in real-time
6. When limit reached, remaining spells become disabled with tooltip
7. "Done" button closes modal and returns to Character Sheet

### 4.4 Dice Rolling
1. In Spell Detail flyout, dice section shows available rolls (only for spells with attack/damage)
2. Tap "Roll Attack" → d20 roll result appears (e.g., "d20: 15 + 7 = 22")
3. Tap "Roll Damage" → Damage dice roll result appears (e.g., "1d10: [6] + 0 = 6")
4. Natural 20 → "Critical Hit!" in green; Natural 1 → "Critical Miss!" in red
5. Roll result persists until next roll or flyout close
6. User can roll multiple times while keeping the flyout open

### 4.5 Spell Slot Management
1. Tap any slot circle to toggle expended/available
2. Visual feedback: Green fill fades out, dashed outline appears (or reverse)
3. "X/Y remaining" counter updates in real-time
4. "Long Rest" button: Single tap restores all slots with confirmation
5. When all slots at a level are expended, row shows warning tint

### 4.6 Concentration Management
1. When a concentration spell is cast, amber indicator appears on Character Sheet
2. If already concentrating, show warning: "You are already concentrating on [Spell]. Dismiss it first?"
3. Confirm → Old concentration dismissed, new one applied
4. Tap "Dismiss Concentration" → Concentration cleared immediately

---

## 5. Responsive Behavior

### 5.1 Breakpoints
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop | 1024px+ | Full 3-column metadata grid, side-by-side layouts |
| Tablet | 768px - 1023px | Metadata grid adapts to 2 columns, cards narrower |
| Mobile | < 768px | Single column, full-width cards, bottom sheet modals |

### 5.2 Desktop-Specific
- Max content width: 960px, centered
- Spell library: Optional 2-column card grid
- Spell detail flyout: 540px right-side slide-over, spell list remains visible for comparison
- Keyboard shortcuts fully active (Escape to close flyout)

### 5.3 Mobile-Specific
- Search bar always visible at top
- Level tabs scroll horizontally with fade edges
- Filter chips wrap to multiple rows
- Spell detail: Bottom sheet (85vh height), rounded top corners, drag handle indicator
- Dice roller: Full-width buttons
- Modals: Full-screen overlay

---

## 6. Accessibility

- **Color contrast**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Keyboard navigation**: Full tab order through all interactive elements
- **Focus indicators**: 2px outline ring, --color-primary-600
- **Screen reader**: All icons have aria-labels, spell data marked with semantic roles
- **Touch targets**: Minimum 44px for all interactive elements
- **Reduced motion**: Disable dice roll animation and concentration pulse when enabled
