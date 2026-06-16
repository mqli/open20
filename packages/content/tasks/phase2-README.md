# Rulebook Phase 2 — Agent Task Index

**Source**: [PRD v1.3](../PRD.md) | [DESIGN v2.2](../DESIGN.md)  
**Phase**: 2 (Rulebook UI — spell-focused MVP)  
**Target**: `@open20/rulebook` v0.1.0

---

## Overview

Phase 2 builds the `@open20/rulebook` React UI package with spell-focused MVP. This phase validates the headless API design from Phase 1 and provides a working UI for content creators to manage spell content packs.

**Key Principles**:

- Spell-first: Only implement spell-related UI
- Reuse `@open20/ui` components where possible
- Follow DESIGN.md wireframes exactly
- Implement responsive design (desktop-first, mobile-compatible)

---

## Task Dependency Graph

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

---

## Task Execution Order

| Order | Task                      | File                                               | Est. Effort | Can Parallelize |
| ----- | ------------------------- | -------------------------------------------------- | ----------- | --------------- |
| 1     | **G** — Rulebook Scaffold | [G-scaffold-rulebook.md](./G-scaffold-rulebook.md) | Medium      | —               |
| 2     | **H** — Layout & Routing  | [H-layout.md](./H-layout.md)                       | Medium      | After G         |
| 3     | **I** — PackList Page     | [I-packlist.md](./I-packlist.md)                   | Medium      | After H         |
| 4     | **J** — PackDetail Page   | [J-packdetail.md](./J-packdetail.md)               | Large       | After I         |
| 5     | **K** — Spell Editor      | [K-spell-editor.md](./K-spell-editor.md)           | Large       | After J         |
| 6     | **L** — ContentBrowser    | [L-browser.md](./L-browser.md)                     | Medium      | After H         |
| 7     | **M** — Import/Export UI  | [M-import-export.md](./M-import-export.md)         | Medium      | After J + L     |

> **Parallel execution**: Tasks I, L can be done in parallel after H.  
> Tasks K and M can be done in parallel after J and L respectively.

---

## Deliverables per Task

| Task | Key Deliverables                                                                       |
| ---- | -------------------------------------------------------------------------------------- |
| G    | `@open20/rulebook` package scaffold (React + TypeScript + Vite + Tailwind + shadcn/ui) |
| H    | `RulebookLayout` (sidebar + topbar + routing), Zustand stores                          |
| I    | `PackList` page (content pack card grid + empty state + create/import/export modals)   |
| J    | `PackDetail` page (spells tab + table + inline edit + all content tab)                 |
| K    | `ContentEditor` page (spell editor form + preview drawer + save buttons)               |
| L    | `ContentBrowser` page (filter sidebar + result grid + add to pack flow)                |
| M    | ImportWizard (quick/guided mode) + ExportDialog + conflict resolution UI               |

---

## Final Integration (after all tasks complete)

Update `packages/rulebook/src/App.tsx` with complete routing:

```typescript
// packages/rulebook/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RulebookLayout } from './components/RulebookLayout';
import { PackList } from './pages/PackList';
import { PackDetail } from './pages/PackDetail';
import { ContentEditor } from './pages/ContentEditor';
import { ContentBrowser } from './pages/ContentBrowser';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RulebookLayout />}>
          <Route path="/rulebook" element={<PackList />} />
          <Route path="/rulebook/packs/:id" element={<PackDetail />} />
          <Route path="/rulebook/editor/:packId/:contentType/:contentId?" element={<ContentEditor />} />
          <Route path="/rulebook/browse" element={<ContentBrowser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Verification Checklist (after all tasks)

```bash
pnpm install                          # Link workspace deps
pnpm --filter @open20/rulebook dev   # Start dev server
pnpm --filter @open20/rulebook typecheck  # Must pass
pnpm --filter @open20/rulebook lint       # Must pass
pnpm --filter @open20/rulebook test       # Must pass all tests
pnpm build                             # Turbo: build entire monorepo
```

---

## Scope NOT in Phase 2

The following are explicitly excluded from these tasks:

- ❌ Other content types (Monsters, Species, etc.) — Phase 3
- ❌ Simple/Advanced dual mode for Monster editor — Phase 3
- ❌ Multi-step undo — Phase 4
- ❌ Content pack dependency management — Phase 4
- ❌ CLI tools — Phase 4
