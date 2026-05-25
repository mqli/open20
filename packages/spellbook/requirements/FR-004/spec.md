# FR-004: Spell Search (Real-time by Name)

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-001 (spell data)  

---

## 1. Description

Support real-time search of spell data by name. As user types in search bar, spell list filters immediately (debounced 200ms).

**Source**: PRD.md → FR-004

---

## 2. User Stories

**As a** spellcasting player,  
**I want to** search for spells by name in real-time,  
**so that** I can quickly find the spell I need during gameplay.

---

## 3. Acceptance Criteria

- [ ] Search bar is always visible at top of Spell Library page
- [ ] Search filters spells by name (case-insensitive)
- [ ] Search is debounced 200ms to avoid excessive filtering
- [ ] Matching text in spell name is highlighted
- [ ] Clear button (X) appears when search has text
- [ ] ESC key clears search and returns focus to list
- [ ] Empty state shown when no spells match
- [ ] Search works together with level tabs and filters

---

## 4. UI Components Affected

| Component | Changes |
|-----------|----------|
| `SearchBar.tsx` | New component - search input with icon |
| `SpellLibrary.tsx` | Integrate search state |
| `spell-store.ts` | Add `searchQuery` state and filtering logic |

---

## 5. Technical Specification

### 5.1 Component: SearchBar

```typescript
// src/components/spell-library/SearchBar.tsx
import { useSpellStore } from '../../stores/spell-store';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useSpellStore();

  return (
    <div className="search-bar relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search spells by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border rounded-lg"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
```

### 5.2 Store: searchQuery State

```typescript
// In spell-store.ts
interface SpellLibraryState {
  searchQuery: string;
  // ... other state
}

setSearchQuery: (query: string) => void;
```

### 5.3 Filtering Logic

```typescript
// In spell-store.ts
applyFilters: () => {
  const { spells, searchQuery, selectedLevel, selectedClasses, selectedSchools } = get();
  
  let filtered = [...spells];
  
  // Apply search filter (case-insensitive)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(query)
    );
  }
  
  // Apply other filters...
  
  set({ filteredSpells: filtered });
}
```

### 5.4 Debounce Implementation

```typescript
// Use setTimeout or a debounce hook
import { useDebounce } from '../../hooks/use-debounce';

// In SearchBar component
const [localQuery, setLocalQuery] = useState('');
const debouncedQuery = useDebounce(localQuery, 200);

useEffect(() => {
  setSearchQuery(debouncedQuery);
}, [debouncedQuery]);
```

---

## 6. open20-core API Usage

This requirement only needs frontend filtering. No open20-core API needed.

Spell data is already loaded from open20-core's `searchSpells()` on initial load.

---

## 7. Design Mockup

```
┌─────────────────────────────────┐
│ [🔍] Search spells by name...   │  <- SearchBar
│                      [X]       │  <- Clear button (only when has text)
└─────────────────────────────────┘

After typing "fire":
┌─────────────────────────────────┐
│ [🔍] fire...                   │
│                      [X]       │
└─────────────────────────────────┘

Results:
• Fire Bolt        [Cantrip]    <- Highlighted "Fire"
• Fireball         [L3]         <- Highlighted "Fire"
• Fire Shield      [L4]         <- Highlighted "Fire"
```

---

## 8. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Empty search | Show all spells (respecting other filters) |
| Special characters | Handle regex special chars in search |
| Very long spell names | Truncate with ellipsis |
| No results | Show "No spells found" empty state |

---

**Last Updated**: 2026-05-10  
**Updated By**: Tech Lead
