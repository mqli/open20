# Task N: Monsters — Headless + UI

**Phase**: 3 (Extended Content Types)  
**Depends On**: Phase 2 complete (rulebook UI for spells)  
**Estimated Effort**: Large  
**Target Packages**: `@open20/content` + `@open20/rulebook`

---

## Objective

Complete Monster support across both packages. `MonsterSchema` and `getMonsterTemplate()` already exist — this task implements the remaining headless CRUD, validator integration, import/export, and the full UI (PackDetail tab, Simple/Advanced dual-mode editor, ContentBrowser filters).

---

## Prerequisites

- [ ] Phase 2 complete (`@open20/rulebook` v0.1.0 with spell UI)
- [ ] `MonsterSchema` exists in `src/validator/schemas.ts` (✅ already done)
- [ ] `getMonsterTemplate()` exists in `src/templates/monster-template.ts` (✅ already done)
- [ ] `MonsterSchema` is registered in `ContentTypeRegistry` (✅ already done)

---

## Part A: Headless (`@open20/content`)

### A1. Export MonsterSchema from Validator

Update `src/validator/index.ts`:

```typescript
export { SpellSchema, MonsterSchema } from './schemas';
export { ContentValidator } from './content-validator';
export type { ValidationError, ValidationResult, ValidationReport } from './content-validator';
```

### A2. Add `validateMonster()` to ContentValidator

Update `src/validator/content-validator.ts`:

- Add `validateMonster(monster: unknown): ValidationResult` — same pattern as `validateSpell()`
- Extend `validatePack()` to iterate `pack.monsters` and produce `results['monsters']`

### A3. Add Monster Template Export

Update `src/templates/index.ts`:

```typescript
export { getSpellTemplate } from './spell-template';
export { getMonsterTemplate } from './monster-template';
```

### A4. Add Monster CRUD Methods to ContentEditor

Update `src/editor/content-editor.ts`:

Follow the exact same pattern as Spell methods:

```typescript
// ── Monster CRUD ──────────────────────────────────────────

addMonster(monster: Monster): void;
updateMonster(monsterId: string, updates: Partial<Monster>): void;
removeMonster(monsterId: string): void;
duplicateMonster(monsterId: string): Monster;
getMonster(monsterId: string): Monster | undefined;
listMonsters(): Monster[];
```

**Implementation notes**:

- Each mutating method must call `snapshotBeforeOperation()` and include `monsters` in the snapshot
- The undo `snapshotBeforeOperation()` must be extended to capture `pack.monsters` alongside `pack.spells` and `pack.meta`
- `addMonster`: init `this.pack.monsters = []` if undefined, push with deep clone
- `updateMonster`: find by ID, merge updates (deep clone + Object.assign), replace in array
- `removeMonster`: find index, splice
- `duplicateMonster`: deep clone, set id to `original.id + '-copy'`, push
- `getMonster` / `listMonsters`: read-only accessors

**Snapshot extension**: The current `snapshotBeforeOperation` only captures `spells` and `meta`. Extend it to also snapshot `monsters`:

```typescript
private snapshotBeforeOperation(description: string): void {
  const snapshotObj: Record<string, unknown> = { meta: this.pack.meta };
  for (const key of ['spells', 'monsters'] as const) {
    if (this.pack[key] !== undefined) {
      snapshotObj[key] = this.pack[key];
    } else {
      snapshotObj[key] = null;
    }
  }
  // ... rest unchanged
}
```

Similarly, update `undo()` to restore `monsters`.

### A5. Extend Import/Export for Monsters

Update `src/io/export.ts`:

- When stripping runtime state, ensure `monsters` array is preserved (it's a standard `ContentPack` field)
- Add `exportMonsters(packId: string): Promise<string>` — export only monsters

Update `src/io/import.ts` and `src/io/conflict.ts`:

- Ensure conflict detection iterates `pack.monsters` alongside `pack.spells`
- `ConflictEntry.contentType` should support `'monsters'`
- Import resolution needs `importWithResolutions()` to handle both `spells` and `monsters` arrays

### A6. Add Monster Support to ContentBrowser

Update `src/browser/content-browser.ts`:

- Add `getAllMonsters(): Monster[]` — aggregates from all enabled packs
- Add `getMonstersByPack(packId: string): Monster[]`
- Add `searchMonsters(query: MonsterQuery): Monster[]`

Define `MonsterQuery` in `src/types/query.ts`:

```typescript
export interface MonsterQuery {
  name?: string; // fuzzy match
  type?: string; // exact match (e.g. 'Dragon', 'Humanoid')
  cr?: number; // exact challenge rating
  crRange?: { min: number; max: number };
  source?: string;
  sortBy?: 'name' | 'cr' | 'type';
  sortOrder?: 'asc' | 'desc';
}
```

### A7. Tests

Create `tests/editor/content-editor-monster.test.ts`:

- [ ] `addMonster()` adds monster to pack; `listMonsters()` returns it
- [ ] `updateMonster()` partially updates existing monster
- [ ] `removeMonster()` removes monster; throws if not found
- [ ] `duplicateMonster()` returns new monster with `{id}-copy`
- [ ] Undo restores monsters state correctly
- [ ] Snapshot captures both spells and monsters independently

Add monster validation tests to `tests/validator/content-validator.test.ts`:

- [ ] `validateMonster(validMonster)` returns `{ valid: true }`
- [ ] `validateMonster({ id: '' })` returns errors for required fields
- [ ] `validatePack()` includes monsters results

---

## Part B: UI (`@open20/rulebook`)

### B1. Add Monsters Tab to PackDetail

Update `src/pages/PackDetail.tsx`:

- Add a `Monsters` tab alongside the existing `All` and `Spells` tabs
- Show `ContentTable` with monster columns: Type, Name, CR, Size, Type, Source
- Tab badge shows monster count from `packDetailStore`
- Empty state when 0 monsters: "👹 No monsters yet" with [+ Add Monster]

### B2. Create Monster Editor Form

Create `src/pages/MonsterEditor.tsx` or extend `ContentEditor.tsx`:

The Monster editor requires **Simple/Advanced dual mode** (per DESIGN §3.4a):

**Simple Mode** (default for new monsters):

- Name, Type+Size, CR, Alignment
- HP, AC, Speed
- Core Attacks (add/remove rows)
- Bottom CTA: `[Switch to Advanced Mode →]`

**Advanced Mode** (toggle):

- All Simple fields plus tabs:
  - **Combat**: Ability Scores, Saving Throws, Skills
  - **Actions**: Full action editor (name, toHit, damage entries, limited usage)
  - **Spellcasting**: Ability, save DC, at-will/daily spells
  - **Legendary**: Legendary actions (name, description, cost)
  - **Senses & Defenses**: Darkvision, resistances, immunities, vulnerabilities

**Data migration between modes** (per DESIGN §3.4a):

- Simple → Advanced: Parse free-text fields (HP "546 (23d20+299)" → hp=546, hitDice="23d20+299")
- Advanced → Simple: Merge structured fields back to free-text format
- Never lose data on switch; show hint tips for unresolvable fields

**Save buttons**: [Save] [Save & New] [Save & Close] — same pattern as spell editor

Preview: Use `MonsterCard` from `@open20/ui` (if available) or create a simple preview

### B3. Add Monsters Filter to ContentBrowser

Update `src/pages/ContentBrowser.tsx` or its filter components:

- Add Monster type filter (if user selects "Monsters" tab)
- Monster-specific filters: Type (dropdown), CR (range), Source (checkbox)
- Active filter chips for monster filters

### B4. Add Monster Support to Stores

Update `src/stores/packDetailStore.ts`:

- Import `monsters` from loaded pack
- Track `monsters` count per pack
- Add `loadMonsters(packId: string)` action

Update `src/stores/browserStore.ts`:

- Call `browser.getAllMonsters()` when loading monsters
- Apply MonsterQuery filters in search

### B5. Tests

Create `src/pages/MonsterEditor.test.tsx`:

- [ ] Simple mode renders quick setup fields
- [ ] Switch to Advanced mode shows all tabs
- [ ] Data preserved when switching modes
- [ ] Save creates monster in pack
- [ ] Save & New clears form while keeping same type

Update `PackDetail.test.tsx`:

- [ ] Monsters tab shows when monsters exist
- [ ] Empty state when 0 monsters

Update `ContentBrowser.test.tsx`:

- [ ] Monster filters render correctly
- [ ] Filter chips work for monster type/CR

---

## Acceptance Criteria

### Headless

- [ ] `MonsterSchema` exported from `@open20/content/validator`
- [ ] `ContentEditor.addMonster/updateMonster/removeMonster/duplicateMonster` all work
- [ ] `ContentValidator.validateMonster()` returns correct results
- [ ] `ContentValidator.validatePack()` validates monsters alongside spells
- [ ] Undo correctly restores monsters (independently of spells)
- [ ] Import/export handles monsters arrays
- [ ] ContentBrowser.getAllMonsters() and searchMonsters() work
- [ ] All tests pass

### UI

- [ ] Monsters tab shown in PackDetail with correct columns
- [ ] Simple mode editor renders and can create a monster
- [ ] Advanced mode shows all tabs (Combat, Actions, Spellcasting, Legendary, Senses)
- [ ] Mode switching preserves data
- [ ] ContentBrowser filters by monster type/CR/source
- [ ] TypeScript compiles with no errors
- [ ] All tests pass

---

## Next Task

Proceed to **Task O** (Species, Backgrounds, Feats) or **Task Q** (Classes, Subclasses) or **Task R** (Glossary) after this task completes.
