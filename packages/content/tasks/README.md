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

## Phase 3 Tasks (Extended Content Types — ITERATIVE 🔄)

**Target**: `@open20/content` v0.2.0 + `@open20/rulebook` v0.2.0  
**Task Details**: See [Phase 3 README](./phase3-README.md).

### Task Dependency Graph

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

### Task Execution Order

| Order | Task                           | File                                                 | Content Types                   | Est. Effort | Can Parallelize    |
| ----- | ------------------------------ | ---------------------------------------------------- | ------------------------------- | ----------- | ------------------ |
| 1     | **N** — Monsters               | [N-monster.md](./N-monster.md)                       | Monsters (1 type)               | Large       | —                  |
| 2a    | **O** — Species, Bg, Feats     | [O-species-bg-feat.md](./O-species-bg-feat.md)       | Species, Backgrounds, Feats (3) | Large       | After N            |
| 2b    | **Q** — Classes, Subclasses    | [Q-classes-subclasses.md](./Q-classes-subclasses.md) | Classes, Subclasses (2)         | Large       | Parallel with O    |
| 2c    | **R** — Glossary               | [R-glossary.md](./R-glossary.md)                     | Glossary (1)                    | Small       | Parallel with O, Q |
| 3     | **P** — Weapons, Armors, Gears | [P-weapon-armor-gear.md](./P-weapon-armor-gear.md)   | Weapons, Armors, Gears (3)      | Medium      | After O            |

> **Parallel execution**: Tasks O, Q, R can run in parallel after N.  
> Task P depends on O (establishes patterns before simple equipment types).

### Deliverables per Task

| Task  | Headless Deliverables                                           | UI Deliverables                                                 |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| **N** | Monster CRUD + validator + browser + import/export              | Simple/Advanced dual-mode editor, Monsters tab, browser filters |
| **O** | Species/Background/Feat schemas + templates + CRUD + validators | 3 editor forms, 3 tabs, 3 filter sets                           |
| **P** | Weapon/Armor/Gear schemas + templates + CRUD + validators       | 3 simple accordion editors, 3 tabs, 3 filter sets               |
| **Q** | Class/Subclass schemas + templates + CRUD + validators          | Tabbed editors (progression table), 2 tabs, 2 filter sets       |
| **R** | Glossary schema + set/remove/list entries                       | Key-value pair editor, Glossary tab, search                     |
