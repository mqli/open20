# FR-005: Multi-dimensional Filtering

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-001 (spell data)  

---

## 1. Description

Support multi-dimensional filtering of spell list: by class, level, school, casting time, concentration requirement, and ritual tag.

**Source**: PRD.md → FR-005

---

## 2. User Stories

**As a** spellcasting player,  
**I want to** filter spells by class, level, and school,  
**so that** I can quickly find spells that match my character's capabilities.

---

## 3. Acceptance Criteria

### Level Tabs
- [ ] Horizontal tab bar with: [All] [Cantrip] [L1] [L2] ... [L9]
- [ ] Single-select (one level at a time)
- [ ] "All" shows all levels
- [ ] Sticky below search bar on scroll

### Class Chips
- [ ] Multi-select toggle chips for classes
- [ ] Classes: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard
- [ ] Visual indication of selected classes
- [ ] "Clear all" option

### School Chips
- [ ] Multi-select toggle chips for schools
- [ ] 8 schools with colors (see design tokens)
- [ ] Visual indication of selected schools

### Other Filters
- [ ] "Ritual" toggle chip (shows only ritual spells)
- [ ] "Concentration" toggle chip (shows only concentration spells)
- [ ] Filters combine with AND logic for same category
- [ ] Filters combine with OR logic across categories

### Active Filter Count
- [ ] Badge on filter icon showing active filter count
- [ ] "Clear all filters" option

---

## 4. UI Components Affected

| Component | Changes |
|-----------|----------|
| `LevelTabs.tsx` | New component - horizontal tab bar |
| `FilterChips.tsx` | New component - multi-select chips |
| `SpellLibrary.tsx` | Integrate filter state |
| `spell-store.ts` | Add filter state (level, classes, schools, etc.) |

---

## 5. Technical Specification

### 5.1 Store State

```typescript
// In spell-store.ts
interface SpellLibraryState {
  // ... existing state
  
  // Filter state
  selectedLevel: number | null;  // null = all levels
  selectedClasses: string[];
  selectedSchools: string[];
  showRitualOnly: boolean;
  showConcentrationOnly: boolean;
  
  // Actions
  setSelectedLevel: (level: number | null) => void;
  toggleClassFilter: (className: string) => void;
  toggleSchoolFilter: (school: string) => void;
  setShowRitualOnly: (show: boolean) => void;
  setShowConcentrationOnly: (show: boolean) => void;
  clearAllFilters: () => void;
}
```

### 5.2 Filtering Logic

```typescript
// In spell-store.ts
applyFilters: () => {
  const { spells, searchQuery, selectedLevel, selectedClasses, selectedSchools, showRitualOnly, showConcentrationOnly } = get();
  
  let filtered = [...spells];
  
  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(query)
    );
  }
  
  // Apply level filter (single select)
  if (selectedLevel !== null) {
    filtered = filtered.filter(s => s.level === selectedLevel);
  }
  
  // Apply class filter (multi-select, OR logic)
  if (selectedClasses.length > 0) {
    filtered = filtered.filter(s =>
      s.classes.some(c => selectedClasses.includes(c))
    );
  }
  
  // Apply school filter (multi-select, OR logic)
  if (selectedSchools.length > 0) {
    filtered = filtered.filter(s => selectedSchools.includes(s.school));
  }
  
  // Apply ritual filter
  if (showRitualOnly) {
    filtered = filtered.filter(s => s.ritual === true);
  }
  
  // Apply concentration filter
  if (showConcentrationOnly) {
    filtered = filtered.filter(s => s.concentration === true);
  }
  
  set({ filteredSpells: filtered });
}
```

### 5.3 LevelTabs Component

```typescript
// src/components/spell-library/LevelTabs.tsx
import { useSpellStore } from '../../stores/spell-store';

const LEVELS = [
  { label: 'All', value: null },
  { label: 'Cantrip', value: 0 },
  { label: '1', value: 1 },
  // ... up to 9
];

export function LevelTabs() {
  const { selectedLevel, setSelectedLevel } = useSpellStore();
  
  return (
    <div className="level-tabs flex gap-2 overflow-x-auto">
      {LEVELS.map(level => (
        <button
          key={level.label}
          onClick={() => setSelectedLevel(level.value)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedLevel === level.value
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
```

### 5.4 FilterChips Component

```typescript
// src/components/spell-library/FilterChips.tsx
import { useSpellStore } from '../../stores';

const CLASSES = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
const SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];

export function FilterChips() {
  const { selectedClasses, toggleClassFilter, selectedSchools, toggleSchoolFilter } = useSpellStore();
  
  return (
    <div className="filter-chips space-y-2">
      {/* Class chips */}
      <div className="flex gap-1 flex-wrap">
        {CLASSES.map(cls => (
          <button
            key={cls}
            onClick={() => toggleClassFilter(cls)}
            className={`px-2 py-1 rounded-full text-xs ${
              selectedClasses.includes(cls)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>
      
      {/* School chips */}
      <div className="flex gap-1 flex-wrap">
        {SCHOOLS.map(school => (
          <button
            key={school}
            onClick={() => toggleSchoolFilter(school)}
            className={`px-2 py-1 rounded-full text-xs ${
              selectedSchools.includes(school)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {school}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Design Mockup

```
┌─────────────────────────────────┐
│ [🔍] Search spells...           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ [All] [Cantrip] [1] [2] [3] │  <- LevelTabs (sticky)
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ [Bard] [Cleric] [Druid] ...   │  <- Class chips (multi-select)
│ [Abjuration] [Evocation] ...   │  <- School chips (multi-select)
│ [Ritual] [Concentration]       │  <- Toggle chips
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Fire Bolt        [Cantrip]      │
│ Fireball         [L3]           │
│ ...                              │
└─────────────────────────────────┘
```

---

## 7. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| No filters selected | Show all spells (respecting search) |
| All classes selected | Same as no class filter |
| Class + School combo with no results | Show empty state |
| Rapid filter toggling | Debounce or batch updates |

---

**Last Updated**: 2026-05-10  
**Updated By**: Tech Lead
