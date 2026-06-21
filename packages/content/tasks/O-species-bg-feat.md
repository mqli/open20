# Task O: Species, Backgrounds, Feats — Headless + UI

**Phase**: 3 (Extended Content Types)  
**Depends On**: Task N (Monsters)  
**Estimated Effort**: Large  
**Target Packages**: `@open20/content` + `@open20/rulebook`  
**Content Types**: Species, Backgrounds, Feats (3 types, medium complexity)

---

## Objective

Add three medium-complexity content types across both packages. Each type follows the same 8-step pattern established by Monsters (schema → template → CRUD → validator → registry → import/export → UI tab → editor form → browser filter).

---

## Prerequisites

- [ ] Task N complete (Monsters headless + UI)
- [ ] Familiar with the per-type pattern from Task N
- [ ] Core type definitions: `Species`, `Background`, `Feat` from `open20-core`

---

## Files to Create / Modify

### Headless (`@open20/content`)

| File                                   | Action                                              |
| -------------------------------------- | --------------------------------------------------- |
| `src/validator/schemas.ts`             | Add 3 Zod schemas                                   |
| `src/validator/index.ts`               | Export 3 new schemas                                |
| `src/validator/content-validator.ts`   | Add 3 validate methods + `validatePack()` extension |
| `src/templates/species-template.ts`    | New                                                 |
| `src/templates/background-template.ts` | New                                                 |
| `src/templates/feat-template.ts`       | New                                                 |
| `src/templates/index.ts`               | Export 3 templates                                  |
| `src/editor/content-editor.ts`         | Add CRUD for 3 types + snapshot extension           |
| `src/types/registry.ts`                | Register 3 types                                    |
| `src/types/query.ts`                   | Add `SpeciesQuery`, `BackgroundQuery`, `FeatQuery`  |
| `src/browser/content-browser.ts`       | Add search + filter for 3 types                     |
| `src/io/export.ts`                     | Handle 3 new arrays                                 |
| `src/io/import.ts`                     | Handle 3 new arrays                                 |
| `src/io/conflict.ts`                   | Extend conflict detection                           |

### UI (`@open20/rulebook`)

| File                             | Action                                                      |
| -------------------------------- | ----------------------------------------------------------- |
| `src/pages/PackDetail.tsx`       | Add 3 tabs                                                  |
| `src/pages/SpeciesEditor.tsx`    | New                                                         |
| `src/pages/BackgroundEditor.tsx` | New                                                         |
| `src/pages/FeatEditor.tsx`       | New                                                         |
| `src/components/editor/*.tsx`    | Shared editor patterns                                      |
| `src/pages/ContentBrowser.tsx`   | Add 3 filter sets                                           |
| `src/stores/packDetailStore.ts`  | Track 3 new type counts                                     |
| `src/stores/browserStore.ts`     | Support 3 new search queries                                |
| `src/App.tsx`                    | No changes needed (generic `:contentType` param handles it) |

---

## Per-Type Details

### Species

**Core type**: `Species` from `open20-core`

**Key fields**: id, name, source, size, speed, abilityScoreBonuses, traits, languages, subraceOptions, alignmentDescription

**Editor form** (medium complexity — accordion layout):

- Basic Info: Name, ID, Source, Size, Speed
- Ability Scores: STR/DEX/CON/INT/WIS/CHA bonuses
- Traits: name + description list
- Languages + Subrace Options

**ContentBrowser filters**:

- Size (checkbox: Tiny/Small/Medium/Large)
- Source (checkbox)

### Backgrounds

**Core type**: `Background` from `open20-core`

**Key fields**: id, name, source, skillProficiencies, toolProficiencies, languages, equipment, feature (name + description), personalityTraits, ideals, bonds, flaws

**Editor form** (medium complexity — accordion layout):

- Basic Info: Name, ID, Source
- Proficiencies: Skills (checkboxes), Tools, Languages
- Equipment: text list
- Feature: name + description
- Personality: Ideals, Bonds, Flaws (text areas)

**ContentBrowser filters**:

- Source (checkbox)

### Feats

**Core type**: `Feat` from `open20-core`

**Key fields**: id, name, source, prerequisite, description, benefits (abilityScoreIncrease, proficiencies, etc.)

**Editor form** (medium complexity — accordion layout):

- Basic Info: Name, ID, Source, Prerequisite
- Description (rich text)
- Benefits: Ability Score Increase, Proficiencies, Special

**ContentBrowser filters**:

- Source (checkbox)
- Has Prerequisite (boolean toggle)

---

## Snapshot Extension

Update `ContentEditor.snapshotBeforeOperation()` and `undo()` to handle the 3 new arrays. The snapshot must capture all arrays that may be mutated, not just spells and monsters:

```typescript
const trackedArrays = ['spells', 'monsters', 'species', 'backgrounds', 'feats'];
for (const key of trackedArrays) {
  snapshotObj[key] = this.pack[key as keyof EditableContentPack] ?? null;
}
```

Similarly, `undo()` must restore all tracked arrays.

---

## Tests

### Headless

- [ ] All 3 Zod schemas validate valid data and reject invalid data
- [ ] Templates return objects with sensible defaults
- [ ] `ContentEditor.add/update/remove/duplicate` work for each type
- [ ] Undo correctly restores all 3 arrays
- [ ] `ContentValidator.validateSpecies/validateBackground/validateFeat()` work
- [ ] `validatePack()` includes results for all 3 types
- [ ] Import/export round-trip preserves all 3 arrays
- [ ] ContentBrowser search returns correct results for each type

### UI

- [ ] 3 new tabs shown in PackDetail (Species, Backgrounds, Feats)
- [ ] Each editor form renders and can create content
- [ ] Empty state shown when 0 items for a type
- [ ] ContentBrowser filters work for each type
- [ ] TypeScript compiles without errors
- [ ] All tests pass

---

## Acceptance Criteria

- [ ] Species, Backgrounds, Feats fully supported in headless API
- [ ] PackDetail shows all 3 tabs with correct data
- [ ] Editor forms work for creating, editing, removing content
- [ ] ContentBrowser can search and filter by these types
- [ ] Import/export includes all 3 arrays
- [ ] `pnpm test` passes for both packages
- [ ] `pnpm typecheck` passes for both packages

---

## Next Task

Proceed to **Task P** (Weapons, Armors, Gears) after this task completes.
