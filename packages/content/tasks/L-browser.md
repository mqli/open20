# Task L: ContentBrowser Page

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task H (Layout & Routing)  
**Estimated Effort**: Medium  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement `ContentBrowser` page with filter sidebar, result grid, and "Add to My Pack" flow.

---

## Prerequisites

- [ ] Task H complete (RulebookLayout with sidebar + topbar + routing)
- [ ] `@open20/content` Phase 1 complete (ContentBrowser with searchSpells)

---

## Steps

### 1. Create FilterSidebar Component

Create `src/components/FilterSidebar.tsx`:

```typescript
export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useBrowserStore();

  return (
    <div className="w-64 border-r border-border p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-primary">
          Clear All
        </button>
      </div>

      {/* Source Filter */}
      <div className="mb-4">
        <button className="flex justify-between items-center w-full mb-2">
          <span className="font-medium">Source</span>
          <span>▼</span>
        </button>
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.source === 'SRD'} onChange={(e) => setFilter('source', e.target.checked ? 'SRD' : undefined)} />
            SRD 5.2
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.source === 'Homebrew'} onChange={(e) => setFilter('source', e.target.checked ? 'Homebrew' : undefined)} />
            Homebrew
          </label>
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-4">
        <button className="flex justify-between items-center w-full mb-2">
          <span className="font-medium">Level</span>
          <span>▼</span>
        </button>
        <div className="space-y-1">
          {['Cantrip', '1st', '2nd', '3rd', '4th+'].map((level) => (
            <label key={level} className="flex items-center gap-2">
              <input type="checkbox" />
              {level}
            </label>
          ))}
        </div>
      </div>

      {/* School Filter */}
      <div className="mb-4">
        <button className="flex justify-between items-center w-full mb-2">
          <span className="font-medium">School</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}
```

### 2. Create ActiveFilterChips Component

Create `src/components/ActiveFilterChips.tsx`:

```typescript
export function ActiveFilterChips() {
  const { filters, setFilter } = useBrowserStore();

  const chips = Object.entries(filters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      key,
      label: `${key}: ${value}`,
    }));

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4">
      <span>🔍</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-1"
        >
          {chip.label}
          <button
            onClick={() => setFilter(chip.key, undefined)}
            className="ml-1"
          >
            ✕
          </button>
        </span>
      ))}
      <button
        onClick={() => setFilter('', undefined)} // clear all
        className="text-sm text-primary"
      >
        Clear All Filters
      </button>
    </div>
  );
}
```

### 3. Create ContentCard Component (Browse Mode)

Create `src/components/ContentCard.tsx`:

```typescript
import type { Spell } from 'open20-core';

interface ContentCardProps {
  spell: Spell;
  onAddToPack: (spell: Spell) => void;
}

export function ContentCard({ spell, onAddToPack }: ContentCardProps) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{spell.name}</h3>
        <span className="text-xs text-muted-foreground">📦 {spell.source}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Lv{spell.level} · {spell.school}
      </p>
      <p className="text-sm mb-4 line-clamp-2">
        {spell.description}
      </p>

      <div className="relative">
        <button
          onClick={() => setShowAddDropdown(!showAddDropdown)}
          className="px-3 py-1 border border-border rounded-md text-sm"
        >
          + Add to ▼
        </button>

        {showAddDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-surface-primary border border-border rounded-md shadow-lg p-2 z-10">
            <button className="block w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              📦 My Spells
            </button>
            <button className="block w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              📦 Campaign
            </button>
            <hr className="my-2" />
            <button className="block w-full text-left p-2 hover:bg-muted rounded-md text-sm">
              + New Pack...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Implement ContentBrowser Page

Update `src/pages/ContentBrowser.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ActiveFilterChips } from '../components/ActiveFilterChips';
import { ContentCard } from '../components/ContentCard';

export function ContentBrowser() {
  const [spells, setSpells] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<any>(null);

  useEffect(() => {
    // TODO: call ContentBrowser.searchSpells()
    console.log('Search spells');
  }, []);

  return (
    <div className="flex">
      {/* Sidebar auto-collapses to 64px on Browse page */}
      <div className="w-16 border-r border-border p-2">
        <button className="block w-full p-2 text-center hover:bg-muted rounded-md">
          📦
        </button>
        <button className="block w-full p-2 text-center hover:bg-muted rounded-md">
          🔍
        </button>
      </div>

      <FilterSidebar />

      <div className="flex-1 p-6">
        {/* Read-only mode indicator */}
        <div className="mb-4 p-2 bg-muted/50 rounded-md text-sm">
          🔒 Read-only mode
        </div>

        <ActiveFilterChips />

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded-md text-sm">
              List
            </button>
            <button className="px-3 py-1 border border-border rounded-md text-sm">
              Grid
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            Showing {spells.length} results
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spells.map((spell) => (
            <ContentCard
              key={spell.id}
              spell={spell}
              onAddToPack={(s) => console.log('Add to pack', s)}
            />
          ))}
        </div>

        {spells.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">🔍 No spells found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters
            </p>
            <button className="mt-4 px-4 py-2 border border-border rounded-md text-sm">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {showDetailDrawer && selectedSpell && (
        <DetailDrawer
          spell={selectedSpell}
          onClose={() => setShowDetailDrawer(false)}
        />
      )}
    </div>
  );
}
```

### 5. Create DetailDrawer Component

Create `src/components/DetailDrawer.tsx`:

```typescript
import type { Spell } from 'open20-core';

interface DetailDrawerProps {
  spell: Spell;
  onClose: () => void;
}

export function DetailDrawer({ spell, onClose }: DetailDrawerProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface-primary border-l border-border shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{spell.name}</h3>
        <button onClick={onClose}>✕</button>
      </div>

      {/* Read-only content rendering */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Lv{spell.level} · {spell.school}
        </p>
        <p className="text-sm text-muted-foreground">
          Source: {spell.source}
        </p>
      </div>

      <div className="bg-surface-secondary p-4 rounded-lg mb-4">
        <p className="text-sm">{spell.description}</p>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Add to My Pack
        </button>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        🔒 Read-only content from another pack
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] `ContentBrowser` page renders with filter sidebar + result grid
- [ ] Read-only mode indicator displays (🔒)
- [ ] `ActiveFilterChips` shows active filters, removable
- [ ] `ContentCard` displays spell info + "Add to My Pack" dropdown
- [ ] `DetailDrawer` opens when clicking a card (read-only view)
- [ ] Browse page sidebar auto-collapses to 64px
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Proceed to **Task M** (Import/Export UI) after this task completes.
