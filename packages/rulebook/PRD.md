# Rulebook Package - Product Requirements Document

> **Package Name**: `@open20/rulebook`
> **Version**: 0.1.0 (MVP)
> **Status**: 📋 Planned
> **Last Updated**: 2026-06-14 (v1.2 — post second review)
>
> **Changelog**:
>
> - v1.2: P0 修复 — `loadPack(path)` → `loadPack(packId)` 与 IStorage 对齐；ContentEditor 改为持有 pack 引用（去掉 packId 参数）；`_meta` 改为运行时内部状态并明确导出剥离策略；P1 补充 — 添加 Duplicate User Story；添加撤销操作能力；定义 SpellQuery 结构；定义导入冲突解决 API
> - v1.1: 修正 API 引用（`registerContentPack()` → `loadContentPack()`/`exportContentPack()`/`importContentPack()`）；明确 Zod schema 由 rulebook 自行定义；补全 11 种内容类型；决策存储方案（抽象接口 + IndexedDB）
> - v1.0: Initial PRD

---

## 1. Overview

### 1.1 Purpose

`rulebook` 是一个内容包管理工具包，为 D&D 5e 内容创作者提供完整的内容包创建、编辑、组织和分享工作流。

### 1.2 Problem Statement

当前 `open20-core` 提供了基础的内容包 IO 能力（`loadContentPack()` / `exportContentPack()` / `importContentPack()`，均在 `src/content/io.ts`），但缺少：

- 内容包的创建和编辑工具
- 内容组织和浏览界面
- 浏览器端可用的 JSON 导入/导出（core 的 IO 函数仅 Node.js）
- 内容验证和预览

### 1.3 Target Users

1. **内容创作者**：创建自定义种族、职业、法术、怪物等
2. **DM（地下城主）**：组织多个内容包用于战役
3. **玩家**：导入和使用社区内容包

---

## 2. Goals & Non-Goals

### 2.1 Goals

- **G1**: 提供内容包的完整 CRUD 操作
- **G2**: 支持 `ContentPack` 定义的 11 种内容类型（species, backgrounds, classes, subclasses, feats, spells, weapons, armors, gears, monsters, glossary）
- **G3**: JSON 导入/导出，兼容 `open20-core` 的 `ContentPack` 格式（`exportContentPack()` / `importContentPack()`）
- **G4**: 内容验证（rulebook 自行定义 Zod schema，因 core 仅提供 `CharacterSchema`，不含内容类型 schema）
- **G5**: 提供 React UI 组件库（可选，类似 `@open20/ui`）

### 2.2 Non-Goals

- ❌ 不作为游戏引擎（这是 `open20-core` 的职责）
- ❌ 不提供内容托管服务（仅本地文件管理）
- ❌ 不实现在线内容市场（但支持导入社区包）

---

## 3. User Stories

### 3.1 Content Creator Stories

| ID    | Story                                                                                                | Priority |
| ----- | ---------------------------------------------------------------------------------------------------- | -------- |
| US-1  | 作为内容创作者，我想创建新的内容包，设置名称、版本、作者信息                                         | P0       |
| US-2  | 作为内容创作者，我想向内容包添加自定义法术，填写名称、等级、学派等字段                               | P0       |
| US-3  | 作为内容创作者，我想编辑现有内容包中的法术，修改描述或伤害骰                                         | P0       |
| US-4  | 作为内容创作者，我想删除内容包中的某个法术                                                           | P1       |
| US-4a | 作为内容创作者，我想复制现有法术，在此基础上快速创建相似法术（如 Fireball → Delayed Blast Fireball） | P1       |
| US-4b | 作为内容创作者，我想撤销上次编辑操作，避免误操作丢失数据                                             | P1       |
| US-5  | 作为内容创作者，我想预览法术卡片效果（渲染为 SpellCard）                                             | P1       |
| US-6  | 作为内容创作者，我想导出内容包为 JSON 文件，分享给其他用户                                           | P0       |
| US-7  | 作为内容创作者，我想从 JSON 文件导入内容包                                                           | P0       |
| US-8  | 作为内容创作者，我想验证内容包数据的完整性（必填字段、类型检查）                                     | P0       |

### 3.2 DM Stories

| ID    | Story                                                         | Priority |
| ----- | ------------------------------------------------------------- | -------- |
| US-9  | 作为 DM，我想浏览所有已安装内容包的法术列表                   | P0       |
| US-10 | 作为 DM，我想按来源（SRD、Homebrew、Curse of Strahd）过滤内容 | P1       |
| US-11 | 作为 DM，我想搜索法术（按名称、等级、学派、职业）             | P0       |
| US-12 | 作为 DM，我想组织内容包（启用/禁用某个包）                    | P1       |

### 3.3 Developer Stories

| ID    | Story                                       | Priority |
| ----- | ------------------------------------------- | -------- |
| US-13 | 作为开发者，我想以编程方式创建内容包（API） | P1       |
| US-14 | 作为开发者，我想批量导入多个 JSON 文件      | P2       |

---

## 4. Package Architecture

### 4.1 Package Type

`rulebook` 将是一个 **monorepo 子包**，类似 `@open20/ui`：

```
packages/rulebook/
├── package.json          # @open20/rulebook
├── tsconfig.json
├── src/
│   ├── index.ts         # 公开 API
│   ├── types/           # 扩展的类型定义
│   ├── editor/          # 内容编辑逻辑
│   ├── validator/       # 内容验证
│   ├── io/             # 导入/导出
│   └── organizer/      # 内容组织逻辑
├── tests/
└── PRD.md              # 本文档
```

### 4.2 Dependencies

```
@open20/rulebook  →  open20-core  (workspace:*)
```

- 复用 `open20-core` 的 `ContentPack`, `ContentPackMeta` 类型
- 复用 `open20-core` 的 `Species`、`Spell`、`Monster` 等具体内容类型
- **自行定义** 所有 11 种内容类型的 Zod schema（core 仅提供 `CharacterSchema`，不含内容类型 schema）
- 不依赖 `@open20/ui` 或 `spellbook`（保持 headless）

### 4.3 Optional: React UI Package

如果需要 UI 组件，可以创建单独的 `@open20/rulebook-ui` 包：

```
packages/rulebook-ui/     # @open20/rulebook-ui
├── package.json
├── src/
│   ├── components/
│   │   ├── ContentPackEditor.tsx
│   │   ├── SpellEditor.tsx
│   │   ├── MonsterEditor.tsx
│   │   └── ...
│   └── index.ts
└── ...
```

依赖：`@open20/rulebook`, `@open20/ui`, `open20-core`

---

## 5. Features

### 5.1 Feature 1: Content Pack Organization (内容包组织)

#### 5.1.1 Content Pack Manager

管理多个内容包的生命周期：

```typescript
interface ContentPackManager {
  // 创建新内容包
  createPack(meta: ContentPackMeta): ContentPack;

  // 加载现有内容包（通过 packId 从 IStorage 读取）
  loadPack(packId: string): Promise<EditableContentPack | null>;

  // 保存内容包（持久化到 IStorage）
  savePack(pack: EditableContentPack): Promise<void>;

  // 列出所有内容包
  listPacks(): Promise<ContentPackMeta[]>;

  // 启用/禁用内容包
  enablePack(id: string): void;
  disablePack(id: string): void;

  // 删除内容包
  deletePack(id: string): Promise<void>;
}
```

#### 5.1.2 Content Browser (内容浏览器)

浏览和搜索内容包中的内容：

```typescript
interface ContentBrowser {
  // 获取所有内容（跨所有启用的包）
  getAllSpells(): Spell[];
  getAllMonsters(): Monster[];
  // ... 其他内容类型

  // 按包过滤
  getSpellsByPack(packId: string): Spell[];

  // 搜索（支持模糊匹配）
  searchSpells(query: SpellQuery): Spell[];
  searchMonsters(query: MonsterQuery): Monster[];
}

// 法术搜索查询
interface SpellQuery {
  // 名称搜索：大小写不敏感的模糊匹配（包含子串即命中），支持中英文
  name?: string;
  // 精确过滤：等级等于指定值
  level?: number;
  // 精确过滤：等级在范围内（与 level 互斥，同时提供时 level 优先）
  levelRange?: { min: number; max: number };
  // 精确过滤：学派匹配（枚举值）
  school?: SpellSchool;
  // 精确过滤：职业列表，法术的 classes 数组与给定数组有交集
  classes?: string[];
  // 来源过滤：精确匹配 source 字段
  source?: string;
  // 排序字段（默认 'name'）
  sortBy?: 'name' | 'level' | 'school';
  // 排序方向（默认 'asc'）
  sortOrder?: 'asc' | 'desc';
}

type SpellSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';
```

> **搜索策略说明**: `name` 字段为模糊匹配（子串包含，大小写不敏感），其余字段均为精确匹配或范围匹配。Phase 1 不做全文搜索（description 内容搜索）和中文分词，延后到 Phase 3 评估。

### 5.2 Feature 2: Content Editing (内容编辑)

`ContentEditor` 持有 `EditableContentPack` 引用（构造时传入），所有方法操作该 pack 实例，无需额外传递 `packId`。

```typescript
class ContentEditor {
  constructor(pack: EditableContentPack);

  // 当前绑定的内容包（只读）
  readonly pack: EditableContentPack;
}
```

#### 5.2.1 Add Content (添加内容)

向内容包添加新内容：

```typescript
class ContentEditor {
  // 添加法术
  addSpell(spell: Spell): void;

  // 添加怪物
  addMonster(monster: Monster): void;

  // 添加种族
  addSpecies(species: Species): void;

  // ... 其他内容类型
}
```

#### 5.2.2 Edit Content (编辑内容)

编辑现有内容：

```typescript
class ContentEditor {
  // 更新法术
  updateSpell(spellId: string, updates: Partial<Spell>): void;

  // 更新怪物
  updateMonster(monsterId: string, updates: Partial<Monster>): void;

  // ... 其他内容类型
}
```

#### 5.2.3 Delete Content (删除内容)

从内容包删除内容：

```typescript
class ContentEditor {
  removeSpell(spellId: string): void;
  removeMonster(monsterId: string): void;
  // ...
}
```

#### 5.2.4 Duplicate Content (复制内容)

复制已有内容项（生成新 ID，用于"复制再改"工作流）：

```typescript
class ContentEditor {
  // 复制法术（新 ID 自动生成：`${originalId}-copy`）
  duplicateSpell(spellId: string): Spell;

  // 复制怪物
  duplicateMonster(monsterId: string): Monster;

  // ... 其他内容类型
}
```

#### 5.2.5 Undo (撤销操作)

支持撤销最近的编辑操作（至少一步）：

```typescript
class ContentEditor {
  // 撤销上次操作
  undo(): void;

  // 是否可撤销
  readonly canUndo: boolean;
}
```

> **设计说明**: Phase 1 实现单步撤销（保存操作前的快照）。完整操作历史栈和多步撤销延后到 Phase 5。

#### 5.2.6 Content Templates (内容模板)

提供常用内容的模板：

```typescript
interface ContentTemplates {
  // 获取法术模板（空法术，带默认值）
  getSpellTemplate(): Spell;

  // 获取怪物模板
  getMonsterTemplate(): Monster;

  // ... 其他内容类型
}
```

### 5.4 Feature 4: Import Conflict Resolution (导入冲突解决)

导入内容包时可能遇到冲突，需要 API 级别的冲突检测与解决接口：

```typescript
// 冲突类型
type ConflictType = 'same-id' | 'same-name-different-id';

// 冲突条目
interface ConflictEntry {
  type: ConflictType;
  contentType: ContentTypeId; // 'spells', 'monsters', etc.
  existingId: string;
  existingName: string;
  incomingId: string;
  incomingName: string;
}

// 冲突解决策略
type ConflictResolution =
  | { strategy: 'keep-both'; newId: string } // 保留两者，为新条目分配 newId
  | { strategy: 'replace'; targetId: string } // 用导入条目替换已有条目
  | { strategy: 'skip' }; // 跳过该条目

// 导入结果
interface ImportResult {
  imported: number;
  skipped: number;
  replaced: number;
  conflicts: ConflictEntry[];
}

// 导入接口（扩展 ContentPackIO）
interface ContentPackIO {
  // 预检查冲突（不实际导入）
  checkImportConflicts(sourcePack: ContentPack, targetPackId: string): Promise<ConflictEntry[]>;

  // 执行导入（带冲突解决策略）
  importWithResolutions(
    sourcePack: ContentPack,
    targetPackId: string,
    resolutions: Map<string, ConflictResolution>, // key: `${contentType}:${incomingId}`
  ): Promise<ImportResult>;
}
```

> **设计说明**: `same-id` 是严格的 ID 冲突；`same-name-different-id` 是数据质量问题（如用户改了 ID 但名字相同）。UI 层（DESIGN 中的 ImportWizard Quick/Guided 模式）负责收集用户的解决策略，然后调用此 API 执行。

### 5.3 Feature 3: Import/Export (导入/导出)

#### 5.3.1 Export to JSON (导出为 JSON)

将内容包导出为 JSON 文件：

```typescript
interface ContentPackIO {
  // 导出整个内容包
  exportPack(packId: string): Promise<string>; // 返回 JSON 字符串
  exportPackToFile(packId: string, filePath: string): Promise<void>;

  // 导出单个内容类型
  exportSpells(packId: string): Promise<string>;
  exportMonsters(packId: string): Promise<string>;
}
```

JSON 格式示例：

```json
{
  "meta": {
    "id": "my-homebrew-spells",
    "name": "My Homebrew Spells",
    "version": "1.0.0",
    "source": "Homebrew",
    "author": "DM Awesome",
    "priority": 0
  },
  "spells": [
    {
      "id": "custom-fireball",
      "name": "Custom Fireball",
      "level": 3,
      "school": "Evocation",
      "classes": ["wizard", "sorcerer"],
      "castingTime": "1 action",
      "range": "150 feet",
      "components": { "V": true, "S": true, "M": "a tiny ball of bat guano" },
      "duration": "Instantaneous",
      "description": "...",
      "source": "Homebrew"
    }
  ]
}
```

#### 5.3.2 Import from JSON (从 JSON 导入)

从 JSON 文件导入内容包：

```typescript
interface ContentPackIO {
  // 从 JSON 字符串导入
  importPack(json: string): Promise<ContentPack>;

  // 从文件导入
  importPackFromFile(filePath: string): Promise<ContentPack>;

  // 合并导入（将内容合并到现有包）
  mergePack(targetPackId: string, sourcePack: ContentPack): void;
}
```

#### 5.3.3 Validation (验证)

导入/编辑时验证内容。**注意**: `open20-core` 仅提供 `CharacterSchema`，没有 Spell/Monster 等内容的 Zod schema。rulebook 需自行定义所有内容类型的验证 schema。

```typescript
// rulebook 自行定义的 Zod schema
import { z } from 'zod';

// Phase 1: 仅定义 Spell schema
export const SpellSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    school: z.enum([
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
    ]),
    classes: z.array(z.string()).min(1),
    castingTime: z.string().min(1),
    range: z.string().min(1),
    components: z
      .object({
        V: z.boolean().optional(),
        S: z.boolean().optional(),
        M: z.union([z.string(), z.boolean()]).optional(),
      })
      .optional(),
    duration: z.string().min(1),
    description: z.string().min(1),
    source: z.string().min(1),
  })
  .strict(); // 严格模式：不允许未定义字段

// 验证器接口
interface ContentValidator {
  validateSpell(spell: unknown): ValidationResult;
  validateMonster(monster: unknown): ValidationResult; // Phase 2
  // ... 其他内容类型 (Phase 2)
  validatePack(pack: unknown): ValidationReport; // 批量验证
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string; // 错误路径（如 "spells[0].level"）
  message: string; // 错误消息
  severity: 'error' | 'warning';
}
```

---

## 6. Data Model

### 6.1 Extended ContentPack

扩展 `open20-core` 的 `ContentPack` 类型，添加编辑元数据：

```typescript
// packages/rulebook/src/types.ts

import { ContentPack as CoreContentPack, ContentPackMeta } from 'open20-core';

export interface EditableContentPack extends CoreContentPack {
  meta: ContentPackMeta & {
    // 扩展字段
    description?: string;
    homepage?: string;
    dependencies?: string[]; // 依赖的其他内容包
  };
}
```

#### 6.1.1 运行时编辑状态（不序列化）

编辑元数据作为 **运行时内部状态**，不存储在 `EditableContentPack` 对象中，由 `ContentEditor` 内部维护：

```typescript
// packages/rulebook/src/editor/edit-state.ts

/** 运行时编辑状态 — 不序列化到 JSON，不污染导出格式 */
export interface EditState {
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  undoStack: UndoEntry[]; // 撤销栈
}

// ContentEditor 内部持有 EditState
class ContentEditor {
  private editState: EditState;

  constructor(pack: EditableContentPack) {
    this.editState = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      undoStack: [],
    };
  }
}
```

#### 6.1.2 导出策略

`exportPack()` 导出时 **剥离所有运行时状态**，输出纯净的 `ContentPack` 格式：

```typescript
function exportPack(pack: EditableContentPack, editState: EditState): string {
  // 1. 深拷贝 pack，移除所有非 core 字段
  // 2. 仅保留 ContentPack 接口定义的字段（meta, spells, monsters, ...）
  // 3. meta 仅保留 ContentPackMeta 标准字段（id, name, version, source, author, priority）
  // 4. 序列化为 JSON
  const { meta, ...content } = pack;
  const cleanMeta: ContentPackMeta = {
    id: meta.id,
    name: meta.name,
    version: meta.version,
    source: meta.source,
    author: meta.author,
    priority: meta.priority,
  };
  return JSON.stringify({ meta: cleanMeta, ...content });
}
```

> **关键约束**: 导出的 JSON 必须可直接用于 `open20-core` 的 `importContentPack()`，不能包含任何 core 不认识的字段（满足 G3）。

### 6.2 Content Type Registry

注册所有 11 种 `ContentPack` 支持的内容类型（与 `open20-core` 的 `ContentPack` 接口对齐）：

```typescript
// packages/rulebook/src/types/registry.ts

export interface ContentTypeDescriptor {
  id: ContentTypeId; // 'spell', 'monster', 'species', etc.
  name: string; // 显示名称
  schema: ZodSchema; // 验证 schema（rulebook 自行定义）
  template: () => unknown; // 创建空模板
}

export type ContentTypeId =
  | 'species'
  | 'backgrounds'
  | 'classes'
  | 'subclasses'
  | 'feats'
  | 'spells'
  | 'weapons'
  | 'armors'
  | 'gears'
  | 'monsters'
  | 'glossary';

export const contentTypes: ContentTypeDescriptor[] = [
  // Phase 1: 仅定义 Spell
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
  // Phase 2: 其余 10 种类型
  // { id: 'species',    name: 'Species',     schema: SpeciesSchema,     template: getSpeciesTemplate },
  // { id: 'backgrounds',name: 'Backgrounds', schema: BackgroundSchema,  template: getBackgroundTemplate },
  // { id: 'classes',    name: 'Classes',     schema: ClassSchema,       template: getClassTemplate },
  // { id: 'subclasses', name: 'Subclasses',  schema: SubclassSchema,    template: getSubclassTemplate },
  // { id: 'feats',      name: 'Feats',       schema: FeatSchema,        template: getFeatTemplate },
  // { id: 'weapons',    name: 'Weapons',     schema: WeaponSchema,      template: getWeaponTemplate },
  // { id: 'armors',     name: 'Armors',      schema: ArmorSchema,       template: getArmorTemplate },
  // { id: 'gears',      name: 'Gears',       schema: GearSchema,        template: getGearTemplate },
  // { id: 'monsters',   name: 'Monsters',    schema: MonsterSchema,     template: getMonsterTemplate },
  // { id: 'glossary',   name: 'Glossary',    schema: GlossarySchema,    template: getGlossaryTemplate },
];
```

---

## 7. API Design

### 7.1 Core API (Headless)

```typescript
// packages/rulebook/src/index.ts

// 内容包管理
export { ContentPackManager } from './manager';
export type { ContentPackManager } from './manager';

// 内容编辑
export { ContentEditor } from './editor';
export type { ContentEditor } from './editor';

// 内容浏览
export { ContentBrowser } from './browser';
export type { ContentBrowser } from './browser';

// 导入/导出
export { exportPack, importPack, validatePack } from './io';

// 验证
export { validateContent, ValidationError } from './validator';

// 模板
export { getTemplate } from './templates';
```

### 7.2 Usage Example

```typescript
import { ContentPackManager, ContentEditor, exportPack } from '@open20/rulebook';

// 创建内容包
const manager = new ContentPackManager();
const pack = manager.createPack({
  id: 'my-homebrew',
  name: 'My Homebrew Content',
  version: '1.0.0',
  source: 'Homebrew',
  author: 'DM Awesome',
});

// 编辑内容包（ContentEditor 持有 pack 引用）
const editor = new ContentEditor(pack);
editor.addSpell({
  id: 'custom-spell',
  name: 'Custom Spell',
  level: 2,
  school: 'Evocation',
  // ...
});

// 复制法术（复制再改工作流）
const copied = editor.duplicateSpell('custom-spell');
// copied.id === 'custom-spell-copy'

// 撤销上次操作
editor.undo();

// 保存到 IndexedDB
await manager.savePack(pack);

// 导出（自动剥离运行时状态，输出纯净 ContentPack JSON）
const json = await exportPack(pack);
console.log(json);
```

---

## 8. Integration with Existing Packages

### 8.1 Integration with `open20-core`

- 复用 `ContentPack`, `ContentPackMeta` 类型（来自 `open20-core` 的 `src/content/types.ts`）
- 复用 `Species`, `Spell`, `Monster` 等具体内容类型
- 自行定义所有 11 种内容类型的 Zod schema（core 中仅存在 `CharacterSchema`）
- JSON 格式兼容 `open20-core` 的 `exportContentPack()` / `importContentPack()`（`src/content/io.ts`，Node.js only）
- `rulebook` 提供浏览器可用的 `loadContentPack()` 等价物（基于 IndexedDB 存储层）

```typescript
// rulebook 导出的 JSON 可直接用于 open20-core 的 importContentPack()
import { importContentPack } from 'open20-core';
import { exportPackToJson } from '@open20/rulebook';

const json = await exportPackToJson('my-homebrew');
importContentPack(JSON.parse(json), './output-dir/');

// rulebook 也可以加载 open20-core 导出的 JSON
import { exportContentPack } from 'open20-core';
import { importPackFromJson } from '@open20/rulebook';

const pack = exportContentPack('./static/srd/'); // Node.js
await importPackFromJson(JSON.stringify(pack)); // 浏览器端存储
```

### 8.2 Integration with `@open20/ui` (Optional)

如果创建 `@open20/rulebook-ui` 包：

- 复用 `@open20/ui` 的基础组件（Button, Input, Card 等）
- 使用 `SpellCard` 预览法术
- 使用 `MonsterCard` 预览怪物

### 8.3 Integration with `spellbook` (Optional)

`spellbook` 应用可以集成 `rulebook` 功能：

- 在法术书应用中添加"内容管理"页面
- 允许用户创建和导入自定义内容包

---

## 9. Implementation Phases

> **Agent Task Documents**: Phase 1 has been split into self-contained task docs for agent-driven development.
> See [tasks/](./tasks/) for individual task specs with exact interfaces, file paths, and test requirements.

### Phase 1: MVP (Minimum Viable Product)

**Goal**: 基本的 headless 内容包管理功能 + 法术编辑

**存储方案决策**（必须在 Phase 1 开始时确定）:

- 采用 **抽象存储接口 + IndexedDB 实现**（rulebook-ui 为 React Web app）
- 文件系统适配器延后到 CLI 工具阶段（Phase 5）

**Scope**:

- [ ] 创建 `packages/rulebook/` 包结构
- [ ] 定义抽象存储接口 `IStorage` + IndexedDB 实现
- [ ] 实现 `ContentPackManager`（创建、加载、保存、启用/禁用、删除）
- [ ] 实现 `ContentEditor`（添加、编辑、删除法术 — **仅 Spell**）
- [ ] 实现 `ContentEditor.duplicateSpell()` 复制法术功能
- [ ] 实现 `ContentEditor.undo()` 单步撤销
- [ ] 实现 `exportPack()` / `importPack()`（JSON 序列化，兼容 core 的 `ContentPack` 格式，导出时剥离运行时状态）
- [ ] **自行定义** `SpellSchema`（Zod），core 中不存在内容类型 schema
- [ ] 实现基本验证（基于 SpellSchema 的 `safeParse`）
- [ ] 编写单元测试

**Agent Tasks**:

| Task | File                                                           | Description                                  |
| ---- | -------------------------------------------------------------- | -------------------------------------------- |
| A    | [tasks/A-scaffold.md](./tasks/A-scaffold.md)                   | Package scaffold & monorepo integration      |
| B    | [tasks/B-types-storage.md](./tasks/B-types-storage.md)         | Types, IStorage, IndexedDBStorage            |
| C    | [tasks/C-manager.md](./tasks/C-manager.md)                     | ContentPackManager                           |
| D    | [tasks/D-validation-editor.md](./tasks/D-validation-editor.md) | SpellSchema, ContentValidator, ContentEditor |
| E    | [tasks/E-import-export.md](./tasks/E-import-export.md)         | Export, Import, Conflict Resolution          |
| F    | [tasks/F-browser.md](./tasks/F-browser.md)                     | ContentBrowser, SpellQuery, Search           |

See [tasks/README.md](./tasks/README.md) for dependency graph and execution order.

**Phase 1 不做**:

- ✗ 其他 10 种内容类型的编辑和 schema（延后到 Phase 2）
- ✗ UI 组件（Phase 4）
- ✗ 文件系统存储适配器（Phase 5）

**Deliverable**: `@open20/rulebook` v0.1.0

### Phase 2: Extended Content Types

**Goal**: 支持 ContentPack 定义的全部 11 种内容类型（与 `open20-core` 的 `ContentPack` 接口对齐）

| 序号 | 内容类型    | ContentPack 字段 | Phase 1 | Phase 2 |
| ---- | ----------- | ---------------- | ------- | ------- |
| 1    | Spells      | `spells`         | ✅      | -       |
| 2    | Species     | `species`        | -       | ✅      |
| 3    | Backgrounds | `backgrounds`    | -       | ✅      |
| 4    | Classes     | `classes`        | -       | ✅      |
| 5    | Subclasses  | `subclasses`     | -       | ✅      |
| 6    | Feats       | `feats`          | -       | ✅      |
| 7    | Weapons     | `weapons`        | -       | ✅      |
| 8    | Armors      | `armors`         | -       | ✅      |
| 9    | Gears       | `gears`          | -       | ✅      |
| 10   | Monsters    | `monsters`       | -       | ✅      |
| 11   | Glossary    | `glossary`       | -       | ✅      |

- [ ] 为剩余 10 种内容类型定义 Zod schema
- [ ] 实现各类型的模板函数（`getXxxTemplate()`）
- [ ] 扩展 `ContentEditor` 支持所有内容类型
- [ ] 更新 `ContentTypeRegistry` 注册全部 11 种类型
- [ ] 扩展导入/导出涵盖所有内容类型
- [ ] 为每种类型编写验证测试

**Deliverable**: `@open20/rulebook` v0.2.0

### Phase 3: Content Browser & Search

**Goal**: 提供内容浏览和搜索功能

- [ ] 实现 `ContentBrowser`
- [ ] 实现跨包搜索
- [ ] 实现按来源过滤
- [ ] 添加内容预览（使用 `open20-core` 的查询函数）

**Deliverable**: `@open20/rulebook` v0.3.0

### Phase 4: React UI Components (Optional)

**Goal**: 提供 React UI 组件库

- [ ] 创建 `@open20/rulebook-ui` 包
- [ ] 实现 `ContentPackEditor` 组件
- [ ] 实现 `SpellEditor` 组件
- [ ] 实现 `MonsterEditor` 组件
- [ ] 实现导入/导出向导
- [ ] 编写 Storybook 文档

**Deliverable**: `@open20/rulebook-ui` v0.1.0

### Phase 5: Advanced Features (Future)

- [ ] 内容包依赖管理
- [ ] 内容版本控制（迁移旧格式）
- [ ] 批量操作（批量导入、批量删除）
- [ ] `FileSystemStorage` 适配器（Node.js 文件系统，CLI 使用）
- [ ] CLI 工具（`rulebook create`, `rulebook validate`, `rulebook export`）
- [ ] 内容包发布到 npm

---

## 10. Technical Requirements

### 10.1 TypeScript

- `strict: true`
- `noUncheckedIndexedAccess: true`
- 复用 `open20-core` 的类型定义

### 10.2 Testing

- 单元测试覆盖率 > 80%
- 集成测试：导入/导出真实 JSON 文件
- 验证测试：测试各种无效输入

### 10.3 Performance

- 支持大型内容包（1000+ 法术）
- 搜索应即时响应（< 100ms）
- 导入/导出不应阻塞主线程（使用 Web Workers 如果必要）

### 10.4 Storage

- Phase 1: 抽象存储接口 `IStorage` + IndexedDB 实现
- Phase 5: 文件系统适配器（CLI 使用）
- 不使用 Node.js `fs` 模块（保持浏览器兼容）

---

## 11. Decisions & Open Questions

### 11.1 已决策事项

#### 11.1.1 存储方案 ✅ DECIDED

| 决策                                                      | 理由                                           |
| --------------------------------------------------------- | ---------------------------------------------- |
| Phase 1 采用 **抽象存储接口 `IStorage` + IndexedDB 实现** | rulebook-ui 是 React Web app，需要浏览器持久化 |
| 文件系统适配器延后到 Phase 5 CLI 工具阶段                 | Node.js 文件 IO 不是 Phase 1~4 的需求          |

```typescript
// 抽象存储接口
export interface IStorage {
  savePack(pack: EditableContentPack): Promise<void>;
  loadPack(packId: string): Promise<EditableContentPack | null>;
  listPacks(): Promise<ContentPackMeta[]>;
  deletePack(packId: string): Promise<void>;
}

// Phase 1: IndexedDB 实现
export class IndexedDBStorage implements IStorage {
  /* ... */
}

// Phase 5: 文件系统实现（CLI 使用）
export class FileSystemStorage implements IStorage {
  /* ... */
}
```

- IndexedDB 容量：通常 50MB~无限制（取决于浏览器）
- 内容包平均大小预估：10KB~500KB（JSON）

#### 11.1.2 Zod 验证严格程度 ✅ DECIDED

- 采用 **严格模式**（`z.strict()`）：只允许 schema 中定义的字段
- 拒绝未知字段，提供明确的错误路径和消息
- 对 typescript 定义存在但 Zod schema 中尚未支持的字段：先报 warning，不阻塞

#### 11.1.3 Headless 优先策略 ✅ DECIDED

- 先发布 headless 包（Phase 1-3），然后根据用户反馈决定是否创建 UI 包（Phase 4）
- `@open20/rulebook` 保持零 UI 依赖
- `@open20/rulebook-ui` 作为独立可选包

### 11.2 待定问题

1. **内容包格式**：是否支持分包导出（一个包包含多个 JSON 文件，如 `spells.json`, `monsters.json`）？
   - `open20-core` 的 `importContentPack()` / `exportContentPack()` 支持多文件格式
   - 当前方案：统一 JSON 优先（单文件），多文件格式在 Phase 2 中评估

### 11.3 已解决问题（来自第二轮评审）

| #   | 问题                                                         | 解决方案                                                                                                                                                                                   |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `ContentPackManager.loadPack(path: string)` 与浏览器端矛盾   | 改为 `loadPack(packId: string)`，与 `IStorage` 接口对齐；返回 `EditableContentPack \| null`                                                                                                |
| 2   | `ContentEditor` 方法签名需要 `packId` 但用例传入 `pack` 对象 | `ContentEditor` 改为持有 `pack` 引用（构造时传入），方法签名去掉 `packId`                                                                                                                  |
| 3   | `EditableContentPack._meta` 下划线前缀会污染导出 JSON        | `_meta` 改为运行时内部状态 `EditState`，由 `ContentEditor` 内部维护；`exportPack()` 明确剥离策略，输出纯净 `ContentPack` 格式                                                              |
| 4   | 缺少"复制/克隆内容项" User Story                             | 添加 US-4a 及 `duplicateSpell()` API                                                                                                                                                       |
| 5   | 缺少撤销操作能力                                             | 添加 US-4b 及 `undo()` / `canUndo` API；Phase 1 单步撤销，多步撤销延后 Phase 5                                                                                                             |
| 6   | 搜索能力定义不具体，`SpellQuery` 未定义                      | 定义 `SpellQuery` 结构：`name` 模糊匹配，其余精确/范围匹配；Phase 1 不做全文搜索和中文分词                                                                                                 |
| 7   | 导入冲突只处理同 ID，缺少 API 级别冲突解决接口               | 新增 §5.4 定义 `ConflictType`（`same-id` / `same-name-different-id`）、`ConflictResolution`（`keep-both` / `replace` / `skip`）、`checkImportConflicts()` 和 `importWithResolutions()` API |

---

## 12. Success Metrics

- **Adoption**: 内容创作者创建的内容包数量
- **Quality**: 导出的内容包能够被 `open20-core` 成功加载（无验证错误）
- **Performance**: 导入 1000 条记录 < 1 秒
- **Developer Experience**: API 易于使用（通过用户反馈评估）

---

## 13. Appendices

### Appendix A: Related Issues

- 无

### Appendix B: References

- [open20-core AGENTS.md](../core/AGENTS.md)
- [open20-core Content Module](../core/src/content/)
- [D&D 5e SRD 5.2](https://dnd.wizards.com/resources/systems-reference-document)

---

_End of PRD_
