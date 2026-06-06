---
name: move-srd-to-content-package-v2
overview: 将 SRD 内容抽到独立包 content-srd。core 只提供 DataLoader 接口，content-srd 提供实现（含 default-loader.ts）。消费者同时依赖 core + content-srd，core 不依赖 content-srd。
todos:
  - id: create-content-srd-package
    content: 创建 packages/content-srd/ 目录，添加 package.json、tsconfig.json、README.md 和 src/index.ts
    status: pending
  - id: move-json-data
    content: 移动 core/static/srd/*.json（11个文件）到 content-srd/data/*.json，使用 git mv 保留历史
    status: pending
    dependencies:
      - create-content-srd-package
  - id: move-default-loader
    content: 移动 core/src/data/default-loader.ts 到 content-srd/src/data/default-loader.ts，更新 JSON 导入路径为相对路径 ../data/*.json
    status: pending
    dependencies:
      - create-content-srd-package
  - id: update-default-loader-imports
    content: 更新 default-loader.ts 中的类型导入，从 open20-core 导入类型（DataLoader、Species、Spell 等）
    status: pending
    dependencies:
      - move-default-loader
  - id: update-core-exports
    content: 更新 core：删除 loader.ts 第121行、data/index.ts 第5行、src/index.ts 第52行对 createDataLoader 的导出
    status: pending
    dependencies:
      - move-default-loader
  - id: move-markdown-sources
    content: 移动 SRD markdown 源文件从 core/requirements/ 到 content-srd/src/markdown/
    status: pending
    dependencies:
      - create-content-srd-package
  - id: move-parse-scripts
    content: 移动解析脚本从 core/scripts/parse_srd_*.ts 到 content-srd/scripts/，更新类型导入路径
    status: pending
    dependencies:
      - create-content-srd-package
  - id: update-spellbook
    content: 更新 spellbook：package.json 添加 @open20/content-srd 依赖，src/core/data-loader.ts 改从 content-srd 导入 createDataLoader
    status: pending
    dependencies:
      - update-core-exports
  - id: move-integrity-tests
    content: 移动 core/tests/data/integrity.test.ts 到 content-srd/tests/data/，更新 JSON 导入路径
    status: pending
    dependencies:
      - move-json-data
  - id: update-combat-tests
    content: 更新 core/tests/integration/combat-scenarios/*.test.ts：添加 @open20/content-srd 为 devDependency，更新 monsters.json 导入路径
    status: pending
    dependencies:
      - move-json-data
  - id: update-content-management-tests
    content: 更新 core/tests/content/content-management.test.ts：createDataLoader 改从 @open20/content-srd 导入
    status: pending
    dependencies:
      - update-core-exports
  - id: cleanup-core
    content: 删除 core/static/srd/ 目录（确认所有文件已移出），更新 core/AGENTS.md 文档
    status: pending
    dependencies:
      - move-json-data
      - move-default-loader
      - move-markdown-sources
      - move-parse-scripts
  - id: verify-build-and-tests
    content: 运行 pnpm install && pnpm build && pnpm test 验证迁移正确性
    status: pending
    dependencies:
      - update-spellbook
      - move-integrity-tests
      - update-combat-tests
      - update-content-management-tests
      - cleanup-core
---

## 需求概述

将 SRD（System Reference Document）相关内容从 `packages/core` 抽取到独立的 `@open20/content-srd` 包，实现引擎与内容分离。

## 核心架构决策（用户确认）

- **core 不依赖 content-srd**：引擎包独立，不持有任何内容数据
- **core 提供 DataLoader 接口**：`DataLoader` 类型定义、`LookupTables` 类型在 core 中定义
- **content-srd 提供 DataLoader 实现**：`default-loader.ts` 从 core 移到 content-srd
- **content-srd 依赖 core**：使用 core 的类型定义
- **消费者（spellbook）同时依赖 core + content-srd**

## 迁移范围

### 从 core 移出的内容

1. **JSON 数据文件**（11个）：`core/static/srd/*.json` → `content-srd/data/*.json`

- `meta.json`、`species.json`、`backgrounds.json`、`classes.json`、`subclasses.json`
- `feats.json`、`weapons.json`、`armor.json`、`gear.json`
- `spells.json`、`monsters.json`、`lookup-tables.json`

2. **DataLoader 实现**：`core/src/data/default-loader.ts` → `content-srd/src/data/default-loader.ts`

3. **解析脚本**（8个）：`core/scripts/parse_srd_*.ts` 等 → `content-srd/scripts/`

4. **SRD 源 markdown**：`core/requirements/**/srd-*.md` → `content-srd/src/markdown/`

### 保留在 core 的内容

- `src/data/loader.ts`：DataLoader 接口定义（删除第121行对 default-loader 的 re-export）
- `src/data/index.ts`：只导出类型，删除对 `createDataLoader` 的导出
- `src/index.ts`：删除第52行 `export { createDataLoader }`
- `scripts/bundle.mjs`、`scripts/release.mjs`：core 专属构建脚本
- `requirements/` 中非 SRD 相关的需求文档

## 预期效果

- SRD 内容作为独立包分发，可被其他项目独立使用
- core 包职责更清晰（纯引擎，无内容依赖）
- 内容包版本可独立管理，支持未来扩展（如 homebrew 内容包）

## 技术栈

- **包管理**：pnpm monorepo（已有 `pnpm-workspace.yaml`）
- **语言**：TypeScript（解析脚本）+ JSON（静态数据）
- **脚本运行**：`tsx`（直接运行 TypeScript 脚本，无需编译）
- **构建**：`content-srd` 无编译步骤（纯数据和脚本）；`core` 构建依赖 `content-srd` 的类型

## 实现方案

### 目标依赖关系

```
open20-core                    @open20/content-srd
(提供 DataLoader 接口类型)      (提供 DataLoader 实现)
     ↑                              ↑
     └────────── spellbook ─────────┘
        (同时依赖 core + content-srd)
```

- `content-srd` → 依赖 `open20-core`（编译时类型）
- `spellbook` → 依赖 `open20-core` + `@open20/content-srd`
- `open20-core` → 不依赖 `content-srd`

### 新包结构

```
packages/content-srd/
├── package.json                # 包定义，导出 createDataLoader + JSON 数据
├── tsconfig.json              # TypeScript 配置（extends @open20/config）
├── README.md                 # 文档
├── data/                     # JSON 数据（从 core/static/srd/ 移入）
│   ├── meta.json
│   ├── species.json
│   ├── backgrounds.json
│   ├── classes.json
│   ├── subclasses.json
│   ├── feats.json
│   ├── weapons.json
│   ├── armor.json
│   ├── gear.json
│   ├── spells.json
│   ├── monsters.json
│   └── lookup-tables.json
├── src/
│   ├── index.ts              # 导出 createDataLoader
│   ├── data/
│   │   └── default-loader.ts  # 从 core/src/data/ 移入
│   └── markdown/             # SRD 源 markdown
│       ├── srd-5.2-spell-list.md
│       ├── srd-5.2-monsters.md
│       ├── srd-5.2-feat.md
│       └── classes/          # 12 个职业 markdown 文件
└── scripts/                  # 解析脚本（从 core/scripts/ 移入）
    ├── parse_srd_markdown.ts
    ├── parse_srd_spells_markdown.ts
    ├── parse_srd_classes_markdown.ts
    ├── parse_srd_subclasses_markdown.ts
    ├── parse_srd_class_generation.ts
    ├── parse_srd_spell_generation.ts
    ├── parse_srd_class_markdown_shared.ts
    └── srd_markdown_helpers.ts
```

### 关键实现细节

#### 1. `content-srd/package.json` 配置

```
{
  "name": "@open20/content-srd",
  "version": "0.1.0",
  "description": "SRD 5.2 content pack for Open20",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./data/*": "./data/*",
    "./types": "./dist/index.d.ts"
  },
  "files": ["dist/", "data/", "README.md"],
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc-alias -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "open20-core": "workspace:*"
  },
  "devDependencies": {
    "@open20/config": "workspace:*",
    "typescript": "^5.9.3",
    "tsc-alias": "^1.8.17",
    "vitest": "catalog:"
  }
}
```

#### 2. `default-loader.ts` 迁移后的修改

移动后，`default-loader.ts` 中的 JSON 导入路径需要更新：

**修改前**：

```typescript
import speciesDataJson from '../../static/srd/species.json' with { type: 'json' };
```

**修改后**：

```typescript
import speciesDataJson from '../data/species.json' with { type: 'json' };
```

类型导入保持从 `open20-core` 导入（通过 `content-srd` 对 `core` 的依赖）：

```typescript
import type { DataLoader, LookupTables, SpellLevel } from 'open20-core/data';
import type { ContentPack, ContentPackMeta } from 'open20-core/content';
import type { Species, SpeciesSubtype } from 'open20-core';
// ... 其他类型导入
```

#### 3. `core/src/data/loader.ts` 修改

删除第121行：

```typescript
// 删除此行
export { createDataLoader } from './default-loader';
```

文件只保留 `DataLoader` 接口定义和 `LookupTables` 类型导出。

#### 4. `core/src/data/index.ts` 修改

修改为只导出类型：

```typescript
// data/index.ts
// Barrel export — data module public API

export type { DataLoader, LookupTables, SpellLevel } from './loader';
// 不再导出 createDataLoader
```

#### 5. `core/src/index.ts` 修改

删除第52行：

```typescript
// 删除此行
export { createDataLoader } from './data';
```

#### 6. `spellbook` 修改

`spellbook/src/core/data-loader.ts`：

```typescript
// 修改前
import { createDataLoader } from 'open20-core';

// 修改后
import { createDataLoader } from '@open20/content-srd';

export const dataLoader = createDataLoader();
```

`spellbook/package.json`：添加 `"@open20/content-srd": "workspace:*"` 到 dependencies。

#### 7. 测试文件处理

**`core/tests/data/integrity.test.ts`**：

- 移至 `content-srd/tests/data/integrity.test.ts`
- 更新 JSON 导入路径为 `@open20/content-srd/data/*.json`

**`core/tests/integration/combat-scenarios/*.test.ts`**：

- 留在 `core`（测试引擎功能）
- 添加 `@open20/content-srd` 为 `devDependency`
- 更新 `monsters.json` 导入路径

**`core/tests/content/content-management.test.ts`**：

- 留在 `core`（测试 core 的内容管理功能）
- `createDataLoader` 改为从 `@open20/content-srd` 导入
- `loadContentPack` 的路径指向 `content-srd/data/`（使用 `require.resolve`）

#### 8. 解析脚本的类型处理

解析脚本（如 `parse_srd_markdown.ts`）当前使用 `import type` 从 `core/src/types/` 导入类型。

移动到 `content-srd/scripts/` 后，有两种方案：

- **方案 A**：保留类型导入，通过 `open20-core` 依赖（推荐，类型安全）
- **方案 B**：改为 `any` 类型（避免对 core 的类型依赖，但失去类型安全）

建议使用**方案 A**，因为 `content-srd` 已经依赖 `open20-core`。

#### 9. `pnpm-workspace.yaml` 更新

添加 `packages/content-srd` 到 workspace（如果尚未包含 `packages/*`）。

当前配置：

```
packages:
  - 'packages/*'
```

已包含 `packages/*`，无需修改。

### 实施顺序

1. 创建 `packages/content-srd/` 基础结构（package.json、tsconfig.json、README.md）
2. 移动 JSON 数据文件
3. 移动 `default-loader.ts` 并更新导入路径
4. 移动解析脚本和 markdown 源文件
5. 更新 `core` 中的导出（删除 `createDataLoader` 导出）
6. 更新 `spellbook` 依赖和导入
7. 更新或移动测试文件
8. 删除 `core/static/srd/` 目录
9. 更新文档（AGENTS.md）
10. 运行 `pnpm install && pnpm build && pnpm test` 验证

### 性能考虑

- JSON 文件通过 Node.js native JSON import 加载，性能最优
- `content-srd` 无运行时依赖，包体积最小
- 解析脚本仅在开发时运行，不影响运行时性能
- `createDataLoader()` 返回的对象是单例模式，不重复加载 JSON

### 向后兼容

- `open20-core` 不再导出 `createDataLoader`，消费者需要改为从 `@open20/content-srd` 导入
- 这是 Breaking Change，需要升级指南
