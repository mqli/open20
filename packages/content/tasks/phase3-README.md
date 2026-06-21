# Rulebook Phase 3 — Agent Task Index

**Source**: [PRD v1.3](../PRD.md) | [DESIGN v2.2](../DESIGN.md)  
**Phase**: 3 (Extended Content Types — Iterative)  
**Target**: `@open20/content` v0.2.0 + `@open20/rulebook` v0.2.0

---

## Overview

Phase 3 adds the remaining 10 content types to both the headless API (`@open20/content`) and the UI package (`@open20/rulebook`). Each iteration = 1 content type (or a batch of related types), adding:

- Headless: Zod schema, template, CRUD methods, registry, import/export
- UI: PackDetail tab + table, content editor form, ContentBrowser filters

**Key Principles**:

- Build on the existing spell/monster patterns (ContentEditor follows `addSpell`/`updateSpell`/`removeSpell` convention)
- Monsters are already partially done (schema + template exist) — complete the remaining CRUD + UI
- UI editor forms follow the DESIGN wireframes (accordion for simple types, tabs for complex types)
- ContentBrowser filters must be extended for each new type
- All pack-level CRUD (create/save/delete) is already done in Phase 1 — Phase 3 adds per-type CRUD

---

## Dependency Graph

```
N (Monsters - headless + UI)
│
├──► O (Species, Backgrounds, Feats)
│     │
│     └──► P (Weapons, Armors, Gears)
│
├──► Q (Classes, Subclasses)
│
└──► R (Glossary)
```

> **Parallel execution**: Tasks O, Q, R can be done in parallel after N completes (they are independent types).  
> Task P depends on O (establishes the medium-complexity pattern before simple types).

---

## Task Execution Order

| Order | Task                           | File                                                 | Content Types               | Est. Effort | Dependencies                              |
| ----- | ------------------------------ | ---------------------------------------------------- | --------------------------- | ----------- | ----------------------------------------- |
| 1     | **N** — Monsters               | [N-monster.md](./N-monster.md)                       | Monsters                    | Large       | Phase 2 complete; schema + template exist |
| 2a    | **O** — Species, Bg, Feats     | [O-species-bg-feat.md](./O-species-bg-feat.md)       | Species, Backgrounds, Feats | Large       | After N                                   |
| 2b    | **Q** — Classes, Subclasses    | [Q-classes-subclasses.md](./Q-classes-subclasses.md) | Classes, Subclasses         | Large       | After N (parallel with O)                 |
| 2c    | **R** — Glossary               | [R-glossary.md](./R-glossary.md)                     | Glossary                    | Small       | After N (parallel with O, Q)              |
| 3     | **P** — Weapons, Armors, Gears | [P-weapon-armor-gear.md](./P-weapon-armor-gear.md)   | Weapons, Armors, Gears      | Medium      | After O                                   |

> **Execution strategy**: Start with Monsters (most complex, partial work done). Then fan out to medium complexity types (Species, Backgrounds, Feats) in parallel with Classes/Subclasses and Glossary. Simple equipment types (Weapons, Armors, Gears) come last as they benefit from patterns established by the medium types.

---

## Deliverables per Task

| Task  | Headless Deliverables                                                                                                                                                                                                                               | UI Deliverables                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **N** | `MonsterSchema` (✅ exists), `getMonsterTemplate()` (✅ exists), `addMonster/updateMonster/removeMonster/duplicateMonster()` in ContentEditor, `validateMonster()` in ContentValidator, Monster import/export extensions, Monster in ContentBrowser | Monsters tab in PackDetail, Monster editor (Simple/Advanced dual mode), Monster filters in ContentBrowser |
| **O** | `SpeciesSchema`, `BackgroundSchema`, `FeatSchema`, 3 templates, CRUD methods in ContentEditor, `validateSpecies/validateBackground/validateFeat()` in ContentValidator, registry updates, import/export extensions                                  | 3 tabs in PackDetail, 3 editor forms, 3 filter sets in ContentBrowser                                     |
| **P** | `WeaponSchema`, `ArmorSchema`, `GearSchema`, 3 templates, CRUD methods + 3 validators, registry updates, import/export extensions                                                                                                                   | 3 tabs in PackDetail, 3 editor forms (simple accordion), 3 filter sets                                    |
| **Q** | `ClassSchema`, `SubclassSchema`, 2 templates, CRUD methods + 2 validators, registry updates, import/export extensions                                                                                                                               | Classes/Subclasses tabs in PackDetail, 2 editor forms (advanced tabs), filter sets                        |
| **R** | `GlossarySchema`, `getGlossaryTemplate()`, `updateGlossary/listGlossary()` in ContentEditor (glossary is a single object, not array), import/export, registry                                                                                       | Glossary tab in PackDetail, Glossary editor form, Glossary in ContentBrowser                              |

---

## Per-Type Checklist (applied to each content type in every task)

Each content type requires the following checklist items. They are repeated within each task file with type-specific details.

### Headless (`@open20/content`)

- [ ] Define Zod schema in `src/validator/schemas.ts`
- [ ] Export schema from `src/validator/index.ts`
- [ ] Add `validate<TYPE>()` method to `ContentValidator`
- [ ] Add `validate<TYPE>()` iteration in `validatePack()`
- [ ] Create template function in `src/templates/<type>-template.ts`
- [ ] Export template from `src/templates/index.ts`
- [ ] Add CRUD methods to `ContentEditor` (`add/update/remove/duplicate/get/list`)
- [ ] Wire into `ContentTypeRegistry` in `src/types/registry.ts`
- [ ] Extend import/export to handle the new type array
- [ ] Add unit tests (schema, validator, editor CRUD, import/export roundtrip)

### UI (`@open20/rulebook`)

- [ ] Add tab to `PackDetail` page (`src/pages/PackDetail.tsx`)
- [ ] Create/update `ContentTable` to show type columns
- [ ] Create editor form page for the type (under `src/pages/` or `src/components/editor/`)
- [ ] Wire editor form routing in `App.tsx`
- [ ] Add content type filters to `ContentBrowser`
- [ ] Handle empty state for the type tab
- [ ] Add unit/integration tests for UI

---

## Final Integration (after all tasks complete)

### Updated `@open20/content` barrel (`src/validator/index.ts`)

```typescript
export {
  SpellSchema,
  MonsterSchema,
  SpeciesSchema,
  BackgroundSchema,
  FeatSchema,
  WeaponSchema,
  ArmorSchema,
  GearSchema,
  ClassSchema,
  SubclassSchema,
  GlossarySchema,
} from './schemas';
// ... ContentValidator with all 10 validate methods
```

### Updated `@open20/rulebook` routing (`App.tsx`)

```typescript
// ContentEditor now handles all 10 content types via :contentType param
<Route path="/rulebook/editor/:packId/:contentType/:contentId?" element={<ContentEditor />} />
```

### Updated `ContentTypeRegistry`

```typescript
export const contentTypes: ContentTypeDescriptor[] = [
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
  { id: 'monsters', name: 'Monsters', schema: MonsterSchema, template: getMonsterTemplate },
  { id: 'species', name: 'Species', schema: SpeciesSchema, template: getSpeciesTemplate },
  {
    id: 'backgrounds',
    name: 'Backgrounds',
    schema: BackgroundSchema,
    template: getBackgroundTemplate,
  },
  { id: 'classes', name: 'Classes', schema: ClassSchema, template: getClassTemplate },
  { id: 'subclasses', name: 'Subclasses', schema: SubclassSchema, template: getSubclassTemplate },
  { id: 'feats', name: 'Feats', schema: FeatSchema, template: getFeatTemplate },
  { id: 'weapons', name: 'Weapons', schema: WeaponSchema, template: getWeaponTemplate },
  { id: 'armors', name: 'Armors', schema: ArmorSchema, template: getArmorTemplate },
  { id: 'gears', name: 'Gears', schema: GearSchema, template: getGearTemplate },
  { id: 'glossary', name: 'Glossary', schema: GlossarySchema, template: getGlossaryTemplate },
];
```

---

## Verification Checklist (after all Phase 3 tasks)

```bash
pnpm install                                       # Link workspace deps
pnpm --filter @open20/content typecheck              # Must pass
pnpm --filter @open20/content lint                   # Must pass
pnpm --filter @open20/content test                   # All tests pass
pnpm --filter @open20/rulebook typecheck              # Must pass
pnpm --filter @open20/rulebook lint                   # Must pass
pnpm --filter @open20/rulebook test                   # All tests pass
pnpm build                                          # Turbo: build entire monorepo
```

- [ ] All 11 Zod schemas defined and tested
- [ ] All 11 template functions created
- [ ] ContentEditor supports all 11 types (CRUD + duplicate + undo)
- [ ] ContentValidator validates all 11 types
- [ ] ContentTypeRegistry has all 11 entries
- [ ] Import/export handles all 11 type arrays
- [ ] ContentBrowser filters support all types
- [ ] PackDetail shows tabs for all types present in a pack
- [ ] All editor forms render correctly (accordion for simple, tabs for complex)
- [ ] TypeScript compiles with no errors
- [ ] All tests pass

---

## Scope NOT in Phase 3

- ❌ Multi-step undo / full operation history stack — Phase 4
- ❌ Content pack dependency management — Phase 4
- ❌ Content version control / format migration — Phase 4
- ❌ Batch operations (batch import, batch delete) — Phase 4
- ❌ FileSystemStorage adapter (Node.js CLI) — Phase 4
- ❌ CLI tools (`rulebook create`, `rulebook validate`) — Phase 4
- ❌ Full-text description search / Chinese tokenization — Phase 4
- ❌ Publish content packs to npm — Phase 4
