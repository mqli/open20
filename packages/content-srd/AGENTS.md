# @open20/content-srd — Agent Context

> **Purpose**: This document provides essential context for AI agents working on the `@open20/content-srd` package. Read this before making changes.

---

## 0. Package Overview

**Package**: `@open20/content-srd` - SRD 5.2 content pack for Open20  
**Goal**: Provide SRD (System Reference Document) content as a `ContentPack` object that can be registered with `DataLoader`.  
**Status**: S1 complete (SRD 5.2 content exported)

**Dependencies**:

- `open20-core` (workspace:\*) - for `ContentPack` type definition

---

## 1. Package Structure

```
packages/content-srd/
├── package.json                # Package definition
├── tsconfig.json              # TypeScript config (extends @open20/config)
├── README.md                 # Documentation
├── AGENTS.md                # This file
├── data/                     # SRD JSON data files
│   ├── meta.json
│   ├── species.json
│   ├── backgrounds.json
│   ├── classes.json
│   ├── subclasses.json
│   ├── feats.json
│   ├── weapons.json
│   ├── armors.json
│   ├── gear.json
│   ├── spells.json
│   └── monsters.json
├── src/
│   └── index.ts              # Imports JSON, exports srdContentPack
├── scripts/                  # Scripts to parse SRD markdown into JSON
│   ├── parse_srd_markdown.ts
│   ├── parse_srd_spells_markdown.ts
│   ├── parse_srd_classes_markdown.ts
│   ├── parse_srd_subclasses_markdown.ts
│   ├── parse_srd_class_generation.ts
│   ├── parse_srd_spell_generation.ts
│   ├── parse_srd_class_markdown_shared.ts
│   └── srd_markdown_helpers.ts
└── tests/                    # Tests for parse scripts
    └── parse_srd_markdown.test.ts
```

---

## 2. Usage

### 2.1 Installing

```bash
pnpm add @open20/content-srd
```

### 2.2 Using in Code

```typescript
import { createDataLoader } from 'open20-core';
import { srdContentPack } from '@open20/content-srd';

const dataLoader = createDataLoader();
dataLoader.registerContentPack(srdContentPack);

// Now dataLoader has SRD data
const human = dataLoader.getSpecies('human');
const fireball = dataLoader.getSpell('fireball');
```

### 2.3 Using in Tests (core package)

```typescript
import { createTestLoader } from '../create-test-loader';

const dataLoader = createTestLoader(); // Auto-registers SRD content

// Now dataLoader has SRD data
```

---

## 3. Data Files

### 3.1 JSON Data (in `data/`)

| File               | Content                                | Source  |
| ------------------ | -------------------------------------- | ------- |
| `species.json`     | Species (Human, Elf, etc.)             | SRD 5.2 |
| `backgrounds.json` | Backgrounds (Acolyte, etc.)            | SRD 5.2 |
| `classes.json`     | Classes (Wizard, Fighter, etc.)        | SRD 5.2 |
| `subclasses.json`  | Subclasses (School of Evocation, etc.) | SRD 5.2 |
| `feats.json`       | Feats (Alert, etc.)                    | SRD 5.2 |
| `weapons.json`     | Weapons (Longbow, etc.)                | SRD 5.2 |
| `armors.json`      | Armor (Leather, etc.)                  | SRD 5.2 |
| `gear.json`        | Gear (Backpack, etc.)                  | SRD 5.2 |
| `spells.json`      | Spells (Fireball, etc.)                | SRD 5.2 |
| `monsters.json`    | Monsters (Goblin, etc.)                | SRD 5.2 |
| `meta.json`        | Content pack metadata                  | Manual  |

### 3.2 Parse Scripts (in `scripts/`)

These scripts parse SRD markdown files and generate the JSON data files.

**Running a parse script**:

```bash
cd packages/content-srd
npx tsx scripts/parse_srd_markdown.ts
```

---

## 4. Building & Testing

### 4.1 Build

```bash
cd packages/content-srd
pnpm run build
```

Output: `dist/` directory with compiled JS and type declarations.

### 4.2 Test

```bash
cd packages/content-srd
pnpm test
```

---

## 5. Adding New Content

### 5.1 Adding a New SRD Content File

1. Add JSON file to `data/` (e.g., `data/new-content.json`)
2. Update `src/index.ts` to import and export the new content
3. Update `ContentPack` interface in `open20-core` (if needed)
4. Run `pnpm run build` to verify

### 5.2 Updating Existing Content

1. Edit the JSON file in `data/`
2. Run `pnpm run build` to verify
3. Update tests if needed

---

## 6. Architecture Notes

### 6.1 Separation of Concerns

- **`open20-core`**: Pure engine, NO content data
- **`@open20/content-srd`**: SRD content as a `ContentPack`
- **Consumer** (e.g., `spellbook`): Installs both, registers content pack

### 6.2 Why Separate Package?

1. **Engine/Content Separation**: Core engine should be independent of content
2. **Multiple Content Packs**: Users can create homebrew content packs
3. **Independent Versioning**: Content can be updated independently of engine
4. **Tree-shaking**: Consumers can choose which content packs to include

---

## 7. Troubleshooting

### 7.1 "Cannot find module '@open20/content-srd'"

- Make sure you've run `pnpm install`
- Make sure `@open20/content-srd` is built (`pnpm run build`)
- Check `package.json` has correct `main` and `exports` fields

### 7.2 Tests Failing with Empty Data

- Make sure you're using `createTestLoader()` (not `createDataLoader()`)
- Check that `srdContentPack` is correctly imported and registered

---

**Last Updated**: 2026-06-06  
**Maintainer**: Open20 Team
