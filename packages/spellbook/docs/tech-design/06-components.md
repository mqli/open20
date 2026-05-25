## 6. Component Specifications

### 6.1 UI Architecture Principles

1. **Radix UI as Foundation**: All interactive components (Dialog, Tabs, Toggle, DropdownMenu) must wrap Radix UI primitives
2. **Shared UI Components**: Common patterns live in `src/components/ui/` using CVA (class-variance-authority) for variant management
3. **Minimize Inline Classes**: Domain components should compose shared UI components rather than apply raw Tailwind classes
4. **CVA for Variants**: Use `class-variance-authority` for any component with visual variants
5. **Design Tokens**: Variant classes live in `src/styles/design-tokens.ts` — never duplicate variant strings across files

---

### 6.2 Design Tokens

**File**: `src/styles/design-tokens.ts`

Centralizes variant classes and color values used across shared UI components.

**Exports**:
- `colors` — CSS variable values for inline styles
- `*Variants` — Variant class strings for CVA (e.g., `badgeVariants`, `buttonVariants`, `toggleVariants`)
- `*SizeVariants` — Size class strings (e.g., `badgeToggleSizeVariants`, `buttonSizeVariants`)

**Why Extract Tokens?**
- Single source of truth for variant classes
- Easy design system updates (change once, all components update)
- TypeScript preserves literal types via `as const`

---

### 6.3 Shared UI Component Library

Location: `src/components/ui/`

| Component | Radix Primitive | Purpose |
|-----------|----------------|---------|
| `Badge` | — | Status/label indicators with variant + size |
| `Button` | — | Actions with variant + size |
| `IconButton` | — | Icon-only buttons with variant + active state |
| `Surface` | — | Generic surface/plane with variant + padding + shadow |
| `Dialog` | `@radix-ui/react-dialog` | Modal dialogs |
| `Sheet` | `@radix-ui/react-dialog` | Side panel (right/left/bottom) |
| `Tabs` | `@radix-ui/react-tabs` | Tab navigation |
| `Toggle` | `@radix-ui/react-toggle` | Stateful button with `data-[state=on]` |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Context menus |
| `Input` | — | Text inputs |
| `Select` | — | Single-select dropdowns |
| `Switch` | — | Toggle switches |
| `Slider` | — | Range inputs |
| `Tooltip` | — | Hover tooltips |
| `FilterChip` | — | Removable filter indicators |

**Pattern**: All shared components use CVA with variants imported from `design-tokens.ts`.

---

### 6.4 Domain Components (High-Level)

#### Layout Components

| Component | Location | Description |
|-----------|----------|-------------|
| `SpellLibraryLayout` | `layout/` | Main spell browser container. Composes SearchBar, LevelTabs, FilterChips, SpellCard grid, and SpellDetailFlyout |
| `CharacterBar` | `character/` | Top bar showing active character name + quick stats |

#### Spell Library Components

| Component | Location | Description |
|-----------|----------|-------------|
| `SearchBar` | `spell-library/` | Search input wrapping `ui/Input` |
| `LevelTabs` | `spell-library/` | Level filter wrapping `ui/Tabs` |
| `FilterChips` | `spell-library/` | Active filters wrapping `ui/FilterChip` |
| `SpellCard` | `spell-library/` | Individual spell card. Composes `Card` + `Badge` + `IconButton` |
| `SpellDetailFlyout` | `spell-library/` | Slide-in detail panel reading from `useSpellStore` |

#### Character Sheet Components

| Component | Location | Description |
|-----------|----------|-------------|
| `CharacterSheet` | `character/` | Side panel wrapping `ui/Sheet`. Shows character info, spell slots, and per-class spell sections |
| `ConcentrationBanner` | `character/CharacterSheet/` | Active concentration indicator |
| `SpellSlotsSection` | `character/CharacterSheet/` | Spell slot display wrapping `SlotPips` |
| `ClassSpellSection` | `character/CharacterSheet/` | Per-class prepared/known spell list |

---

### 6.5 Component Hierarchy

```
App
├── SpellLibraryLayout          # Main spell browser
│   ├── CharacterBar            # Top bar with char name + stats
│   ├── SearchBar               # Search input (uses ui/Input)
│   ├── LevelTabs               # Level filter (uses ui/Tabs)
│   ├── FilterChips             # Active filters (uses ui/FilterChip)
│   ├── SpellCard               # Individual spell card (uses Card + Badge + IconButton)
│   └── SpellDetailFlyout       # Slide-in detail panel
│
└── CharacterSheet (Sheet)      # Side panel (uses ui/Sheet)
    ├── ConcentrationBanner     # Active concentration indicator
    ├── SpellSlotsSection       # Slot display (uses SlotPips)
    └── ClassSpellSection       # Per-class spell list
        └── SpellEntry          # Individual spell in prep list
```

---

### 6.6 Store Interfaces (Reference)

#### `useSpellStore`

```typescript
interface SpellLibraryState {
  // Data
  spells: Spell[];
  filteredSpells: Spell[];

  // Filters
  searchQuery: string;
  selectedLevel: number | null;
  selectedClasses: string[];
  selectedSchools: string[];
  showRitualOnly: boolean;
  showConcentrationOnly: boolean;
  showPreparedOnly: boolean;
  showKnownOnly: boolean;

  // Detail view
  selectedSpell: Spell | null;
  isDetailOpen: boolean;

  // Actions
  setSpells: (spells: Spell[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLevel: (level: number | null) => void;
  toggleClassFilter: (className: string) => void;
  toggleSchoolFilter: (school: string) => void;
  setShowRitualOnly: (show: boolean) => void;
  setShowConcentrationOnly: (show: boolean) => void;
  setShowPreparedOnly: (show: boolean) => void;
  setShowKnownOnly: (show: boolean) => void;
  clearAllFilters: () => void;
  selectSpell: (spell: Spell | null) => void;
  closeDetail: () => void;
  applyFilters: () => void;
}
```

#### `useCharacterStore`

```typescript
interface CharacterState {
  activeCharacter: AppCharacter | null;
  characters: AppCharacter[];
  isLoading: boolean;
  error: string | null;

  // Character management
  setActiveCharacter: (character: AppCharacter) => void;
  createCharacter: (params: CharacterCreationParams) => void;
  updateCharacter: (character: AppCharacter) => void;
  deleteCharacter: (id: string) => void;

  // Spell management
  prepareSpell: (spellId: string) => void;
  unprepareSpell: (spellId: string) => void;
  prepareSpellForClass: (classId: string, spellId: string) => void;
  unprepareSpellForClass: (classId: string, spellId: string) => void;
  learnSpell: (spellId: string) => void;
  unlearnSpell: (spellId: string) => void;
  castSpell: (spellId: string, level: number) => void;

  // Slot management
  consumeSpellSlot: (level: number) => void;
  recoverSpellSlot: (level: number) => void;
  longRest: () => void;
  shortRest: () => void;

  // Concentration
  startConcentration: (spellId: string) => void;
  endConcentration: () => void;

  // Persistence
  loadCharacters: () => void;
  saveCharacters: () => void;
}
```

**Note**: `spellSaveDC` and `spellAttackBonus` are NOT store selectors — they are computed from `activeCharacter.spells.classSpellcasting[classId]` in UI components.

---

### 6.7 Shared UI Components (Complete)

All planned shared UI components have been implemented:

| Component | Status | Location |
|-----------|--------|----------|
| `Badge` | ✅ | `ui/Badge.tsx` |
| `Button` | ✅ | `ui/Button.tsx` |
| `IconButton` | ✅ | `ui/IconButton.tsx` |
| `Surface` | ✅ | `ui/Surface.tsx` |
| `EmptyState` | ✅ | `ui/EmptyState.tsx` |
| `SlotPips` | ✅ | `ui/SlotPips.tsx` |
| `SectionHeader` | ✅ | `ui/SectionHeader.tsx` |
| `Dialog` | ✅ | `ui/Dialog.tsx` |
| `Sheet` | ✅ | `ui/Sheet.tsx` |
| `Tabs` | ✅ | `ui/Tabs.tsx` |
| `Toggle` | ✅ | `ui/Toggle.tsx` |
| `DropdownMenu` | ✅ | `ui/DropdownMenu.tsx` |
| `Input` | ✅ | `ui/Input.tsx` |
| `Select` | ✅ | `ui/Select.tsx` |
| `Switch` | ✅ | `ui/Switch.tsx` |
| `Slider` | ✅ | `ui/Slider.tsx` |
| `Tooltip` | ✅ | `ui/Tooltip.tsx` |
| `FilterChip` | ✅ | `ui/FilterChip.tsx` |
