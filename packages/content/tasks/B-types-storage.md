# Task B: Data Types & Storage Layer

**Phase**: 1 (MVP) | **Priority**: P0 | **Depends on**: Task A (scaffold)

## Objective

Define all shared types (`EditableContentPack`, `ContentTypeId`, `ContentTypeRegistry`, `EditState`) and implement the abstract `IStorage` interface + `IndexedDBStorage`.

## Dependencies

- Task A: package must exist with `open20-core` linked

## Files to Create

```
packages/content/src/
├── types/
│   ├── index.ts              # barrel export
│   ├── content-pack.ts       # EditableContentPack
│   ├── registry.ts           # ContentTypeId, ContentTypeDescriptor, contentTypes[]
│   ├── edit-state.ts         # EditState, UndoEntry
│   └── query.ts              # SpellQuery, SpellSchool
└── storage/
    ├── index.ts              # barrel export
    ├── istorage.ts           # IStorage interface
    └── indexeddb-storage.ts  # IndexedDBStorage implementation
```

tests/
├── types/
│ └── registry.test.ts
└── storage/
└── indexeddb-storage.test.ts

## 1. EditableContentPack (`src/types/content-pack.ts`)

```typescript
import { ContentPack as CoreContentPack, ContentPackMeta } from 'open20-core';

/**
 * Rulebook's editable content pack type.
 * Extends core's ContentPack with additional meta fields.
 * Runtime edit state is NOT stored here — see EditState.
 */
export interface EditableContentPack extends CoreContentPack {
  meta: ContentPackMeta & {
    description?: string;
    homepage?: string;
    dependencies?: string[]; // IDs of other content packs this depends on
  };
}
```

**Constraint — Export stripping**: When `exportPack()` serializes, it MUST strip `description`, `homepage`, and `dependencies` from meta, outputting only core's `ContentPackMeta` standard fields (`id`, `name`, `version`, `source`, `author`, `priority`). This is implemented in Task E.

## 2. ContentTypeRegistry (`src/types/registry.ts`)

```typescript
import type { ZodSchema } from 'zod';

export type ContentTypeId =
  | 'species'
  | 'backgrounds'
  | 'classes'
  | 'subclasses'
  | 'feats'
  | 'spells'
  | 'weapons'
  | 'armors'
  | 'gears'
  | 'monsters'
  | 'glossary';

export interface ContentTypeDescriptor {
  id: ContentTypeId;
  name: string; // Display name (e.g., 'Spells')
  schema: ZodSchema; // Zod validation schema (defined by rulebook)
  template: () => unknown; // Factory function for empty template
}

// Phase 1: Only Spell is registered. Other 10 are commented out for Phase 2.
export const contentTypes: ContentTypeDescriptor[] = [
  // Fill in Task D after SpellSchema is created:
  // { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
];
```

## 3. EditState (`src/types/edit-state.ts`)

```typescript
/** Single undo entry — snapshot before an operation */
export interface UndoEntry {
  /** Serialized JSON snapshot of the pack before the operation */
  snapshot: string;
  /** Human-readable description (e.g., "Added spell Fireball") */
  description: string;
  /** Timestamp when the operation occurred */
  timestamp: string;
}

/**
 * Runtime edit state — NEVER serialized to export JSON.
 * Maintained internally by ContentEditor (Task D).
 */
export interface EditState {
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  undoStack: UndoEntry[];
}
```

## 4. SpellQuery (`src/types/query.ts`)

```typescript
export type SpellSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';

export interface SpellQuery {
  name?: string; // Case-insensitive substring match
  level?: number; // Exact match (0-9). Mutually exclusive with levelRange.
  levelRange?: { min: number; max: number };
  school?: SpellSchool; // Exact match
  classes?: string[]; // Spell's classes array intersects with this
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'level' | 'school';
  sortOrder?: 'asc' | 'desc';
}
```

## 5. IStorage Interface (`src/storage/istorage.ts`)

```typescript
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';

export interface IStorage {
  savePack(pack: EditableContentPack): Promise<void>;
  loadPack(packId: string): Promise<EditableContentPack | null>;
  listPacks(): Promise<ContentPackMeta[]>;
  deletePack(packId: string): Promise<void>;
}
```

## 6. IndexedDBStorage (`src/storage/indexeddb-storage.ts`)

```typescript
import type { IStorage } from './istorage';
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';

/**
 * Browser IndexedDB implementation of IStorage.
 *
 * Database: 'rulebook'
 * Object store: 'content-packs' (keyPath: 'meta.id')
 *
 * IndexedDB capacity: typically 50MB+ (browser-dependent).
 * Content pack size estimate: 10KB–500KB (JSON).
 */
export class IndexedDBStorage implements IStorage {
  private dbName = 'rulebook';
  private storeName = 'content-packs';
  private dbVersion = 1;

  constructor() {
    /* Open/create IndexedDB database on construction */
  }

  async savePack(pack: EditableContentPack): Promise<void> {
    /* ... */
  }
  async loadPack(packId: string): Promise<EditableContentPack | null> {
    /* ... */
  }
  async listPacks(): Promise<ContentPackMeta[]> {
    /* ... */
  }
  async deletePack(packId: string): Promise<void> {
    /* ... */
  }
}
```

Implementation notes:

- DB name: `'rulebook'`, store name: `'content-packs'`, keyPath: `'meta.id'`
- `listPacks()`: return only `ContentPackMeta` (not full pack) for efficiency
- All methods must handle IndexedDB errors (transaction abort, quota exceeded) and throw descriptive errors

## Exports (`src/types/index.ts`)

```typescript
export type { EditableContentPack } from './content-pack';
export type { ContentTypeId, ContentTypeDescriptor } from './registry';
export { contentTypes } from './registry';
export type { EditState, UndoEntry } from './edit-state';
export type { SpellQuery, SpellSchool } from './query';
```

## Acceptance Criteria

- [ ] `EditableContentPack` extends core's `ContentPack` with extended meta fields
- [ ] `ContentTypeId` union has all 11 types (listed above)
- [ ] `EditState` has `createdAt`, `updatedAt`, `schemaVersion`, `undoStack`
- [ ] `SpellQuery` has all fields: name, level, levelRange, school, classes, source, sortBy, sortOrder
- [ ] `IStorage` has 4 methods: savePack, loadPack, listPacks, deletePack
- [ ] `IndexedDBStorage` implements `IStorage` with real IndexedDB (test with fake-indexeddb or jsdom)
- [ ] Tests: store → load a pack round-trip; list returns only meta; delete removes data; null on missing pack
- [ ] `pnpm typecheck` and `pnpm lint` pass for all new files

## Key Constraints

- `EditState` is NEVER included in exported JSON (enforced in Task E)
- `EditableContentPack` extends but does NOT modify core's `ContentPack` fields
- IndexedDB keyPath is `meta.id` (pack ID is the primary key)
- All new types use `import type` for open20-core imports (no runtime import)
