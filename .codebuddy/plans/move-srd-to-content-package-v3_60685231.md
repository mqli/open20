---
name: move-srd-to-content-package-v3
overview: core 保留 DataLoader 默认实现（无预设内容），content-srd 导出 SRD ContentPack，消费者通过 registerContentPack 注册内容。default-loader.ts 留在 core 但移除 SRD JSON 导入。
todos:
  - id: create-content-srd-package
    content: 创建 packages/content-srd/ 目录，添加 package.json、tsconfig.json、README.md、src/index.ts
    status: completed
  - id: move-srd-json
    content: 移动 core/static/srd/*.json（10个数据文件 + meta.json）到 content-srd/data/*.json，使用 git mv 保留历史
    status: completed
    dependencies:
      - create-content-srd-package
  - id: convert-lookup-tables
    content: 转换 core/static/srd/lookup-tables.json 为 core/src/data/lookup-tables.ts（TypeScript 常量）
    status: completed
  - id: update-default-loader
    content: 更新 core/src/data/default-loader.ts：移除 SRD JSON 导入，导入 lookup-tables.ts，createDataLoader() 返回空加载器
    status: completed
    dependencies:
      - convert-lookup-tables
  - id: create-srd-content-pack
    content: 创建 content-srd/src/index.ts：导入所有 SRD JSON 文件，构建并导出 srdContentPack
    status: completed
    dependencies:
      - move-srd-json
      - create-content-srd-package
  - id: update-spellbook
    content: 更新 spellbook：package.json 添加 @open20/content-srd 依赖，src/core/data-loader.ts 注册 srdContentPack
    status: completed
    dependencies:
      - create-content-srd-package
      - create-srd-content-pack
  - id: add-core-devdependency
    content: 添加 @open20/content-srd 为 core 的 devDependency（供测试使用）
    status: completed
    dependencies:
      - create-content-srd-package
  - id: update-test-setup
    content: 创建 core/tests/setup.ts 注册 SRD 内容包，更新 vitest.config.ts 使用 setup 文件
    status: completed
    dependencies:
      - add-core-devdependency
      - create-srd-content-pack
  - id: update-test-fixtures
    content: 更新 core/tests/fixtures/data-loader.ts 使用 createDataLoader() 并注册内容包
    status: completed
    dependencies:
      - update-default-loader
  - id: move-parse-scripts
    content: 移动解析脚本从 core/scripts/parse_srd_*.ts 到 content-srd/scripts/
    status: completed
    dependencies:
      - create-content-srd-package
  - id: move-markdown-sources
    content: 移动 SRD markdown 源文件从 core/requirements/ 到 content-srd/src/markdown/
    status: completed
    dependencies:
      - create-content-srd-package
  - id: cleanup-core
    content: 删除 core/static/srd/ 目录，更新 core/package.json "files" 字段移除 "static/"，更新 AGENTS.md 文档
    status: completed
    dependencies:
      - move-srd-json
      - convert-lookup-tables
      - update-default-loader
  - id: verify-build-and-tests
    content: 运行 pnpm install && pnpm build && pnpm test 验证迁移正确性
    status: completed
    dependencies:
      - update-spellbook
      - update-test-setup
      - cleanup-core
---

## 需求概述

将 SRD（System Reference Document）内容从 `packages/core` 抽取到独立的 `@open20/content-srd` 包，实现引擎与内容分离。

## 核心架构决策

- **core 保留 DataLoader 接口和默认实现**，但不包含任何内容数据
- **`lookup-tables.json` 是规则数据**（熟练加值、命中国定值、法术位表等），不是内容，应转为 TypeScript 文件保留在 core
- **content-srd 导出 `srdContentPack`**（由 SRD JSON 数据构建的 ContentPack 对象）
- **消费者（spellbook）** 调用 `createDataLoader()` 创建加载器，然后 `registerContentPack(srdContentPack)` 注册 SRD 内容
- **core 不依赖 content-srd**（core/package.json 中不含 @open20/content-srd）

## 迁移范围

### 从 core 移出的内容

1. **JSON 数据文件**（10个，不含 lookup-tables.json）：`core/static/srd/*.json` → `content-srd/data/*.json`

- `species.json`, `backgrounds.json`, `classes.json`, `subclasses.json`
- `feats.json`, `weapons.json`, `armor.json`, `gear.json`
- `spells.json`, `monsters.json`

2. **meta.json**：`core/static/srd/meta.json` → `content-srd/data/meta.json`
3. **解析脚本**（8个）：`core/scripts/parse_srd_*.ts` 等 → `content-srd/scripts/`
4. **SRD 源 markdown**：`core/requirements/**/srd-*.md` → `content-srd/src/markdown/`

### 保留在 core 的内容

1. **`src/data/loader.ts`**：DataLoader 接口定义
2. **`src/data/default-loader.ts`**：DataLoader 实现（修改后不含 SRD 内容）
3. **`src/data/lookup-tables.ts`**：由 `lookup-tables.json` 转换而来（规则数据）
4. **`src/content/types.ts`**：ContentPack 和 ContentPackMeta 接口
5. **`src/content/io.ts`**：exportContentPack/importContentPack/loadContentPack 函数
6. **`scripts/bundle.mjs`**、**`scripts/release.mjs`**：core 专属构建脚本

## 预期效果

- SRD 内容作为独立包分发，可被其他项目独立使用
- core 包职责更清晰（纯引擎，无内容依赖）
- 内容包版本可独立管理，支持未来扩展（如 homebrew 内容包）
- 消费者可自由选择使用哪些内容包

## 技术栈

- **包管理**：pnpm monorepo（已有 `pnpm-workspace.yaml`，包含 `packages/*`）
- **语言**：TypeScript（解析脚本）+ JSON（静态数据）
- **脚本运行**：`tsx`（直接运行 TypeScript 脚本，无需编译）
- **构建**：`content-srd` 无编译步骤（纯数据和脚本）；core 构建不依赖 content-srd

## 实现方案

### 目标依赖关系

```
open20-core                    @open20/content-srd
(提供 DataLoader 接口和默认实现)   (提供 srdContentPack)
     ↑                              ↑
     └────────── spellbook ─────────┘
        const loader = createDataLoader()
        loader.registerContentPack(srdContentPack)
```

- `content-srd` → 依赖 `open20-core`（编译时类型）
- `spellbook` → 依赖 `open20-core` + `@open20/content-srd`
- `open20-core` → 不依赖 `content-srd`

### 新包结构

```
packages/content-srd/
├── package.json                # 包定义，导出 srdContentPack
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
│   └── spells.json
│   └── monsters.json
├── src/
│   └── index.ts              # 导入 JSON 文件，构建并导出 srdContentPack
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
    "./data/*": "./data/*"
  },
  "files": ["dist/", "data/", "README.md"],
  "scripts": {
    "build": "tsc -p tsconfig.json && tsc-alias -p tsconfig.json"
  },
  "dependencies": {
    "open20-core": "workspace:*"
  },
  "devDependencies": {
    "@open20/config": "workspace:*",
    "typescript": "^5.9.3",
    "tsc-alias": "^1.8.17"
  }
}
```

#### 2. `lookup-tables.json` 转为 `core/src/data/lookup-tables.ts`

当前 `default-loader.ts` 导入 `lookup-tables.json` 并使用 `lookupTablesTyped` 变量来实现 `getProficiencyBonus()`、`getHitDieFixedValue()` 等方法。

转换后：

```typescript
// core/src/data/lookup-tables.ts
import type { LookupTables } from './loader';

export const lookupTables: LookupTables = {
  proficiencyBonus: {
    '1': 2,
    '2': 2,
    '3': 2,
    '4': 2,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 4,
    '10': 4,
    '11': 4,
    '12': 4,
    '13': 5,
    '14': 5,
    '15': 5,
    '16': 5,
    '17': 6,
    '18': 6,
    '19': 6,
    '20': 6,
  },
  hitDieFixedValue: {
    d4: 3,
    d6: 4,
    d8: 5,
    d10: 6,
    d12: 7,
    d20: 11,
  },
  multiclassSpellSlots: {
    // ... 多维职业法术位表
  },
  pactMagicSlots: {
    // ... Pact Magic 表
  },
  weaponMasteryProperties: ['Cleave', 'Graze', 'Nick', 'Push', 'Sap', 'Slow', 'Topple', 'Vex'],
  conditionNames: [
    'Blinded',
    'Charmed',
    'Deafened',
    'Exhaustion',
    'Frightened',
    'Grappled',
    'Incapacitated',
    'Invisible',
    'Paralyzed',
    'Petrified',
    'Poisoned',
    'Prone',
    'Restrained',
    'Stunned',
    'Unconscious',
    'Concentrating',
  ],
};
```

注意：`lookup-tables.json` 中的 `spellSlots` 字段（按职业存储的法术位表）未被 `default-loader.ts` 使用（`getSpellSlots()` 方法使用的是 `classesData` 中的 `spellSlotsByLevel`）。但这个数据可能对其他用途有用，可以保留在 `lookupTables` 对象中。

#### 3. `default-loader.ts` 的修改

**修改前**：

- 导入 11 个 SRD JSON 文件
- `createDataLoader()` 预注册 SRD 内容

**修改后**：

- 移除 SRD JSON 导入
- 导入 `lookupTables` from `./lookup-tables`
- `createDataLoader()` 返回空加载器（不预注册任何内容）
- 移除 `registeredPacks.set(srdMetaCached.id, srdMetaCached);`

```typescript
// data/default-loader.ts（修改后）
import type { DataLoader, LookupTables, SpellLevel } from './loader';
import type { ContentPack, ContentPackMeta } from '@/content/types';
import type { Species, SpeciesSubtype } from '@/types/species';
import type { Background } from '@/types/background';
import type { Class, Subclass } from '@/types/class';
import type { Feat, FeatCategory } from '@/types/feat';
import type { Weapon, Armor, GearItem } from '@/types/equipment';
import type { Spell } from '@/types/spell';
import type { DieType } from '@/types/dice';
import type { Monster } from '@/monster/types';

// 导入规则数据（从 TypeScript 文件）
import { lookupTables } from './lookup-tables';

// 可变的数据存储（初始为空）
let speciesData: Species[] = [];
let backgroundsData: Background[] = [];
// ... 其他数据数组初始化为空数组

const registeredPacks: Map<string, ContentPackMeta> = new Map();

// createDataLoader 工厂函数
export function createDataLoader(): DataLoader {
  // 重置数据（用于测试隔离）
  speciesData = [];
  backgroundsData = [];
  // ... 其他数据数组重置为空
  registeredPacks.clear();

  return {
    // ... 所有 DataLoader 方法实现
    // getProficiencyBonus, getHitDieFixedValue 等使用 lookupTables

    // 内容包管理
    registerContentPack(pack: ContentPack): void {
      registeredPacks.set(pack.meta.id, pack.meta);
      registerData(pack);
    },

    unregisterContentPack(packId: string): void {
      const meta = registeredPacks.get(packId);
      if (!meta) return;
      registeredPacks.delete(packId);
      unregisterData(meta.source);
    },

    getContentPacks(): ContentPackMeta[] {
      return Array.from(registeredPacks.values());
    },
  };
}
```

#### 4. `content-srd/src/index.ts` 的实现

```typescript
// content-srd/src/index.ts
import type { ContentPack } from 'open20-core/content';

// 导入所有 SRD JSON 文件
import metaJson from '../data/meta.json' with { type: 'json' };
import speciesJson from '../data/species.json' with { type: 'json' };
import backgroundsJson from '../data/backgrounds.json' with { type: 'json' };
import classesJson from '../data/classes.json' with { type: 'json' };
import subclassesJson from '../data/subclasses.json' with { type: 'json' };
import featsJson from '../data/feats.json' with { type: 'json' };
import weaponsJson from '../data/weapons.json' with { type: 'json' };
import armorJson from '../data/armor.json' with { type: 'json' };
import gearJson from '../data/gear.json' with { type: 'json' };
import spellsJson from '../data/spells.json' with { type: 'json' };
import monstersJson from '../data/monsters.json' with { type: 'json' };

// 构建 ContentPack 对象
export const srdContentPack: ContentPack = {
  meta: metaJson as unknown as ContentPackMeta,
  species: speciesJson as unknown as Species[],
  backgrounds: backgroundsJson as unknown as Background[],
  classes: classesJson as unknown as Class[],
  subclasses: subclassesJson as unknown as Subclass[],
  feats: featsJson as unknown as Feat[],
  weapons: weaponsJson as unknown as Weapon[],
  armor: armorJson as unknown as Armor[],
  gear: gearJson as unknown as GearItem[],
  spells: spellsJson as unknown as Spell[],
  monsters: monstersJson as unknown as Monster[],
};
```

#### 5. `spellbook` 的修改

`spellbook/src/core/data-loader.ts`：

```typescript
// 修改前
import { createDataLoader } from 'open20-core';

export const dataLoader = createDataLoader();
```

```typescript
// 修改后
import { createDataLoader } from 'open20-core';
import { srdContentPack } from '@open20/content-srd';

export const dataLoader = createDataLoader();
dataLoader.registerContentPack(srdContentPack);
```

`spellbook/package.json`：

```
{
  "dependencies": {
    "open20-core": "workspace:*",
    "@open20/content-srd": "workspace:*"
  }
}
```

#### 6. 测试文件的修改

**问题**：当前许多测试文件调用 `createDataLoader()` 并期望有预加载的 SRD 数据。

**解决方案**：测试文件需要注册 SRD 内容包。

**选项 A**：在测试 setup 文件中统一注册
**选项 B**：在每个测试文件中单独注册

建议使用**选项 A**，创建一个 `tests/setup.ts` 文件：

```typescript
// core/tests/setup.ts
import { createDataLoader } from '../src/data/loader';
import { srdContentPack } from '@open20/content-srd';

const dataLoader = createDataLoader();
dataLoader.registerContentPack(srdContentPack);

// 导出供测试使用
export { dataLoader };
```

然后更新 `vitest.config.ts` 来使用这个 setup 文件。

**或者**，更简单的方法：更新 `core/tests/fixtures/data-loader.ts`：

```typescript
// core/tests/fixtures/data-loader.ts
import type { DataLoader } from '../../src/data/loader';
import { createDataLoader } from '../../src/data/loader';
import { srdContentPack } from '@open20/content-srd';

export function createTestLoader(): DataLoader {
  const loader = createDataLoader();
  loader.registerContentPack(srdContentPack);
  return loader;
}
```

然后更新所有测试文件使用 `createTestLoader()` 而不是 `createDataLoader()`。

但需要确认这是否会影响太多测试文件。根据搜索结果，有 18 个测试文件使用 `createDataLoader()`。

**更简单的方案**：修改 `default-loader.ts`，使其接受一个可选参数：

```typescript
export function createDataLoader(options?: { registerSrd?: boolean }): DataLoader {
  // 重置数据
  // ...

  // 如果指定了 registerSrd，则注册 SRD 内容
  if (options?.registerSrd) {
    // 但这样就需要在 default-loader.ts 中导入 SRD 内容...
    // 这不符合架构
  }
}
```

这个方案不行，因为 default-loader.ts 不应该导入 SRD 内容。

**最终方案**：在 `core/package.json` 中添加 `@open20/content-srd` 作为 `devDependency`，然后创建一个 `tests/setup.ts` 文件来注册 SRD 内容包。

#### 7. `pnpm-workspace.yaml` 更新

当前配置：

```
packages:
  - 'packages/*'
```

已包含 `packages/*`，无需修改。`content-srd` 包会在 `packages/` 下自动被 workspace 识别。

### 实施顺序

1. 创建 `packages/content-srd/` 基础结构（package.json、tsconfig.json、README.md）
2. 移动 SRD JSON 数据文件到 `content-srd/data/`
3. 转换 `lookup-tables.json` 为 `core/src/data/lookup-tables.ts`
4. 更新 `default-loader.ts` 移除 SRD JSON 导入，使用 `lookup-tables.ts`
5. 创建 `content-srd/src/index.ts` 导出 `srdContentPack`
6. 更新 `spellbook` 依赖和导入
7. 更新测试文件（添加 `@open20/content-srd` 为 devDependency，注册内容包）
8. 删除 `core/static/srd/` 目录
9. 更新 `core/package.json` 的 "files" 字段
10. 更新文档（AGENTS.md）
11. 运行 `pnpm install && pnpm build && pnpm test` 验证

### 性能考虑

- JSON 文件通过 Node.js native JSON import 加载，性能最优
- `content-srd` 无运行时依赖，包体积最小
- 解析脚本仅在开发时运行，不影响运行时性能
- `createDataLoader()` 返回的对象是工厂模式，不重复加载 JSON
- `registerContentPack()` 是 O(n) 操作，但只在初始化时调用一次

### 向后兼容

- `open20-core` 仍然导出 `createDataLoader`，但返回的加载器不包含任何内容
- 这是 **Breaking Change**，需要更新指南
- 消费者需要改为同时依赖 `open20-core` 和 `@open20/content-srd`，并注册内容包

## Agent Extensions

无相关扩展。
