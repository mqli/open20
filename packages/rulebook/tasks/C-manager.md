# Task C: ContentPackManager

**Phase**: 1 (MVP) | **Priority**: P0 | **Depends on**: Task A, Task B

## Objective

Implement `ContentPackManager` — the headless class for content pack CRUD operations. It wraps `IStorage` and provides the API for creating, loading, saving, listing, enabling/disabling, and deleting content packs.

## Dependencies

- Task B: `EditableContentPack`, `IStorage`, `IndexedDBStorage`

## Files to Create

```
packages/rulebook/src/manager/
├── index.ts                      # barrel export
└── content-pack-manager.ts       # ContentPackManager class

tests/manager/
└── content-pack-manager.test.ts
```

## ContentPackManager Interface

```typescript
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';
import type { IStorage } from '../storage/istorage';
import { IndexedDBStorage } from '../storage/indexeddb-storage';

export class ContentPackManager {
  private storage: IStorage;
  private packs: Map<string, EditableContentPack>; // in-memory cache
  private disabledPacks: Set<string>; // disabled pack IDs

  constructor(storage?: IStorage) {
    this.storage = storage ?? new IndexedDBStorage();
    this.packs = new Map();
    this.disabledPacks = new Set();
  }

  /**
   * Create a new content pack in memory.
   * Does NOT persist — call savePack() to store.
   * Initializes all 11 content type arrays as empty [].
   */
  createPack(meta: ContentPackMeta): EditableContentPack;

  /**
   * Load a pack from storage by ID.
   * Returns null if not found.
   * Also loads into in-memory cache.
   */
  async loadPack(packId: string): Promise<EditableContentPack | null>;

  /**
   * Persist a pack to storage and update in-memory cache.
   */
  async savePack(pack: EditableContentPack): Promise<void>;

  /**
   * List metadata of all known packs.
   * Reads from storage (not just cache).
   */
  async listPacks(): Promise<ContentPackMeta[]>;

  /**
   * Enable a pack (mark as active for ContentBrowser queries).
   */
  enablePack(id: string): void;

  /**
   * Disable a pack (exclude from ContentBrowser queries, but keep in storage).
   */
  disablePack(id: string): void;

  /**
   * Check if a pack is currently enabled.
   */
  isPackEnabled(id: string): boolean;

  /**
   * Permanently delete a pack from storage and cache.
   * Throws if pack has unsaved changes? No — just delete.
   */
  async deletePack(id: string): Promise<void>;
}
```

## Implementation Details

### createPack()

- Accepts `ContentPackMeta` (from core: `id`, `name`, `version`, `source`, plus optional `author`, `url`, `priority`)
- Initializes all 11 content arrays to `[]` (spells, monsters, species, etc.)
- Returns `EditableContentPack` (mutable, in memory)
- Does NOT persist to storage

### loadPack(packId)

- Calls `this.storage.loadPack(packId)`
- On success: stores in `this.packs` cache, returns pack
- On null: returns null
- Never throws for "not found"

### savePack(pack)

- Calls `this.storage.savePack(pack)`
- Updates `this.packs` cache
- Throws on storage error

### listPacks()

- Calls `this.storage.listPacks()`
- Returns array (may be empty, not null)

### enablePack / disablePack / isPackEnabled

- `enablePack(id)`: removes from `disabledPacks` set
- `disablePack(id)`: adds to `disabledPacks` set
- `isPackEnabled(id)`: returns `!disabledPacks.has(id)`
- Packs default to ENABLED when created/loaded (not in disabled set)

### deletePack(id)

- Calls `this.storage.deletePack(id)`
- Removes from `this.packs` cache
- Removes from `this.disabledPacks`
- Throws on storage error

## Exports

```typescript
// src/manager/index.ts
export { ContentPackManager } from './content-pack-manager';
```

## Acceptance Criteria

- [x] `createPack(meta)` returns `EditableContentPack` with all 10 arrays initialized to `[]` (note: `glossary` is not an array, it's a `RulesGlossary` object)
- [x] `savePack(pack)` persists to IndexedDB and updates cache
- [x] `loadPack(id)` returns pack from storage or null
- [x] `loadPack(id)` retrieves correct data after `savePack` (round-trip)
- [x] `listPacks()` returns `ContentPackMeta[]` from storage
- [x] `enablePack/disablePack/isPackEnabled` correctly tracks state
- [x] `deletePack(id)` removes from storage and cache
- [x] Tests: create → save → load → verify; save → list → verify; disable → isPackEnabled=false
- [x] `pnpm test` passes for manager module

## Key Constraints

- `ContentPackManager` accepts optional `IStorage` injection (constructor) — default is `IndexedDBStorage`
- Methods that touch storage are `async`; in-memory operations may be sync
- `listPacks()` returns core's `ContentPackMeta` (not extended meta with `description` etc.)
- All storage errors propagate as thrown errors (no silent failure)
