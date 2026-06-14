# Task E: Import/Export & Conflict Resolution

**Phase**: 1 (MVP) | **Priority**: P0 | **Depends on**: Task A, Task B, Task C, Task D

## Objective

Implement JSON export (with runtime state stripping) and JSON import (with conflict detection and resolution). Also implement `mergePack` for cross-pack content merging.

## Dependencies

- Task B: `EditableContentPack`, `EditState`, `ContentTypeId`, `IStorage`
- Task C: `ContentPackManager` (loadPack, savePack)
- Task D: `SpellSchema`, `ContentValidator`
- Core: `ContentPack`, `ContentPackMeta` types

## Files to Create

```
packages/content/src/io/
├── index.ts           # barrel export
├── export.ts          # exportPack, exportPackToJson
├── import.ts          # importPack, importPackFromJson, mergePack
└── conflict.ts        # conflict detection & resolution types + functions

tests/io/
├── export.test.ts
├── import.test.ts
└── conflict.test.ts
```

## 1. Export (`src/io/export.ts`)

```typescript
import type { EditableContentPack } from '../types/content-pack';
import type { EditState } from '../types/edit-state';
import type { ContentPack, ContentPackMeta } from 'open20-core';

/**
 * Export an EditableContentPack to a clean ContentPack JSON string.
 *
 * STRIPPING RULES (critical — do NOT include in output):
 * - meta.description, meta.homepage, meta.dependencies → DELETED
 * - EditState (createdAt, updatedAt, undoStack, schemaVersion) → NOT INCLUDED
 * - Any non-core fields → DELETED
 *
 * Output must be valid input for open20-core's importContentPack().
 */
export function exportPack(pack: EditableContentPack, editState?: EditState): string;
```

Implementation:

```typescript
export function exportPack(pack: EditableContentPack, _editState?: EditState): string {
  const { meta, ...content } = pack;

  // Strip extended meta fields — keep only core ContentPackMeta fields
  const cleanMeta: ContentPackMeta = {
    id: meta.id,
    name: meta.name,
    version: meta.version,
    source: meta.source,
    author: meta.author,
    priority: meta.priority,
    url: meta.url,
  };

  const cleanPack: ContentPack = {
    meta: cleanMeta,
    ...content, // spells, monsters, species, etc. (as-is from core)
  };

  return JSON.stringify(cleanPack, null, 2);
}
```

Key: `exportPackToJson` is an alias for `exportPack` that returns the same string.

## 2. Import (`src/io/import.ts`)

```typescript
import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackManager } from '../manager/content-pack-manager';

/**
 * Import from a JSON string. Validates spells against SpellSchema.
 * Returns a new EditableContentPack (NOT persisted yet).
 * Throws ValidationError on invalid content.
 */
export function importPack(json: string): EditableContentPack;

/**
 * Merge source content pack into target pack.
 * Core content arrays are concatenated. Does NOT deduplicate.
 * Caller must use conflict-check functions first.
 */
export function mergePack(target: EditableContentPack, source: ContentPack): void;

/**
 * Deserialize JSON string to ContentPack (core type).
 * Validates the outer structure (meta required, content arrays).
 */
export function parsePackJson(json: string): ContentPack;
```

Implementation notes:

1. `parsePackJson`: `JSON.parse`, verify `meta` exists and has `id`, return as `ContentPack`
2. `importPack`: calls `parsePackJson`, validates spells via `ContentValidator.validateSpell`, wraps in `EditableContentPack`, returns
3. `mergePack`: concatenates each content array (`pack.spells = [...(pack.spells || []), ...(source.spells || [])]` etc.)

## 3. Conflict Detection (`src/io/conflict.ts`)

```typescript
import type { ContentPack } from 'open20-core';
import type { ContentTypeId } from '../types/registry';

export type ConflictType = 'same-id' | 'same-name-different-id';

export interface ConflictEntry {
  type: ConflictType;
  contentType: ContentTypeId;
  existingId: string;
  existingName: string;
  incomingId: string;
  incomingName: string;
}

export type ConflictResolution =
  | { strategy: 'keep-both'; newId: string }
  | { strategy: 'replace'; targetId: string }
  | { strategy: 'skip' };

export interface ImportResult {
  imported: number;
  skipped: number;
  replaced: number;
  conflicts: ConflictEntry[];
}

/**
 * Pre-check: detect conflicts between a source pack and target pack
 * WITHOUT performing the actual import.
 */
export function checkImportConflicts(
  sourcePack: ContentPack,
  targetPack: EditableContentPack,
): ConflictEntry[];

/**
 * Execute import with resolution strategies.
 * resolutions key format: `${contentType}:${incomingId}`
 */
export function importWithResolutions(
  sourcePack: ContentPack,
  targetPack: EditableContentPack,
  resolutions: Map<string, ConflictResolution>,
): ImportResult;
```

### Implementation Details

**checkImportConflicts()**:

- Iterate each content type array in `sourcePack`
- For each item, check `targetPack`:
  - **same-id**: matching `id` → `ConflictType: 'same-id'`
  - **same-name-different-id**: matching `name` but different `id` → `ConflictType: 'same-name-different-id'`
- For Phase 1: only check `spells` array
- Return array of `ConflictEntry`

**importWithResolutions()**:

- Call `checkImportConflicts()` first
- For each source item:
  - If no resolution entry → import as new (no conflict)
  - If `keep-both` → assign `newId`, add item
  - If `replace` → find and replace existing item by `targetId`
  - If `skip` → skip
- Return `ImportResult` with counts

## Exports

```typescript
// src/io/index.ts
export { exportPack, exportPackToJson } from './export';
export { importPack, importPackFromJson, mergePack, parsePackJson } from './import';
export { checkImportConflicts, importWithResolutions } from './conflict';
export type { ConflictType, ConflictEntry, ConflictResolution, ImportResult } from './conflict';
```

## Acceptance Criteria

- [ ] `exportPack(pack)` produces valid JSON with only core `ContentPackMeta` fields in meta
- [ ] `exportPack(pack)` output can be parsed by `importContentPack()` from open20-core (integration test)
- [ ] `exportPack(pack)` does NOT contain `description`, `homepage`, `dependencies` in meta
- [ ] `exportPack(pack)` does NOT contain `_meta`, `editState`, `undoStack` anywhere
- [ ] `importPack(json)` returns `EditableContentPack` with spells array
- [ ] `importPack(json)` validates spells against SpellSchema, throws on invalid
- [ ] `mergePack()` concatenates content arrays correctly
- [ ] `checkImportConflicts()` detects `same-id` conflicts
- [ ] `checkImportConflicts()` detects `same-name-different-id` conflicts
- [ ] `importWithResolutions({ keep-both })` adds with new ID
- [ ] `importWithResolutions({ replace })` replaces existing entry
- [ ] `importWithResolutions({ skip })` does not add entry
- [ ] `ImportResult` has correct counts
- [ ] Tests: export→re-import round-trip; conflict detection; resolution strategies; invalid JSON handling

## Key Constraints

- Export MUST strip all rulebook-specific metadata (G3: core compatibility)
- Import should NEVER mutate existing content without explicit resolution
- `mergePack` is an optional convenience, not used in import flow with conflict UI
