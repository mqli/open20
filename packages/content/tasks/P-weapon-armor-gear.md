# Task P: Weapons, Armors, Gears — Headless + UI

**Phase**: 3 (Extended Content Types)  
**Depends On**: Task O (Species, Backgrounds, Feats)  
**Estimated Effort**: Medium  
**Target Packages**: `@open20/content` + `@open20/rulebook`  
**Content Types**: Weapons, Armors, Gears (3 types, low complexity)

---

## Objective

Add three simple equipment content types. These are straightforward types with fewer fields than Monsters or Species, making them ideal candidates to complete after the medium-complexity pattern is established.

---

## Prerequisites

- [ ] Task O complete (Species, Backgrounds, Feats)
- [ ] Core type definitions: `Weapon`, `Armor`, `Gear` from `open20-core`

---

## Files to Create / Modify

### Headless (`@open20/content`)

| File                                 | Action                                              |
| ------------------------------------ | --------------------------------------------------- |
| `src/validator/schemas.ts`           | Add `WeaponSchema`, `ArmorSchema`, `GearSchema`     |
| `src/validator/index.ts`             | Export 3 new schemas                                |
| `src/validator/content-validator.ts` | Add 3 validate methods + `validatePack()` extension |
| `src/templates/weapon-template.ts`   | New                                                 |
| `src/templates/armor-template.ts`    | New                                                 |
| `src/templates/gear-template.ts`     | New                                                 |
| `src/templates/index.ts`             | Export 3 templates                                  |
| `src/editor/content-editor.ts`       | Add CRUD for 3 types + snapshot extension           |
| `src/types/registry.ts`              | Register 3 types                                    |
| `src/types/query.ts`                 | Add `WeaponQuery`, `ArmorQuery`, `GearQuery`        |
| `src/browser/content-browser.ts`     | Add search + filter for 3 types                     |
| `src/io/export.ts`                   | Handle 3 new arrays                                 |
| `src/io/import.ts`                   | Handle 3 new arrays                                 |
| `src/io/conflict.ts`                 | Extend conflict detection                           |

### UI (`@open20/rulebook`)

| File                            | Action                              |
| ------------------------------- | ----------------------------------- |
| `src/pages/PackDetail.tsx`      | Add 3 tabs (Weapons, Armors, Gears) |
| `src/pages/WeaponEditor.tsx`    | New — simple accordion form         |
| `src/pages/ArmorEditor.tsx`     | New — simple accordion form         |
| `src/pages/GearEditor.tsx`      | New — simple accordion form         |
| `src/pages/ContentBrowser.tsx`  | Add 3 filter sets                   |
| `src/stores/packDetailStore.ts` | Track 3 new type counts             |
| `src/stores/browserStore.ts`    | Support 3 new search queries        |

---

## Per-Type Details

### Weapons

**Core type**: `Weapon` from `open20-core`

**Key fields**: id, name, source, type, rarity, cost, damage (dice + type), properties (ammunition, finesse, heavy, etc.), weight, description

**Editor form** (low complexity — single accordion):

- Basic Info: Name, ID, Source, Type (Simple/Martial), Rarity
- Damage: dice, type, damageType
- Properties: checkboxes (Ammunition, Finesse, Heavy, Light, Loading, Range, Reach, Special, Thrown, Two-Handed, Versatile)
- Cost + Weight
- Description (textarea)

**ContentBrowser filters**:

- Type (Simple/Martial checkbox)
- Damage Type (checkbox)
- Rarity (checkbox)

### Armors

**Core type**: `Armor` from `open20-core`

**Key fields**: id, name, source, type (Light/Medium/Heavy/Shield), armorClass (base + modifier), strengthRequirement, stealthDisadvantage, cost, weight, description

**Editor form** (low complexity — single accordion):

- Basic Info: Name, ID, Source, Type dropdown
- Armor Class: base value, dex modifier cap
- Requirements: Strength score, Stealth disadvantage toggle
- Cost + Weight
- Description (textarea)

**ContentBrowser filters**:

- Type (Light/Medium/Heavy/Shield checkbox)
- Source (checkbox)

### Gears

**Core type**: `Gear` from `open20-core`

**Key fields**: id, name, source, category (ammunition, pack, holySymbol, arcaneFocus, druidicFocus, tool, other), cost, weight, description

**Editor form** (low complexity — single accordion):

- Basic Info: Name, ID, Source
- Category dropdown
- Cost + Weight
- Description (textarea)

**ContentBrowser filters**:

- Category (checkbox)
- Source (checkbox)

---

## Snapshot Extension

Extend tracked arrays (in `snapshotBeforeOperation` and `undo`) to include:

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
];
```

---

## Tests

### Headless

- [ ] All 3 Zod schemas validate valid data and reject invalid
- [ ] Templates return objects with defaults matching each type
- [ ] `ContentEditor.add/update/remove/duplicate` work for each type
- [ ] Undo correctly restores all 3 arrays
- [ ] `ContentValidator.validateWeapon/Armor/Gear()` work
- [ ] Import/export round-trip preserves weapons, armors, gears
- [ ] ContentBrowser search returns correct results

### UI

- [ ] 3 new tabs shown in PackDetail
- [ ] Each editor form renders (simple accordion)
- [ ] Empty state when 0 items for a type
- [ ] ContentBrowser filters work for each type
- [ ] All tests pass

---

## Acceptance Criteria

- [ ] Weapons, Armors, Gears fully supported in headless API
- [ ] PackDetail shows 3 tabs with correct columns
- [ ] Simple accordion editor forms work for creating and editing
- [ ] ContentBrowser can search and filter by these types
- [ ] Import/export includes all 3 equipment arrays
- [ ] `pnpm test` passes for both packages
- [ ] `pnpm typecheck` passes for both packages

---

## Next Task

No specific next task — Phase 3 continues with **Task Q** (Classes, Subclasses) and **Task R** (Glossary), which can run in parallel with this task.
