---
name: verify-completed-features-and-add-tests
overview: 验证 requirements/README.md 中标记为"✅ Completed"的15个特性是否真正完成，并为缺少测试的特性补充测试用例
todos:
  - id: verify-implementations
    content: 验证15个已标记"完成"功能的实际实现状态
    status: completed
  - id: create-missing-folders
    content: 为FR-011, FR-014-FR-017创建需求文件夹和spec.md
    status: completed
    dependencies:
      - verify-implementations
  - id: add-storage-tests
    content: 添加FR-003离线存储测试(storage-service.test.ts)
    status: completed
    dependencies:
      - verify-implementations
  - id: add-spell-action-tests
    content: 添加FR-016/017法术动作测试(SpellActionRow.test.tsx, DiceRollOverlay.test.tsx)
    status: completed
    dependencies:
      - verify-implementations
  - id: add-spell-display-tests
    content: 添加FR-012/013/014/015法术显示测试(SpellDetailFlyout.test.tsx, SpellCardWrapper.test.tsx)
    status: completed
    dependencies:
      - verify-implementations
  - id: add-concentration-tests
    content: 添加FR-011专注状态测试(ConcentrationToggle.test.tsx, ConcentrationBanner.test.tsx)
    status: completed
    dependencies:
      - verify-implementations
  - id: supplement-existing-tests
    content: 补充现有测试文件(character-store.test.ts, spell-store.test.ts)
    status: completed
    dependencies:
      - add-storage-tests
  - id: update-readme-progress
    content: 更新README.md进度跟踪和完成百分比
    status: completed
    dependencies:
      - create-missing-folders
      - supplement-existing-tests
---

## 用户需求分析

用户要求检查标记为"已完成"的功能特性，并为这些特性添加必要的测试用例。

## 当前状态

README.md 标记了15个功能为"✅ Completed"（FR-001 至 FR-008, FR-010 至 FR-017），但存在以下问题：

1. **文档与实现不一致**：

- FR-011, FR-014, FR-015, FR-016, FR-017 标记为已完成，但缺少需求文件夹
- 部分 spec.md 文件仍显示状态为"📋 Planned"
- README.md 中的完成百分比显示0%（应为约57%或更高）

2. **测试覆盖不足**：

- 目前仅有7个测试文件
- 多个已标记"完成"的功能缺少测试用例或测试覆盖不完整

## 核心功能

- 验证15个标记为"已完成"的功能是否真正实现
- 为缺少测试的功能添加测试用例
- 创建缺失的需求文件夹（FR-011, FR-014-FR-017）
- 更新 README.md 以反映实际进度
- 确保测试覆盖率达到要求（P0功能80%+, P1功能70%+）

## 受影响的功能

| 功能ID | 功能名称        | 实现状态  | 测试状态    | 需要操作                        |
| ------ | --------------- | --------- | ----------- | ------------------------------- |
| FR-003 | 离线存储        | ✅ 已实现 | ❌ 无测试   | 添加 storage-service.test.ts    |
| FR-006 | 角色创建        | ✅ 已实现 | ⚠️ 部分测试 | 补充测试用例                    |
| FR-010 | 法术位消耗/恢复 | ✅ 已实现 | ⚠️ 部分测试 | 补充测试用例                    |
| FR-011 | 专注状态标记    | ✅ 已实现 | ❌ 无测试   | 创建文件夹+添加测试             |
| FR-012 | 法术详情页      | ✅ 已实现 | ❌ 无测试   | 添加 SpellDetailFlyout.test.tsx |
| FR-013 | 成分详情显示    | ✅ 已实现 | ❌ 无测试   | 添加组件显示测试                |
| FR-014 | 法术DC计算      | ✅ 已实现 | ⚠️ 部分测试 | 补充测试用例                    |
| FR-015 | 法术攻击加值    | ✅ 已实现 | ⚠️ 部分测试 | 补充测试用例                    |
| FR-016 | 法术攻击骰      | ✅ 已实现 | ❌ 无测试   | 创建文件夹+添加测试             |
| FR-017 | 法术伤害骰      | ✅ 已实现 | ❌ 无测试   | 创建文件夹+添加测试             |

## 技术栈

- **测试框架**: Vitest (与项目一致)
- **测试工具**: @testing-library/react, happy-dom/jsdom
- **Mock工具**: vi (vitest内置)
- **状态管理测试**: Zustand store 测试

## 实现方案

### 1. 验证策略

采用分层验证方法：

- **静态验证**: 检查需求文件夹和文档状态
- **代码验证**: 检查实现文件是否存在并功能完整
- **测试验证**: 运行现有测试并检查覆盖率

### 2. 测试添加策略

按照功能优先级和依赖关系分批次添加测试：

**第一批（P0核心功能）**：

- FR-003: 离线存储测试 (storage-service.test.ts)
- FR-010: 法术位消耗/恢复测试 (补充 character-service.test.ts)
- FR-012: 法术详情页测试 (SpellDetailFlyout.test.tsx)
- FR-013: 成分详情显示测试

**第二批（P1重要功能）**：

- FR-011: 专注状态标记测试 (ConcentrationToggle.test.tsx, ConcentrationBanner.test.tsx)
- FR-014/015: 法术DC/攻击加值显示测试
- FR-016: 法术攻击骰测试 (DiceRollOverlay.test.tsx, SpellActionRow.test.tsx)
- FR-017: 法术伤害骰测试

**第三批（补充和完善）**：

- FR-006: 补充角色创建相关测试
- 更新所有相关 spec.md 文件
- 创建缺失的需求文件夹
- 修复 README.md 中的完成百分比

### 3. 关键技术创新点

- **Mock策略**: 使用 vitest 的 vi.mock 进行模块隔离
- **组件测试**: 使用 @testing-library/react 进行用户行为模拟
- **Store测试**: 直接测试 zustand store 的状态管理
- **覆盖率跟踪**: 使用 `vitest --coverage` 确保达到目标覆盖率

### 4. 性能考虑

- 测试应当快速运行（单元测试 < 100ms）
- 使用 beforeEach 清理状态避免测试间干扰
- Mock 外部依赖减少测试执行时间
- 避免不必要的 DOM 渲染

## 实施注意事项

### 性能优化

- 测试用例应当独立且快速
- 使用 shared mock helpers 减少重复代码
- 避免在每个测试中都完整渲染复杂组件

### 日志记录

- 测试失败时应当提供清晰的错误信息
- 使用 describe/it 嵌套结构提高可读性
- 测试名称应当描述预期行为而非实现细节

### 影响范围控制

- 仅添加测试，不修改实现代码（除非发现bug）
- 保持与现有测试风格一致
- 新测试文件遵循现有命名约定 (\*.test.tsx)

## 架构设计

### 测试文件组织结构

```
packages/spellbook/src/
├── core/
│   └── __tests__/
│       ├── character-service.test.ts  # 已有，需补充
│       ├── spell-service.test.ts       # 已有
│       └── storage-service.test.ts     # 新建 - FR-003
├── stores/
│   └── __tests__/
│       ├── character-store.test.ts     # 已有，需补充
│       └── spell-store.test.ts        # 已有，需补充
├── hooks/
│   └── __tests__/
│       └── useSpellCapabilities.test.tsx  # 已有，需补充
├── components/
│   ├── spell/
│   │   └── __tests__/
│   │       ├── SpellActionRow.test.tsx     # 新建 - FR-016, FR-017
│   │       ├── SpellCardWrapper.test.tsx   # 新建 - FR-014, FR-015
│   │       ├── ConcentrationToggle.test.tsx # 新建 - FR-011
│   │       └── CastLevelSelect.test.tsx    # 新建
│   ├── spell-library/
│   │   └── __tests__/
│   │       ├── SpellDetailFlyout.test.tsx  # 新建 - FR-012, FR-013
│   │       ├── FilterChips.test.tsx        # 已有
│   │       └── SearchBar.test.tsx         # 已有
│   ├── character/
│   │   └── __tests__/
│   │       ├── ConcentrationBanner.test.tsx # 新建 - FR-011
│   │       └── CharacterSheet.test.tsx     # 新建 - FR-006
│   └── dice/
│       └── __tests__/
│           └── DiceRollOverlay.test.tsx    # 新建 - FR-016, FR-017
└── requirements/
    ├── FR-011/  # 新建文件夹
    │   └── spec.md
    ├── FR-014/  # 新建文件夹
    │   └── spec.md
    ├── FR-015/  # 新建文件夹
    │   └── spec.md
    ├── FR-016/  # 新建文件夹
    │   └── spec.md
    └── FR-017/  # 新建文件夹
        └── spec.md
```

## 目录结构

### 需要新建的文件

```
packages/spellbook/
├── src/
│   ├── core/
│   │   └── __tests__/
│   │       └── storage-service.test.ts           # [NEW] FR-003 离线存储测试
│   ├── components/
│   │   ├── spell/
│   │   │   └── __tests__/
│   │   │       ├── SpellActionRow.test.tsx      # [NEW] FR-016, FR-017 法术动作测试
│   │   │       ├── SpellCardWrapper.test.tsx    # [NEW] FR-014, FR-015 法术卡片测试
│   │   │       └── ConcentrationToggle.test.tsx # [NEW] FR-011 专注切换测试
│   │   ├── character/
│   │   │   └── __tests__/
│   │   │       ├── ConcentrationBanner.test.tsx # [NEW] FR-011 专注横幅测试
│   │   │       └── CharacterSheet.test.tsx      # [NEW] FR-006 角色 sheet 测试
│   │   ├── spell-library/
│   │   │   └── __tests__/
│   │   │       └── SpellDetailFlyout.test.tsx  # [NEW] FR-012, FR-013 法术详情测试
│   │   └── dice/
│   │       └── __tests__/
│   │           └── DiceRollOverlay.test.tsx    # [NEW] FR-016, FR-017 骰值覆盖测试
│   └── stores/
│       └── __tests__/
│           ├── character-store.test.ts          # [MODIFY] 补充 FR-006, FR-010 测试
│           └── spell-store.test.ts              # [MODIFY] 补充 FR-005 测试
└── requirements/
    ├── FR-011/                                 # [NEW] 专注状态标记需求文件夹
    │   └── spec.md                             # [NEW] 更新状态为已完成
    ├── FR-014/                                 # [NEW] 法术DC计算需求文件夹
    │   └── spec.md                             # [NEW] 创建需求文档
    ├── FR-015/                                 # [NEW] 法术攻击加值需求文件夹
    │   └── spec.md                             # [NEW] 创建需求文档
    ├── FR-016/                                 # [NEW] 法术攻击骰需求文件夹
    │   └── spec.md                             # [NEW] 创建需求文档
    ├── FR-017/                                 # [NEW] 法术伤害骰需求文件夹
    │   └── spec.md                             # [NEW] 创建需求文档
    └── README.md                               # [MODIFY] 修复完成百分比，更新状态
```

### 文件功能说明

#### 新建测试文件

1. **storage-service.test.ts** - FR-003 离线存储测试

- 测试 localStorage 读写操作
- 测试字符数据的持久化
- 测试数据迁移和错误处理

2. **SpellActionRow.test.tsx** - FR-016, FR-017 法术动作测试

- 测试攻击骰滚动
- 测试伤害骰滚动
- 测试法术施放等级选择

3. **SpellCardWrapper.test.tsx** - FR-014, FR-015 法术卡片测试

- 测试法术DC显示
- 测试攻击加值显示
- 测试法术成分图标显示

4. **ConcentrationToggle.test.tsx** - FR-011 专注切换测试

- 测试专注状态切换
- 测试专注UI指示

5. **ConcentrationBanner.test.tsx** - FR-011 专注横幅测试

- 测试专注状态横幅显示
- 测试取消专注操作

6. **CharacterSheet.test.tsx** - FR-006 角色sheet测试

- 测试角色信息显示
- 测试法术位显示和操作

7. **SpellDetailFlyout.test.tsx** - FR-012, FR-013 法术详情测试

- 测试法术详情页渲染
- 测试成分详情显示（V/S/M）
- 测试法术所有字段显示

8. **DiceRollOverlay.test.tsx** - FR-016, FR-017 骰值覆盖测试

- 测试骰值滚动动画
- 测试骰值结果显示
- 测试骰值历史记录

#### 修改现有测试文件

1. **character-store.test.ts** - 补充测试

- 添加法术位消耗/恢复测试（FR-010）
- 添加角色创建完整流程测试（FR-006）
- 添加专注状态管理测试（FR-011）

2. **spell-store.test.ts** - 补充测试

- 添加按职业过滤测试（FR-005）
- 添加按学派过滤测试（FR-005）

#### 新建/更新需求文档

1. **FR-011/spec.md** - 专注状态标记

- 更新状态为"✅ Completed"
- 添加实现说明和测试计划

2. **FR-014/spec.md** - 法术DC计算显示

- 创建需求文档
- 描述实现状态

3. **FR-015/spec.md** - 法术攻击加值显示

- 创建需求文档
- 描述实现状态

4. **FR-016/spec.md** - 法术攻击骰

- 创建需求文档
- 描述实现状态

5. **FR-017/spec.md** - 法术伤害骰

- 创建需求文档
- 描述实现状态

6. **README.md** - 更新进度跟踪

- 修复完成百分比（0% → 根据实际测试覆盖率）
- 更新各功能状态说明

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 探索现有实现文件，验证功能的实际完成状态
- Expected outcome: 生成功能实现验证报告，确认哪些功能真正完成以及测试覆盖情况
