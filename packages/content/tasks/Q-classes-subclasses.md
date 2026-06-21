# Task Q: Classes, Subclasses — Headless + UI

**Phase**: 3 (Extended Content Types)  
**Depends On**: Task N (Monsters)  
**Estimated Effort**: Large  
**Target Packages**: `@open20/content` + `@open20/rulebook`  
**Content Types**: Classes, Subclasses (2 types, high complexity)

---

## Objective

Add Classes and Subclasses — two of the most complex content types. Classes define the core class progression (hit dice, proficiencies, spellcasting, features at each level), while Subclasses extend classes with specialized features. These types share a close relationship (a Subclass belongs to a Class).

---

## Prerequisites

- [ ] Task N complete (Monsters headless + UI)
- [ ] Core type definitions: `Class`, `Subclass` from `open20-core`

---

## Files to Create / Modify

### Headless (`@open20/content`)

| File                                 | Action                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `src/validator/schemas.ts`           | Add `ClassSchema`, `SubclassSchema`                                      |
| `src/validator/index.ts`             | Export 2 new schemas                                                     |
| `src/validator/content-validator.ts` | Add `validateClass()`, `validateSubclass()` + `validatePack()` extension |
| `src/templates/class-template.ts`    | New                                                                      |
| `src/templates/subclass-template.ts` | New                                                                      |
| `src/templates/index.ts`             | Export 2 templates                                                       |
| `src/editor/content-editor.ts`       | Add CRUD for 2 types + snapshot extension                                |
| `src/types/registry.ts`              | Register Classes + Subclasses                                            |
| `src/types/query.ts`                 | Add `ClassQuery`, `SubclassQuery`                                        |
| `src/browser/content-browser.ts`     | Add search + filter for 2 types                                          |
| `src/io/export.ts`                   | Handle 2 new arrays                                                      |
| `src/io/import.ts`                   | Handle 2 new arrays                                                      |
| `src/io/conflict.ts`                 | Extend conflict detection                                                |

### UI (`@open20/rulebook`)

| File                            | Action                        |
| ------------------------------- | ----------------------------- |
| `src/pages/PackDetail.tsx`      | Add Classes + Subclasses tabs |
| `src/pages/ClassEditor.tsx`     | New — complex tabbed editor   |
| `src/pages/SubclassEditor.tsx`  | New — complex tabbed editor   |
| `src/pages/ContentBrowser.tsx`  | Add 2 filter sets             |
| `src/stores/packDetailStore.ts` | Track 2 new type counts       |
| `src/stores/browserStore.ts`    | Support 2 new search queries  |

---

## Per-Type Details

### Classes

**Core type**: `Class` from `open20-core`

**Key fields**:

- id, name, source
- hitDice (e.g. 'd8')
- primaryAbility (string array)
- savingThrowProficiencies (string array)
- armorProficiencies, weaponProficiencies, toolProficiencies
- skillChoices (number of choices + available skills list)
- spellcastingAbility (optional — for Bard, Cleric, Druid, etc.)
- classTable: featureName + level + description (array of level-by-level entries)
- subclassesAvailable (array of subclass names that belong to this class)

**Editor form** (high complexity — tabbed layout, similar to Monster Advanced mode):

| Tab           | Content                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| Basic         | Name, ID, Source, Hit Dice, Primary Ability                                       |
| Proficiencies | Armor, Weapons, Tools, Saving Throws, Skills                                      |
| Spellcasting  | Ability, optional: Has Spellcasting toggle + ability dropdown                     |
| Progression   | Class table: add/remove rows per level (level, feature name, feature description) |
| Subclasses    | List of related subclass IDs                                                      |

**ContentBrowser filters**:

- Spellcasting (boolean: has/doesn't have)
- Primary Ability (checkbox: STR/DEX/CON/INT/WIS/CHA)
- Source (checkbox)

### Subclasses

**Core type**: `Subclass` from `open20-core`

**Key fields**:

- id, name, source
- classId (references the parent Class ID)
- description
- features (array of featureName + level + description)
- spellList (optional — for subclasses that grant bonus spells)

**Editor form** (high complexity — tabbed layout):

| Tab         | Content                                                     |
| ----------- | ----------------------------------------------------------- |
| Basic       | Name, ID, Source, Parent Class (dropdown from pack.classes) |
| Description | Rich text description                                       |
| Features    | Add/remove feature entries: name, level gained, description |
| Spells      | Optional: subclass spell list (if applicable)               |

**ContentBrowser filters**:

- Parent Class (dropdown or checkbox)
- Source (checkbox)

---

## Snapshot Extension

Extend tracked arrays to include:

```typescript
const trackedArrays = [
  'spells',
  'monsters',
  'species',
  'backgrounds',
  'feats',
  'weapons',
  'armors',
  'gears',
  'classes',
  'subclasses',
];
```

---

## Special Considerations

### Class-Subclass Relationship

- When editing a Subclass, allow selecting the parent Class from a dropdown populated by `pack.classes`
- When deleting a Class, optionally warn if Subclasses reference it
- No hard foreign key constraint — just UX hints

### Class Progression Table

The class progression editor is the most complex editor in Phase 3. Each row has:

- Level (number, auto-increment)
- Feature Name (text)
- Feature Description (textarea)
- Optional: Proficiency Bonus or spell slots per level

Consider using a `DynamicTableEditor` shared component for the progression table.

---

## Tests

### Headless

- [ ] `ClassSchema` validates all fields including classTable array
- [ ] `SubclassSchema` validates with classId reference
- [ ] Templates return complete objects with empty arrays
- [ ] CRUD methods work for both types
- [ ] Undo correctly restores classes and subclasses
- [ ] Import/export round-trip preserves classTable entries
- [ ] ContentBrowser search supports class-specific fields (hitDice, primaryAbility)

### UI

- [ ] Classes tab shows detailed table (Name, Hit Dice, Primary Ability, Source)
- [ ] Subclasses tab shows table (Name, Parent Class, Source)
- [ ] Class editor: Basic tab renders fields
- [ ] Class editor: Progression tab allows adding/removing level rows
- [ ] Subclass editor: Parent Class dropdown populated from pack
- [ ] ContentBrowser filters work for classes
- [ ] All tests pass

---

## Acceptance Criteria

- [ ] Classes and Subclasses fully supported in headless API
- [ ] Class progression table editor works (add/remove level rows)
- [ ] Subclass editor has parent class selection
- [ ] PackDetail shows Classes + Subclasses tabs
- [ ] ContentBrowser can filter by class features
- [ ] Import/export preserves class progression data
- [ ] `pnpm test` passes for both packages
- [ ] `pnpm typecheck` passes for both packages

---

## Next Task

Phase 3 continues with **Task R** (Glossary) — can be done in parallel with this task.
