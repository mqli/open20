# Rulebook Task Index

**Source**: [PRD v1.3](../PRD.md) | [DESIGN v2.2](../DESIGN.md)  
**Revised Approach (2026-06-16)**: Build UI with spells first, then iteratively add more content types.

---

## Phase Overview

| Phase | Description                        | Target Package     | Status         |
| ----- | ---------------------------------- | ------------------ | -------------- |
| 1     | Headless API for Spells (COMPLETE) | `@open20/content`  | ✅ Complete    |
| 2     | Rulebook UI for Spells (PRIORITY)  | `@open20/rulebook` | 🔄 In Progress |
| 3     | Extended Content Types (ITERATIVE) | Both packages      | 📋 Planned     |
| 4     | Advanced Features                  | Both packages      | 📋 Planned     |

---

## Phase 1 Tasks (Headless API — COMPLETE ✅)

**Target**: `@open20/content` v0.1.0  
**Task Details**: See [Phase 1 README](./phase1-README.md) (if exists) or task files A-F.

### Task Dependency Graph

```
A (scaffold)
│
├──► B (types + storage)
│     │
│     ├──► C (ContentPackManager)
│     │     │
│     │     ├──► F (ContentBrowser)
│     │
│     ├──► D (validation + ContentEditor)
│     │     │
│     │     ├──► E (import/export + conflicts)
```

### Task Execution Order

| Order | Task                        | File                                               | Est. Effort | Can Parallelize |
| ----- | --------------------------- | -------------------------------------------------- | ----------- | --------------- |
| 1     | **A** — Package Scaffold    | [A-scaffold.md](./A-scaffold.md)                   | Small       | —               |
| 2     | **B** — Types & Storage     | [B-types-storage.md](./B-types-storage.md)         | Medium      | —               |
| 3a    | **C** — ContentPackManager  | [C-manager.md](./C-manager.md)                     | Medium      | After B         |
| 3b    | **D** — Validation & Editor | [D-validation-editor.md](./D-validation-editor.md) | Large       | Parallel with C |
| 4a    | **E** — Import/Export       | [E-import-export.md](./E-import-export.md)         | Medium      | After C + D     |
| 4b    | **F** — ContentBrowser      | [F-browser.md](./F-browser.md)                     | Medium      | After C         |

---

## Phase 2 Tasks (Rulebook UI — PRIORITY 🎯)

**Target**: `@open20/rulebook` v0.1.0 (spell-focused MVP)  
**Task Details**: See [Phase 2 README](./phase2-README.md).

### Task Dependency Graph

```
G (scaffold rulebook)
│
├──► H (layout + routing)
│     │
│     ├──► I (PackList page)
│     │     │
│     │     └──► J (PackDetail page - spells tab)
│     │           │
│     │           └──► K (ContentEditor - spell editor)
│     │
│     └──► L (ContentBrowser page)
│
└──► M (import/export UI)
```

### Task Execution Order

| Order | Task                      | File                                               | Est. Effort | Can Parallelize |
| ----- | ------------------------- | -------------------------------------------------- | ----------- | --------------- |
| 1     | **G** — Rulebook Scaffold | [G-scaffold-rulebook.md](./G-scaffold-rulebook.md) | Medium      | —               |
| 2     | **H** — Layout & Routing  | [H-layout.md](./H-layout.md)                       | Medium      | After G         |
| 3     | **I** — PackList Page     | [I-packlist.md](./I-packlist.md)                   | Medium      | After H         |
| 4     | **J** — PackDetail Page   | [J-packdetail.md](./J-packdetail.md)               | Large       | After I         |
| 5     | **K** — Spell Editor      | [K-spell-editor.md](./K-spell-editor.md)           | Large       | After J         |
| 6     | **L** — ContentBrowser    | [L-browser.md](./L-browser.md)                     | Medium      | After H         |
| 7     | **M** — Import/Export UI  | [M-import-export.md](./M-import-export.md)         | Medium      | After J + L     |

## Task Execution Order

| Order | Task                        | File                                               | Est. Effort | Can Parallelize |
| ----- | --------------------------- | -------------------------------------------------- | ----------- | --------------- |
| 1     | **A** — Package Scaffold    | [A-scaffold.md](./A-scaffold.md)                   | Small       | —               |
| 2     | **B** — Types & Storage     | [B-types-storage.md](./B-types-storage.md)         | Medium      | —               |
| 3a    | **C** — ContentPackManager  | [C-manager.md](./C-manager.md)                     | Medium      | After B         |
| 3b    | **D** — Validation & Editor | [D-validation-editor.md](./D-validation-editor.md) | Large       | Parallel with C |
| 4a    | **E** — Import/Export       | [E-import-export.md](./E-import-export.md)         | Medium      | After C + D     |
| 4b    | **F** — ContentBrowser      | [F-browser.md](./F-browser.md)                     | Medium      | After C         |

> **Parallel execution**: Tasks C and D can be done in parallel after B.  
> Tasks E and F can be done in parallel after C+D and C respectively.

## Deliverables per Task

| Task | Key Deliverables                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| A    | `package.json`, `tsconfig.json`, `eslint.config.js`, empty `src/index.ts`                                              |
| B    | `EditableContentPack`, `ContentTypeId`, `EditState`, `SpellQuery`, `IStorage`, `IndexedDBStorage`                      |
| C    | `ContentPackManager` (create/load/save/list/enable/disable/delete packs)                                               |
| D    | `SpellSchema` (Zod), `ContentValidator`, `ContentEditor` (add/edit/remove/duplicate/undo spells), `getSpellTemplate()` |
| E    | `exportPack()` (strips runtime state), `importPack()`, `checkImportConflicts()`, `importWithResolutions()`             |
| F    | `ContentBrowser` (getAllSpells, getSpellsByPack, searchSpells with SpellQuery)                                         |

## Final Integration (after all tasks complete)

Update `src/index.ts` barrel export:

```typescript
// packages/content/src/index.ts

// Types
export type { EditableContentPack } from './types/content-pack';
export type { ContentTypeId, ContentTypeDescriptor } from './types/registry';
export { contentTypes } from './types/registry';
export type { EditState, UndoEntry } from './types/edit-state';
export type { SpellQuery } from './types/query';

// Storage
export type { IStorage } from './storage/istorage';
export { IndexedDBStorage } from './storage/indexeddb-storage';

// Manager
export { ContentPackManager } from './manager';

// Editor
export { ContentEditor } from './editor';

// Validator
export { SpellSchema, ContentValidator } from './validator';
export type { ValidationError, ValidationResult, ValidationReport } from './validator';

// IO
export {
  exportPack,
  importPack,
  mergePack,
  checkImportConflicts,
  importWithResolutions,
} from './io';
export type { ConflictType, ConflictEntry, ConflictResolution, ImportResult } from './io';

// Browser
export { ContentBrowser } from './browser';

// Templates
export { getSpellTemplate } from './templates';
```

## Verification Checklist (after all tasks)

```bash
pnpm install                          # Link workspace deps
pnpm --filter @open20/content typecheck  # Must pass
pnpm --filter @open20/content lint       # Must pass
pnpm --filter @open20/content test       # Must pass all tests
pnpm build                             # Turbo: build entire monorepo
```

## Implementation Checklist

- [ ] A: Package scaffold created, monorepo integrated
- [ ] B: `EditableContentPack`, `IStorage`, `IndexedDBStorage` implemented + tested
- [ ] C: `ContentPackManager` implemented + tested
- [ ] D: `SpellSchema`, `ContentValidator`, `ContentEditor` implemented + tested
- [ ] E: `exportPack`, `importPack`, conflict APIs implemented + tested
- [ ] F: `ContentBrowser`, `searchSpells` implemented + tested
- [ ] Final: `src/index.ts` barrel export updated
- [ ] Final: `pnpm test` passes for entire rulebook package
- [ ] Final: `pnpm typecheck` passes for rulebook

## Scope NOT in Phase 1

The following are explicitly excluded from these tasks:

- ❌ Other 10 content types (Species, Backgrounds, Classes, Subclasses, Feats, Weapons, Armors, Gears, Monsters, Glossary) — Phase 2
- ❌ UI components (`@open20/rulebook`) — Phase 4
- ❌ FileSystemStorage adapter — Phase 5
- ❌ Search for non-spell types — Phase 3
- ❌ Full-text description search / Chinese tokenization — Phase 3
