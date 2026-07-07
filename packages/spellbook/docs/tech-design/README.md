# D&D Spellbook App — Technical Design Specification

**Version**: v1.0  
**Date**: 2026-05-10  
**Status**: Draft  
**Tech Lead**: [TBD]

---

## Overview

This technical design specification defines the architecture, technology stack, and implementation guidelines for the D&D Spellbook App. The app is a headless UI shell that uses `open20-core` for all game logic, rule calculations, and data management.

### Architecture Principle

> **Headless Core + UI Shell**: open20-core handles all game logic, rule calculations, and data management. The UI layer is a thin shell that renders state and dispatches actions to the core library.

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (React + Vite)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Spell Library│  │  Character  │  │ Spell Detail│       │
│  │   Page      │  │   Sheet     │  │  Flyout     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                          │                                  │
│                    UI State Management                      │
│                  (Zustand / React Context)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  open20-core (npm package)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   spells/   │  │  character/ │  │   engine/   │       │
│  │  Query API  │  │  Mutations  │  │ Calculations│       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Persistence Layer                        │
│  ┌─────────────┐  ┌─────────────┐                        │
│  │ LocalStorage │  │  Session    │                        │
│  │ (characters, │  │  Storage    │                        │
│  │  preferences)│  │  (UI state) │                        │
│  └─────────────┘  └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Framework**: React 18+ with TypeScript | Component reusability, strong typing, ecosystem |
| D2 | **Build Tool**: Vite | Fast HMR, modern ESM, optimized builds |
| D3 | **State Management**: Zustand | Lightweight, TypeScript-first, no boilerplate |
| D4 | **UI Library**: Radix UI Primitives | Accessible, unstyled, composable components |
| D5 | **Styling**: Tailwind CSS + Design Tokens | Utility-first, rapid development, matches design system |
| D6 | **Data Persistence**: localStorage (prefs) + SW Cache | Simple persistence for characters, efficient offline spell DB |
| D7 | **Core Library**: open20-core (npm) | Headless, tested, maintained separately |
| D8 | **Routing**: React Router v6 | Standard, lazy loading support |

---

## Documentation Structure

| Document | Description |
|----------|-------------|
| [Architecture & Stack](./01-architecture.md) | Technology stack, Radix UI usage, UI component library |
| [Project Structure](./02-project-structure.md) | Folder structure and file organization |
| [Core Integration](./03-core-integration.md) | open20-core integration layer and data flow |
| [State Management](./04-state-management.md) | Zustand store definitions and state flow |
| [UI States](./05-ui-states.md) | UI state machines for all pages |
| [Components](./06-components.md) | Component specifications and examples |
| [Persistence](./07-persistence.md) | localStorage service implementation |
| [Routing](./08-routing.md) | Route definitions and navigation |
| [Implementation](./09-implementation.md) | Implementation phases, testing, deployment |
| [Character Export/Import](./10-character-export-import.md) | URL-based character sharing with custom spells and subclasses |

---

**Change Log**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1.0 | 2026-05-10 | Initial version | Tech Lead |

---

**Approval Signatures**

- Tech Lead: [  ]
- Product Owner: [  ]
- Design Lead: [  ]
