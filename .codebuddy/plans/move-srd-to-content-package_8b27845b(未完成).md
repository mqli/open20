---
name: move-srd-to-content-package
overview: Extract SRD content (JSON data, source markdown, parsing scripts) from packages/core into a new packages/content-srd package. This separates content from engine logic, enables independent content updates, and supports future content packs (e.g., homebrew).
todos:
  - id: create-content-srd-package
    content: 创建 packages/content-srd/ 目录和 package.json、tsconfig.json、README.md
    status: pending
  - id: move-json-data
    content: 移动 core/static/srd/*.json 到 content-srd/data/*.json（11个文件）
    status: pending
    dependencies:
      - create-content-srd-package
  - id: move-markdown-sources
    content: 移动 SRD markdown 源文件到 content-srd/src/markdown/
    status: pending
    dependencies:
      - create-content-srd-package
  - id: move-parse-scripts
    content: 移动解析脚本到 content-srd/scripts/，并将类型导入改为 any
    status: pending
    dependencies:
      - create-content-srd-package
  - id: update-core-dependency
    content: 更新 core/package.json 添加 @open20/content-srd 依赖
    status: pending
    dependencies:
      - create-content-srd-package
  - id: update-default-loader-imports
    content: 更新 default-loader.ts 中的 11 个 JSON 导入路径
    status: pending
    dependencies:
      - update-core-dependency
  - id: update-test-imports
    content: 更新所有测试文件中的 JSON 导入路径（integrity.test.ts 和 combat 测试）
    status: pending
    dependencies:
      - update-default-loader-imports
  - id: update-test-content-management
    content: 更新 content-management.test.ts 中的 static/srd/ 路径引用
    status: pending
    dependencies:
      - update-default-loader-imports
  - id: cleanup-and-documentation
    content: 删除 core/static/srd/ 目录，更新 AGENTS.md 文档
    status: pending
    dependencies:
      - update-test-imports
      - update-test-content-management
  - id: verify-build-and-tests
    content: 运行 pnpm build、pnpm test 验证迁移正确性
    status: pending
    dependencies:
      - cleanup-and-documentation
---

## 需求概述

将 SRD（System Reference Document）相关内容从 `packages/core` 移动到新的独立包 `packages/content-srd/`，实现内容包的独立管理和分发。

## 核心功能

1. **JSON 数据文件迁移**：将 `core/static/srd/*.json`（11个数据文件）移动到 `content-srd/data/`
2. **Markdown 源文件迁移**：将 `core/requirements/` 中的 SRD 相关 markdown 文件移动到 `content-srd/src/markdown/`
3. **解析脚本迁移**：将 `core/scripts/parse_srd_*.ts` 等解析脚本移动到 `content-srd/scripts/`
4. **依赖更新**：更新 `core` 的 `package.json` 添加对 `@open20/content-srd` 的依赖
5. **导入路径更新**：更新 `default-loader.ts` 和所有测试文件中的 JSON 导入路径
6. **解决循环依赖**：解析脚本中使用的 core 类型导入改为 `any` 类型，避免 `content-srd` 对 `core` 的运行时依赖

## 保留在 core 的文件

- `scripts/bundle.mjs` 和 `scripts/release.mjs`（core 专属构建脚本）
- `requirements/` 中非 SRD 相关的需求文档

## 预期效果

- SRD 内容作为独立包分发，可被其他项目独立使用
- `core` 包体积减小，职责更清晰
- 内容包版本可独立管理

## 技术栈

- **包管理**: pnpm monorepo（已有 `pnpm-workspace.yaml`）
- **语言**: TypeScript（解析脚本）
- **数据类型**: JSON（静态数据文件）
- **脚本运行**: `tsx`（直接运行 TypeScript 脚本，无需编译）

## 实现方案

### 架构设计

**当前依赖关系**：

```
@open20/spellbook → @open20/ui → open20-core
```

**目标依赖关系**：

```
open20-core → @open20/content-srd (运行时依赖，JSON 数据)
@open20/content-srd (无运行时依赖，解析脚本使用 any 类型避免依赖 core)
```

**解决循环依赖的方案**：
解析脚本中当前使用 `import type` 从 `core/src/types/` 导入类型。移动到 `content-srd` 后，将这些类型改为 `any`，避免 `content-srd` 对 `core` 的编译时/运行时依赖。

### 新包结构

```
packages/content-srd/
├── package.json           # 包定义，导出 JSON 文件
├── tsconfig.json          # TypeScript 配置（用于脚本开发）
├── README.md             # 文档
├── data/                 # JSON 数据（从 core/static/srd/ 移动）
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
│   └── markdown/        # SRD 源 Markdown（从 core/requirements/ 移动）
│       ├── srd-5.2-spell-list.md
│       ├── srd-5.2-monsters.md
│       ├── srd-5.2-feat.md
│       └── classes/
│           ├── 01_Barbarian.md
│           ├── 02_Bard.md
│           └── ... (12 个职业文件)
└── scripts/              # 解析脚本（从 core/scripts/ 移动）
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
  "exports": {
    "./data/*": "./data/*"
  },
  "files": ["data/", "src/"],
  "keywords": ["dnd", "dnd2024", "srd", "content"],
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}
```

（不需要 `main` 字段，因为这是一个纯数据包）

#### 2. 解析脚本的类型处理

移动后，解析脚本中的类型导入需要改为 `any`：

**修改前**（`parse_srd_markdown.ts`）：

```typescript
import type {
  Spell,
  SpellDamage,
  SpellHeal,
  CantripUpgradeEntry,
  CastingTime,
  SpellSchool,
} from '../src/types/spell';
import type { DamageEntry, DamageType } from '../src/types/damage';
```

**修改后**：

```typescript
// 移除类型导入，使用 any
```

函数签名改为：

```typescript
export function transformSpell(parsed: ParsedSpell): any {
  // ... 现有逻辑，返回对象
}
```

#### 3. JSON 导入路径更新

**修改前**（`default-loader.ts`）：

```typescript
import speciesDataJson from '../../static/srd/species.json' with { type: 'json' };
```

**修改后**：

```typescript
import speciesDataJson from '@open20/content-srd/data/species.json' with { type: 'json' };
```

#### 4. 测试文件导入路径更新

**修改前**：

```typescript
import monstersArray from '../../../static/srd/monsters.json';
```

**修改后**：

```typescript
import monstersArray from '@open20/content-srd/data/monsters.json';
```

### 文件变更清单

| 操作   | 文件路径                                                                                     | 说明                                   |
| ------ | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| NEW    | `packages/content-srd/package.json`                                                          | 新包定义                               |
| NEW    | `packages/content-srd/tsconfig.json`                                                         | TypeScript 配置                        |
| NEW    | `packages/content-srd/README.md`                                                             | 文档                                   |
| MOVE   | `core/static/srd/*.json` → `content-srd/data/*.json`                                         | 11 个 JSON 文件                        |
| MOVE   | `core/requirements/05-spell-management/srd-5.2-spell-list.md` → `content-srd/src/markdown/`  | 法术源文件                             |
| MOVE   | `core/requirements/28-monster-support/srd-5.2-monsters.md` → `content-srd/src/markdown/`     | 怪物源文件                             |
| MOVE   | `core/requirements/02-character-creation/srd-5.2-feat.md` → `content-srd/src/markdown/`      | 专长源文件                             |
| MOVE   | `core/requirements/02-character-creation/classes/*.md` → `content-srd/src/markdown/classes/` | 职业源文件（12个）                     |
| MOVE   | `core/scripts/parse_srd_*.ts` → `content-srd/scripts/`                                       | 8 个解析脚本                           |
| MODIFY | `core/package.json`                                                                          | 添加 `@open20/content-srd` 依赖        |
| MODIFY | `core/src/data/default-loader.ts`                                                            | 更新 11 个 JSON 导入路径               |
| MODIFY | `core/tests/data/integrity.test.ts`                                                          | 更新 9 个 JSON 导入路径                |
| MODIFY | `core/tests/integration/combat-scenarios/*.test.ts`                                          | 更新 monsters.json 导入路径（4个文件） |
| MODIFY | `core/tests/content/content-management.test.ts`                                              | 更新 `static/srd/` 路径引用            |
| DELETE | `core/static/srd/`                                                                           | 删除空目录                             |

### 实施要点

1. **保持 JSON 文件不变**：只移动位置，不修改内容
2. **使用 `git mv`**：保留 git 历史记录
3. **先创建新包，再修改 core**：避免中间状态破坏构建
4. **类型安全妥协**：解析脚本使用 `any` 类型，但输出 JSON 通过 `default-loader.ts` 的类型断言保证类型安全
5. **无构建步骤**：`content-srd` 是纯数据和脚本包，不需要编译

## 性能考虑

- JSON 文件通过 native JSON import 加载，性能最优
- 无运行时依赖，包体积最小
- 解析脚本仅在开发时运行，不影响运行时性能
