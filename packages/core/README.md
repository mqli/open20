# Open20 Core

[![npm version](https://img.shields.io/npm/v/open20-core)](https://www.npmjs.com/package/open20-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/mqli/open20/actions/workflows/ci.yml/badge.svg)](https://github.com/mqli/open20/actions/workflows/ci.yml)

A headless TypeScript game engine for D&D 5e 2024 — rule calculations, spell & monster management, dice rolling, and character management. Framework-agnostic, UI-free, test-driven.

## Features

- **Headless Core**: Pure TypeScript, no UI framework dependencies
- **Immutable State**: All Character fields are readonly. Modifications return new objects
- **Rule Engine**: Pure functions for AC, HP, spell slots, initiative, attacks, skills, and saving throws
- **Character Management**: Create, validate, level up, rest (short/long), and manage characters with full 2024 PHB support
- **Spell Management**: 330+ SRD spells with full metadata, preparation rules, and query functions
- **Monster Management**: Query, search, and manage monsters with combat state tracking
- **Dice System**: Layered dice engine — core rolls, advantage/disadvantage, skill checks, attacks, and damage
- **Character Storage**: Persistence interface with in-memory implementation, serialization, and deserialization
- **Content Packs**: Import/export character data as portable content packs
- **ESM**: Modern JavaScript module system
- **TypeScript**: Full type safety with strict mode
- **Zod Schemas**: Runtime validation for all data structures
- **Testable**: 826 tests across 51 test files

## Installation

```bash
npm install open20-core
```

## Quick Start

```typescript
import {
  createDataLoader,
  getSpell,
  getModifier,
  rollDie,
  defaultRandom,
  searchSpells,
} from 'open20-core';

// Pure engine + dice helpers
const dexMod = getModifier(14); // 2
const d20 = rollDie(defaultRandom, 'd20');

// Spell queries use a DataLoader instance
const data = createDataLoader();
const fireball = getSpell('fireball', data);
const evocationSpells = searchSpells({ school: 'Evocation', level: [1, 2, 3] }, data);
```

## API Modules

| Module      | Import Path                             | Description                                                                         |
| ----------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| `engine`    | `open20-core` / `open20-core/engine`    | Rule calculations (AC, HP, skills, spell slots, initiative, attacks, concentration) |
| `character` | `open20-core` / `open20-core/character` | Character creation, validation, level up, rests, mutations, spellcasting, feats     |
| `spells`    | `open20-core` / `open20-core/spells`    | Spell data, query functions, preparation rules, upcasting                           |
| `monster`   | `open20-core` / `open20-core/monster`   | Monster query, stat calculations, combat state management                           |
| `dice`      | `open20-core` / `open20-core/dice`      | Core dice engine (d20, advantage, expressions) and game mechanics                   |
| `rolls`     | `open20-core` / `open20-core/rolls`     | High-level roll functions for characters and monsters                               |
| `data`      | `open20-core` / `open20-core/data`      | Data loaders for static JSON datasets (species, classes, feats, etc.)               |
| `types`     | `open20-core` / `open20-core/types`     | TypeScript type definitions for all game entities                                   |
| `storage`   | `open20-core` / `open20-core/storage`   | Character persistence, serialization/deserialization                                |
| `content`   | `open20-core` / `open20-core/content`   | Content pack management for portable character data                                 |

## Browser Usage

```bash
npm run build:bundle
```

```html
<script src="dist/open20-core.js"></script>
<script>
  const loader = Open20Core.createDataLoader();
  const char = Open20Core.createCharacter(params, loader);
</script>
```

## Development

This package is part of the [open20 monorepo](../../README.md). Install from the repo root:

```bash
pnpm install       # from monorepo root

pnpm test
pnpm run test:coverage
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run build:bundle
```

## Documentation

- [PRD.md](./PRD.md) — Product Requirements Document
- [AGENTS.md](./AGENTS.md) — Developer guide for AI agents
- [spec/high-level-design.md](./spec/high-level-design.md) — Technical architecture
- [spec/data-model.md](./spec/data-model.md) — TypeScript interfaces & JSON schema
- [requirements/README.md](./requirements/README.md) — Requirements traceability

## License

MIT
