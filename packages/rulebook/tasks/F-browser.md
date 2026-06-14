# Task F: ContentBrowser & Search

**Phase**: 1 (MVP, spell-only) / full in Phase 3 | **Priority**: P0 (US-11) | **Depends on**: Task A, Task B, Task C

## Objective

Implement `ContentBrowser` — the headless class for browsing and searching spells across all enabled content packs. Phase 1 scope: spells only. Full multi-type browsing is Phase 3.

## Dependencies

- Task B: `SpellQuery`, `SpellSchool`
- Task C: `ContentPackManager` (listPacks, loadPack, isPackEnabled)
- Core: `Spell` type

## Files to Create

```
packages/rulebook/src/
└── browser/
    ├── index.ts                # barrel export
    └── content-browser.ts      # ContentBrowser class

tests/browser/
└── content-browser.test.ts
```

## ContentBrowser Interface

```typescript
import type { Spell } from 'open20-core';
import type { SpellQuery } from '../types/query';
import type { ContentPackManager } from '../manager/content-pack-manager';

export class ContentBrowser {
  private manager: ContentPackManager;

  constructor(manager: ContentPackManager) {
    this.manager = manager;
  }

  // ── Spell Access ──────────────────────────────────────────

  /**
   * Get all spells across ALL enabled packs.
   * Disabled packs are excluded.
   */
  async getAllSpells(): Promise<Spell[]>;

  /**
   * Get spells from a specific pack (regardless of enabled/disabled state).
   */
  async getSpellsByPack(packId: string): Promise<Spell[]>;

  // ── Search ─────────────────────────────────────────────────

  /**
   * Search spells across all enabled packs.
   *
   * Matching rules:
   * - name: case-insensitive substring match (e.g., "fire" matches "Fireball")
   * - level: exact match (takes precedence over levelRange)
   * - levelRange: level >= min AND level <= max
   * - school: exact enum match
   * - classes: spell.classes intersects with query.classes
   * - source: exact match on spell.source
   *
   * Combine: ALL provided filters must match (AND logic).
   *
   * Sort: by sortBy field (default 'name'), sortOrder (default 'asc').
   */
  searchSpells(query: SpellQuery): Promise<Spell[]>;

  // ── Phase 3 stubs (not implemented) ────────────────────────
  // getAllMonsters(): Promise<Monster[]>;
  // searchMonsters(query: MonsterQuery): Promise<Monster[]>;
  // ... etc.
}
```

## Implementation Details

### getAllSpells()

```
1. Call this.manager.listPacks() → get all pack metadata
2. For each pack:
   a. Skip if !this.manager.isPackEnabled(pack.id)
   b. Call this.manager.loadPack(pack.id)
   c. Extract spells from pack.spells
   d. Append to result array
3. Return result array
```

### getSpellsByPack(packId)

```
1. Call this.manager.loadPack(packId)
2. Return pack.spells || []
3. Return [] if pack not found
```

### searchSpells(query)

```
1. Get all spells via getAllSpells()
2. Apply filters in order (all AND logic):
   a. If query.name → filter: spell.name.toLowerCase().includes(query.name.toLowerCase())
   b. If query.level → filter: spell.level === query.level
       Else if query.levelRange → filter: level >= min AND level <= max
   c. If query.school → filter: spell.school === query.school
   d. If query.classes → filter: spell.classes some class is in query.classes
   e. If query.source → filter: spell.source === query.source
3. Sort by query.sortBy (default 'name'):
   - 'name': localeCompare
   - 'level': numeric
   - 'school': localeCompare
4. Apply sortOrder (default 'asc')
5. Return filtered + sorted array
```

### Performance Note

- Phase 1: loads all packs into memory for search (acceptable for < 1000 spells)
- Phase 3 may add indexed search or pagination for 1000+ spells

## Exports

```typescript
// src/browser/index.ts
export { ContentBrowser } from './content-browser';
```

## Acceptance Criteria

- [ ] `getAllSpells()` returns spells from all enabled packs
- [ ] `getAllSpells()` excludes disabled packs
- [ ] `getSpellsByPack(id)` returns spells for specific pack
- [ ] `getSpellsByPack('nonexistent')` returns `[]`
- [ ] `searchSpells({ name: 'fire' })` returns all spells with 'fire' in name (case-insensitive)
- [ ] `searchSpells({ level: 3 })` returns only level 3 spells
- [ ] `searchSpells({ levelRange: { min: 1, max: 3 } })` returns spells level 1-3
- [ ] `searchSpells({ school: 'Evocation', level: 3 })` applies AND logic
- [ ] `searchSpells({ classes: ['wizard'] })` returns spells available to wizard
- [ ] `searchSpells({ sortBy: 'level', sortOrder: 'desc' })` returns sorted descending
- [ ] `searchSpells({})` (empty query) returns all enabled spells
- [ ] Tests with mock ContentPackManager (or real IndexedDBStorage with test data)
- [ ] `pnpm test` passes

## Key Constraints

- ContentBrowser takes `ContentPackManager` as constructor dependency (DI)
- Search is synchronous on in-memory data after loading
- No UI dependency — purely headless
- All filters use AND logic (not OR)
- Phase 1 only handles `spells` — other types are Phase 3 stubs
