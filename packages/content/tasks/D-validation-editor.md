# Task D: Validation Engine & ContentEditor (Spell)

**Phase**: 1 (MVP) | **Priority**: P0 | **Depends on**: Task A, Task B

## Objective

Define `SpellSchema` (Zod), implement `ContentValidator`, and implement `ContentEditor` for spells (add, edit, delete, duplicate, undo).

## Dependencies

- Task B: `EditableContentPack`, `ContentTypeId`, `EditState`, `UndoEntry`
- Core: `Spell` type from `open20-core/types/spell`

## Files to Create

```
packages/content/src/
├── validator/
│   ├── index.ts              # barrel export
│   ├── schemas.ts            # SpellSchema (Zod)
│   └── content-validator.ts  # ContentValidator
├── editor/
│   ├── index.ts              # barrel export
│   └── content-editor.ts     # ContentEditor class
└── templates/
    ├── index.ts              # barrel export
    └── spell-template.ts     # getSpellTemplate()

tests/
├── validator/
│   └── content-validator.test.ts
└── editor/
    └── content-editor.test.ts
```

## 1. SpellSchema (`src/validator/schemas.ts`)

Define Zod schema for validating Spell data. Must validate data that matches core's `Spell` interface.

```typescript
import { z } from 'zod';

const SpellSchoolSchema = z.enum([
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
]);

const SpellLevelSchema = z.number().int().min(0).max(9);

export const SpellSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    level: SpellLevelSchema,
    school: SpellSchoolSchema,
    castingTime: z.string().min(1),
    range: z.string().min(1),
    components: z.array(z.enum(['V', 'S', 'M'])).min(1),
    duration: z.string().min(1),
    concentration: z.boolean(),
    ritual: z.boolean(),
    description: z.array(z.string()).min(1),
    source: z.string().min(1),
    classes: z.array(z.string()).optional(),
    cantripUpgrade: z
      .array(
        z.object({
          atCharacterLevel: z.union([z.literal(5), z.literal(11), z.literal(17)]),
          damage: z
            .array(
              z.object({
                dice: z.string(),
                type: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    usingAHigherLevelSpellSlot: z.array(z.string()).optional(),
    damage: z
      .object({
        entries: z.array(z.object({ dice: z.string(), type: z.string() })),
        additional: z.array(z.object({ dice: z.string(), type: z.string() })).optional(),
        perSlot: z.array(z.object({ dice: z.string(), type: z.string() })).optional(),
        includeSpellcastingModifier: z.boolean().optional(),
      })
      .optional(),
    heal: z
      .object({
        dice: z.string(),
        perSlot: z.string().optional(),
        includeSpellcastingModifier: z.boolean().optional(),
      })
      .optional(),
    save: z.string().optional(),
    attack: z.boolean().optional(),
  })
  .strict();
```

> **Note**: This schema mirrors core's `Spell` interface. If core adds new optional fields in the future, they'll need to be added here. The `.strict()` mode rejects unknown fields.

## 2. ContentValidator (`src/validator/content-validator.ts`)

```typescript
import type { Spell } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';

export interface ValidationError {
  path: string; // e.g., "spells[0].level"
  message: string; // Human-readable error
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationReport {
  valid: boolean;
  results: Record<string, ValidationResult>; // keyed by content type
}

export class ContentValidator {
  /**
   * Validate a single spell against SpellSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateSpell(spell: unknown): ValidationResult;

  /**
   * (Phase 2 stub — not implemented in Phase 1)
   */
  // validateMonster(monster: unknown): ValidationResult;

  /**
   * Batch-validate an entire content pack.
   * Validates spells array. Returns ValidationReport with per-type results.
   */
  validatePack(pack: EditableContentPack): ValidationReport;
}
```

Implementation:

- `validateSpell`: calls `SpellSchema.safeParse(spell)`, maps Zod errors to `ValidationError[]`
- `validatePack`: iterates `pack.spells` (if present), validates each, returns aggregate `ValidationReport`
- Zod error mapping: `issue.path.join('.')` → path, `issue.message` → message

## 3. Spell Template (`src/templates/spell-template.ts`)

```typescript
import type { Spell } from 'open20-core';

/**
 * Returns an empty Spell template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new spells.
 */
export function getSpellTemplate(): Spell {
  return {
    id: '', // User must fill
    name: '', // User must fill
    level: 0, // Default: Cantrip
    school: 'Evocation',
    castingTime: '1 action',
    range: '',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: [''],
    source: '', // Fill from pack's meta.source when adding
  };
}
```

## 4. ContentEditor (`src/editor/content-editor.ts`)

```typescript
import type { Spell } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { EditState } from '../types/edit-state';

export class ContentEditor {
  readonly pack: EditableContentPack;
  private editState: EditState;

  constructor(pack: EditableContentPack) {
    this.pack = pack;
    this.editState = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      undoStack: [],
    };
  }

  // ── Spell CRUD ────────────────────────────────────────────

  /** Add a spell to the pack. Creates spells array if needed. */
  addSpell(spell: Spell): void;

  /** Update existing spell by ID. Partial update. Throws if not found. */
  updateSpell(spellId: string, updates: Partial<Spell>): void;

  /** Remove a spell by ID. Throws if not found. */
  removeSpell(spellId: string): void;

  /** Duplicate a spell with new ID (originalId + '-copy' suffix). */
  duplicateSpell(spellId: string): Spell;

  /** Get a spell by ID. Returns undefined if not found. */
  getSpell(spellId: string): Spell | undefined;

  /** List all spells in the pack. */
  listSpells(): Spell[];

  // ── Undo ───────────────────────────────────────────────────

  /** Undo the last operation. Restores pack to prior snapshot. */
  undo(): void;

  /** Whether there is an undo operation available. */
  get canUndo(): boolean;

  // ── Private helpers ────────────────────────────────────────

  /** Snapshot the pack state before a mutation (for undo). */
  private snapshotBeforeOperation(description: string): void;
}
```

### Implementation Details

**addSpell()**:

- Call `snapshotBeforeOperation("Added spell {name}")` first
- Init `this.pack.spells = []` if undefined
- Push spell to array
- Update `editState.updatedAt`

**updateSpell()**:

- Call `snapshotBeforeOperation("Updated spell {spellId}")` first
- Find spell by ID in array; throw if not found
- Merge `updates` into found spell (shallow merge per field)
- Update `editState.updatedAt`

**removeSpell()**:

- Call `snapshotBeforeOperation("Removed spell {spellId}")` first
- Find index; throw if not found
- Splice out of array
- Update `editState.updatedAt`

**duplicateSpell()**:

- Call `snapshotBeforeOperation("Duplicated spell {spellId}")` first
- Find original; throw if not found
- Deep-clone, assign `id = original.id + '-copy'`
- Push to array, return new spell

**undo()**:

- Pop latest `UndoEntry` from `editState.undoStack`
- Parse `entry.snapshot` (JSON) → restore `this.pack` fields
- Throws/logs warning if stack is empty

**snapshotBeforeOperation()**:

- `JSON.stringify(this.pack)` → push to `undoStack` with description + timestamp
- Phase 1: keep only 1 entry (pop oldest if > 1) — single-step undo

## Exports

```typescript
// src/validator/index.ts
export { SpellSchema } from './schemas';
export { ContentValidator } from './content-validator';
export type { ValidationError, ValidationResult, ValidationReport } from './content-validator';

// src/editor/index.ts
export { ContentEditor } from './content-editor';

// src/templates/index.ts
export { getSpellTemplate } from './spell-template';
```

## Wire into ContentTypeRegistry

After `SpellSchema` and `getSpellTemplate` exist, update `src/types/registry.ts`:

```typescript
import { SpellSchema } from '../validator/schemas';
import { getSpellTemplate } from '../templates/spell-template';

export const contentTypes: ContentTypeDescriptor[] = [
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
];
```

## Acceptance Criteria

- [ ] `SpellSchema.safeParse(validSpell)` returns `{ success: true }`
- [ ] `SpellSchema.safeParse({ id: '' })` returns Zod error for `id` + `name` + other required fields
- [ ] `SpellSchema.safeParse({ ...validSpell, extraField: 1 })` rejects unknown fields (strict mode)
- [ ] `validateSpell()` maps Zod errors to `ValidationError[]` with correct paths
- [ ] `validatePack()` returns `ValidationReport` with per-type results
- [ ] `addSpell()` adds spell to pack; `listSpells()` returns it
- [ ] `updateSpell()` partially updates existing spell; throws if not found
- [ ] `removeSpell()` removes spell; throws if not found
- [ ] `duplicateSpell()` returns new spell with `{id}-copy`, already in pack
- [ ] `undo()` restores pack to state before last mutation
- [ ] `canUndo` is false initially, true after mutation, false after undo
- [ ] Only 1 undo step kept (oldest discarded when > 1)
- [ ] `getSpellTemplate()` returns Spell with empty id/name/source
- [ ] Tests cover: valid spell, invalid spell, unknown field, add/edit/remove/duplicate/undo
- [ ] `pnpm test` passes

## Key Constraints

- SpellSchema uses `.strict()` — rejects unknown fields
- `ContentEditor` constructor takes `EditableContentPack` — does NOT take packId
- All mutating methods snapshot before change (for undo)
- Undo is single-step only in Phase 1
- SpellSchema must match core's `Spell` interface structure
