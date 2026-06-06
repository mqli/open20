---
name: move-base-components-to-folder
overview: Move generic UI components to packages/ui/src/components/base/ and update all import paths
todos:
  - id: create-script
    content: 创建 Node.js 迁移脚本 move-base-components.mjs
    status: completed
  - id: run-script
    content: 运行脚本移动基础组件到 base/ 目录
    status: completed
    dependencies:
      - create-script
  - id: update-imports
    content: 更新所有内部 import 路径指向 base/ 子目录
    status: completed
    dependencies:
      - run-script
  - id: update-barrel-exports
    content: 更新 src/index.ts 的 barrel exports 路径
    status: completed
    dependencies:
      - update-imports
  - id: update-docs
    content: 更新 AGENTS.md 文档中的目录结构说明
    status: completed
    dependencies:
      - update-barrel-exports
  - id: verify-build
    content: 运行 pnpm build 验证构建成功
    status: completed
    dependencies:
      - update-docs
  - id: verify-typecheck
    content: 运行 pnpm typecheck 验证类型正确
    status: completed
    dependencies:
      - verify-build
  - id: verify-lint-test
    content: 运行 pnpm lint 和 pnpm test 验证代码质量和测试
    status: completed
    dependencies:
      - verify-typecheck
---

## 需求概述

在 `packages/ui` 中创建一个脚本，将所有通用基础 UI 组件移动到新文件夹 `base/` 下，并更新所有内部引用，最后验证更改是否正确。

## 核心功能

- 识别并移动 23 个基础组件到 `src/components/base/` 目录
- 更新所有内部 import 路径（使用 `@/` 别名的引用）
- 更新 `src/index.ts` 的 barrel exports
- 更新 `AGENTS.md` 文档
- 验证构建、类型检查、lint 和测试是否通过

## 基础组件列表（移动到 base/）

Badge, Button, CardSurface, Dialog, Divider, DropdownMenu, EmptyState, FilterChip, IconButton, Input, SectionHeader, Select, Sheet, Slider, SlotPips, Surface, Switch, Tabs, Text, ThemeToggle, Toggle, Tooltip, icons

## 保留在原位的组件（领域特定）

- `spell/` (SpellCard, SpellEditor)
- `rules/` (feat/, feature/)

## 技术栈

- 脚本语言：Node.js (原生 fs/path 模块)
- 包管理器：pnpm (monorepo 工作区)
- 构建工具：Turbo + TypeScript + Vite

## 实现方案

### 策略

创建一个 Node.js 脚本来自动化迁移过程，避免手动操作导致的错误。脚本将：

1. 创建 `base/` 目录
2. 移动组件目录
3. 使用字符串替换更新所有内部 import 路径
4. 更新 barrel export 文件

### 关键决策

- **使用 Node.js 脚本而非 bash**：需要处理复杂的 import 路径替换，Node.js 提供更可靠的跨平台文件操作
- **更新 `@/components/X` → `@/components/base/X`**：所有内部引用使用 `@/` 别名，需要统一更新
- **保留 barrel exports 的公共 API**：`src/index.ts` 的导出路径需要更新，但对外的 API 签名保持不变，外部消费者（spellbook）无需修改

### 需要更新的 import 模式

```
@/components/Button/* → @/components/base/Button/*
@/components/Text/* → @/components/base/Text/*
@/components/Badge/* → @/components/base/Badge/*
@/components/CardSurface/* → @/components/base/CardSurface/*
@/components/Surface/* → @/components/base/Surface/*
@/components/Input/* → @/components/base/Input/*
@/components/Select/* → @/components/base/Select/*
@/components/Switch/* → @/components/base/Switch/*
@/components/Toggle/* → @/components/base/Toggle/*
@/components/IconButton/* → @/components/base/IconButton/*
... 以及其他 15 个基础组件
```

### 受影响的文件

- `packages/ui/src/index.ts` - barrel exports
- `packages/ui/src/components/spell/**/*.tsx` - 引用基础组件
- `packages/ui/src/components/rules/**/*.tsx` - 引用基础组件
- 所有被移动的基础组件内部的相互引用

## 实现注意事项

- **性能**：使用同步文件操作即可，文件数量有限（约 100 个文件）
- **日志记录**：脚本应输出每个移动和替换操作的状态
- **回滚能力**：脚本运行前应先检查目标目录是否存在，避免覆盖
- **向后兼容**：barrel export 的公共 API 保持不变

## 目录结构变更

```
packages/ui/src/components/
├── base/                    # [NEW] 基础组件目录
│   ├── Badge/
│   ├── Button/
│   ├── CardSurface/
│   ├── Dialog/
│   ├── Divider/
│   ├── DropdownMenu/
│   ├── EmptyState/
│   ├── FilterChip/
│   ├── IconButton/
│   ├── Input/
│   ├── SectionHeader/
│   ├── Select/
│   ├── Sheet/
│   ├── Slider/
│   ├── SlotPips/
│   ├── Surface/
│   ├── Switch/
│   ├── Tabs/
│   ├── Text/
│   ├── ThemeToggle/
│   ├── Toggle/
│   ├── Tooltip/
│   └── icons/
├── spell/                   # [KEEP] 领域特定组件
└── rules/                   # [KEEP] 领域特定组件
```

## 验证步骤

1. `pnpm --filter @open20/ui build` - 验证构建
2. `pnpm --filter @open20/ui typecheck` - 验证类型
3. `pnpm --filter @open20/ui lint` - 验证代码风格
4. `pnpm --filter @open20/ui test` - 验证测试
5. `pnpm --filter @open20/spellbook build` - 验证外部消费者

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 探索 UI 包组件结构，识别所有需要更新的 import 路径
- Expected outcome: 获取完整的组件依赖图和 import 路径列表
