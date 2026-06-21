# Task R: Glossary — Headless + UI

**Phase**: 3 (Extended Content Types)  
**Depends On**: Task N (Monsters)  
**Estimated Effort**: Small  
**Target Packages**: `@open20/content` + `@open20/rulebook`  
**Content Types**: Glossary (1 type, low complexity)

---

## Objective

Add Glossary support. Unlike other content types (which are arrays of items), Glossary is a **single object** (`RulesGlossary` from `open20-core`) containing key-value pairs of game terms and their definitions. This makes its CRUD pattern different — instead of add/remove/duplicate, it's mostly set/unset individual glossary entries.

---

## Prerequisites

- [ ] Task N complete (Monsters headless + UI)
- [ ] Core type definition: `RulesGlossary` from `open20-core` (typically `Record<string, string>` or similar)

---

## Files to Create / Modify

### Headless (`@open20/content`)

| File                                 | Action                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `src/validator/schemas.ts`           | Add `GlossarySchema`                                                        |
| `src/validator/index.ts`             | Export GlossarySchema                                                       |
| `src/validator/content-validator.ts` | Add `validateGlossary()` + `validatePack()` extension                       |
| `src/templates/glossary-template.ts` | New                                                                         |
| `src/templates/index.ts`             | Export glossary template                                                    |
| `src/editor/content-editor.ts`       | Add Glossary methods (set/get/list/remove entry — NOT add/remove/duplicate) |
| `src/types/registry.ts`              | Register Glossary                                                           |
| `src/types/query.ts`                 | Add `GlossaryQuery`                                                         |
| `src/browser/content-browser.ts`     | Add glossary search                                                         |
| `src/io/export.ts`                   | Handle glossary object                                                      |
| `src/io/import.ts`                   | Handle glossary object                                                      |
| `src/io/conflict.ts`                 | No conflict needed for glossary (single object, merge semantics)            |

### UI (`@open20/rulebook`)

| File                            | Action                      |
| ------------------------------- | --------------------------- |
| `src/pages/PackDetail.tsx`      | Add Glossary tab            |
| `src/pages/GlossaryEditor.tsx`  | New — key-value pair editor |
| `src/pages/ContentBrowser.tsx`  | Add glossary search         |
| `src/stores/packDetailStore.ts` | Track glossary entry count  |
| `src/stores/browserStore.ts`    | Support glossary search     |

---

## Per-Type Details

### Glossary

**Core type**: `RulesGlossary` from `open20-core`

**Structure**: `Record<string, string>` — mapping of term names to their definitions.

**Editor form** (low complexity — table editor):

```
┌────────────────────────────────────────────────────┐
│  Glossary (Glossary)        [Search...]            │
├────────────────────────────────────────────────────┤
│  ┌───────────────┬──────────────────────────┬────┐ │
│  │ Term          │ Definition               │    │ │
│  ├───────────────┼──────────────────────────┼────┤ │
│  │ Action        │ An action is a...        │ ✎🗑 │ │
│  │ Bonus Action  │ A bonus action is...     │ ✎🗑 │ │
│  │ Concentration │ Some spells require...   │ ✎🗑 │ │
│  └───────────────┴──────────────────────────┴────┘ │
│  [+ Add Entry]                                     │
└────────────────────────────────────────────────────┘
```

### ContentEditor Methods

Since Glossary is a single object (not an array), the CRUD methods differ:

```typescript
interface ContentEditor {
  // ── Glossary ──────────────────────────────────────────────

  /** Initialize or replace the entire glossary. */
  setGlossary(glossary: RulesGlossary): void;

  /** Set a single glossary entry (term → definition). Adds or updates. */
  setGlossaryEntry(term: string, definition: string): void;

  /** Get a single glossary entry by term name. */
  getGlossaryEntry(term: string): string | undefined;

  /** Remove a single glossary entry by term name. */
  removeGlossaryEntry(term: string): void;

  /** List all glossary entries as [term, definition] pairs. */
  listGlossaryEntries(): [string, string][];
}
```

Snapshot should capture `pack.glossary` alongside tracked arrays.

### ContentBrowser

For glossary search:

- `searchGlossary(query: GlossaryQuery)` → returns matching entries
- `GlossaryQuery`: `{ term?: string; definition?: string; source?: string }`

### Schema

```typescript
export const GlossarySchema = z.record(z.string(), z.string()).optional().default({});
```

Or if `RulesGlossary` has a more structured definition (e.g., an array of objects with `term` and `definition` fields), use that shape instead.

---

## Tests

### Headless

- [ ] `GlossarySchema` validates a `Record<string, string>`
- [ ] Template returns empty object `{}`
- [ ] `setGlossaryEntry()` adds/updates a term
- [ ] `removeGlossaryEntry()` removes a term
- [ ] `getGlossaryEntry()` returns correct definition
- [ ] `listGlossaryEntries()` returns all entries
- [ ] Undo restores glossary to prior state
- [ ] Import/export round-trip preserves glossary data

### UI

- [ ] Glossary tab shown in PackDetail with table of terms
- [ ] Add Entry button creates new term-definition row
- [ ] Edit and Delete work for individual entries
- [ ] Search filters glossary terms in ContentBrowser
- [ ] Empty state when 0 entries
- [ ] All tests pass

---

## Key Differences from Other Types

| Aspect             | Other Types                              | Glossary                                      |
| ------------------ | ---------------------------------------- | --------------------------------------------- |
| Data structure     | Array of items (`Monster[]`, `Weapon[]`) | Single object (`Record<string, string>`)      |
| Add operation      | `addMonster(monster)` — push to array    | `setGlossaryEntry(term, def)` — set property  |
| Remove             | `removeSpell(id)` — splice array         | `removeGlossaryEntry(term)` — delete property |
| Duplicate          | `duplicateMonster(id)` — clone item      | Not applicable                                |
| Conflict in import | Individual item conflicts                | Merge semantics (newest wins for each term)   |

---

## Acceptance Criteria

- [ ] Glossary fully supported in headless API (set/get/remove/list entries)
- [ ] PackDetail shows Glossary tab with table
- [ ] Glossary editor allows adding/editing/removing individual terms
- [ ] ContentBrowser can search glossary terms
- [ ] Import/export preserves glossary as object
- [ ] `pnpm test` passes for both packages
- [ ] `pnpm typecheck` passes for both packages

---

## Next Task

After this task completes, Phase 3 is complete! Proceed to **Final Integration** steps in `phase3-README.md`.
