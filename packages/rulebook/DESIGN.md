# Rulebook Package - UI/UX Design Document

> **Document**: UI/UX Design for @open20/rulebook
> **Version**: 2.1
> **Status**: 📋 Draft
> **Last Updated**: 2026-06-14 (v2.1 — post UX review)

---

## 1. Full Design System

### 1.1 Design Tokens: Colors

```
                      Light Theme           Dark Theme
Primary (CTA)         #2563EB  blue-600     #3B82F6  blue-500
Primary Hover         #1D4ED8  blue-700     #60A5FA  blue-400
Primary Text          #FFFFFF  white         #FFFFFF  white

Success (Enabled)     #059669  green-600     #10B981  green-500
Success Subtle        #ECFDF5  green-50     #064E3B  green-900
Warning               #D97706  amber-600    #F59E0B  amber-500
Error (Validation)    #DC2626  red-600       #EF4444  red-500
Error Subtle          #FEF2F2  red-50        #7F1D1D  red-900

Neutral (Disabled)    #6B7280  gray-500      #9CA3AF  gray-400
Surface Primary       #FFFFFF  white         #1E293B  slate-800
Surface Secondary     #F9FAFB  gray-50       #0F172A  slate-900
Surface Elevated      #FFFFFF  white         #334155  slate-700
Border                #E5E7EB  gray-200      #475569  slate-600
Border Focus          #3B82F6  blue-500     #3B82F6  blue-500

Text Primary          #111827  gray-900      #F1F5F9  slate-100
Text Secondary        #6B7280  gray-500      #94A3B8  slate-400
Text Tertiary         #9CA3AF  gray-400      #64748B  slate-500
Text Inverse          #FFFFFF  white         #0F172A  slate-900
```

### 1.2 Design Tokens: Typography

```
Element           Size    Weight   Line     Letter
Page Title        24px    Bold     32px     -0.5px
Section Header    20px    Semi     28px     0
Subsection        16px    Semi     24px     0
Body              14px    Reg      20px     0
Body Small        13px    Reg      18px     0
Caption           12px    Reg      16px     0
Code              13px    Mono     20px     0
```

### 1.3 Design Tokens: Spacing & Shape

```
spacing:    4 8 12 16 20 24 32 40 48 64
radius:     sm:6px  md:8px  lg:12px  xl:16px  full:9999px
shadow:     sm / md / lg (Tailwind default + elevation on dark)
```

### 1.4 Content Type Icons (Lucide)

```
Content Type    Lucide Icon      Emoji   Purpose
Spell           Sparkles         🪄      法术
Monster         Skull            👹      怪物
Species         Users            🧝      种族
Background      BookOpen         📖      背景
Class           GraduationCap    🎓      职业
Subclass        GitBranch        🔀      子职业
Feat            Award            ⭐      专长
Weapon          Sword            ⚔️      武器
Armor           Shield           🛡️      护甲
Gear            Backpack         🎒      装备
Glossary        Library          📚      术语表

Action          Lucide Icon      Purpose
Add             Plus             新建
Edit            Pencil           编辑
Delete          Trash2           删除
Export          Download         导出
Import          Upload           导入
Search          Search           搜索
Filter          SlidersHorizontal 过滤
Save            Save             保存
Preview         Eye              预览
Settings        Settings         设置
More            MoreHorizontal   更多操作
Copy            Copy             复制
Warning         AlertTriangle    警告
Check           CheckCircle      确认
```

### 1.5 Dark Mode Strategy

- 所有 shadcn/ui 组件天然支持 dark mode（`class` strategy，`tailwind.config`）
- 颜色 token 同时定义了 Light/Dark（见 §1.1）
- Card 在暗色下使用 `surface-elevated` 背景 + 0.5px 半透明白色边框
- 侧边栏在暗色下与主内容区形成对比
- 所有 wireframe 均以浅色展示，但实现必须同步覆盖两套主题

---

## 2. Information Architecture (Revised)

### 2.1 Page Structure

```
Rulebook App
├── /rulebook                    # 首页 = 内容包列表 (PackList)
├── /rulebook/packs/:id          # 内容包详情 (PackDetail)
│   └── /rulebook/packs/:id/spells/:spellId   # 编辑特定法术
│   └── /rulebook/packs/:id/monsters/:monId   # 编辑特定怪物
└── /rulebook/browse             # 跨包浏览 (Browse) — 只读
    ├── /rulebook/browse/spells
    ├── /rulebook/browse/monsters
    └── ...
```

不再有独立的 `/rulebook/import-export/` 路由。Import/Export 是 Packs 页面的工具栏操作（Modal）。

### 2.2 页面职责

| 页面              | 职责                                | 交互模式             |
| ----------------- | ----------------------------------- | -------------------- |
| **PackList**      | 管理所有内容包，创建/删除/导入/导出 | CRUD + Modal         |
| **PackDetail**    | 单包内容管理，搜索/过滤/批量操作    | 可编辑，按标签页组织 |
| **Browse**        | 跨包浏览和对比所有内容              | 只读，发现模式       |
| **ContentEditor** | 单个内容的创建/编辑表单             | 全屏或右侧表单       |

### 2.3 Navigation Structure (issue 1 — sidebar enriched)

240px 侧边栏仅放 2 个链接太空旷。采用 **方案 B：侧边栏 + 快捷入口**：

```
┌──────────────────────────────┐
│  📦 Packs                    │  ← 一级导航（活跃态高亮）
│  🔍 Browse                   │
│──────────────────────────────│
│  RECENT PACKS                │  ← 动态区（默认折叠，有内容时展示）
│  📄 My Homebrew Spells       │
│  📄 SRD 5.2                  │
│──────────────────────────────│
│  New to Rulebook?            │  ← 底部帮助区（新用户可见）
│  [Quick Start Guide]         │
└──────────────────────────────┘
```

- Recent Packs：保存最近打开的 3~5 个包，点击快速跳转 `PackDetail`
- 不再有 Import/Export 快捷入口（已移至 PackList 工具栏）

### 2.4 Component Hierarchy

```
App
├── RulebookLayout
│   ├── Sidebar                # 导航 + Recent Packs (240px)
│   ├── TopBar                 # Logo + 面包屑 + 全局搜索 [🔍]
│   └── MainContent
│       ├── PackList           # 卡片网格
│       │   ├── PackCard
│       │   ├── EmptyState (0 packs)
│       │   ├── CreatePackWizard (Modal)
│       │   ├── ImportWizard (Modal, Quick/Guided 两种模式)
│       │   └── ExportDialog (Modal)
│       ├── PackDetail         # 标签页 + 表格 (含 "All Content" 标签)
│       │   ├── PackMetaBar
│       │   ├── ContentTable / EmptyTableState
│       │   ├── AllContentTab  # 跨类型视图
│       │   ├── DeleteContentDialog (Modal)
│       │   └── DeletePackDialog (Modal)
│       ├── ContentEditor      # 单栏表单 (默认) / 可分栏
│       │   ├── EditorTabs or Accordion
│       │   ├── PreviewToggle / PreviewDrawer  # 按需预览
│       │   └── UnsavedChangesDialog
│       └── ContentBrowser     # 过滤器 + 结果网格
│           ├── FilterSidebar
│           ├── ActiveFilterChips
│           ├── AddToPackDrawer  # 目标包选择子流程
│           └── EmptyResultState
```

---

## 3. Wireframes

### 3.1 Wireframe 1: PackList（内容包管理页面）

**页面用途**: 查看、创建、导入、导出内容包

**布局**: 卡片网格 + 顶部操作栏

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]                        Rulebook        [@User] [⚙️]    │  ← TopBar
├──────┬───────────────────────────────────────────────────────────┤
│ Side │  Content Packs                     [+New] [📥] [📤]       │  ← Toolbar
│ bar  │───────────────────────────────────────────────────────────┤
│      │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│ [📦] │  │ 🟢 SRD 5.2   │  │ 🟢 My Spells │  │ ⚫ Monsters  │ │
│ Pack │  │ Enabled       │  │ Enabled      │  │ Disabled     │ │
│ s    │  │ v1.0 · SRD   │  │ v0.1 · Home  │  │ v1.0 · TSR  │ │
│      │  │ 🪄391 🧝9    │  │ 🪄12 🛡️5    │  │ 👹50 +3 more│ │  ← Top 3 + "+N more"
│ [🔍] │  │ +7 more      │  │              │  │              │ │
│ Brow │  │              │  │ [Open][Exp]⋯ │  │ [Open][Exp]⋯ │ │
│ se   │  │ [Open][Exp]⋯ │  └──────────────┘  └──────────────┘ │
├──────┤  └──────────────┘                                      │
│ Rcnt │  ┌──────────────┐                                      │
│ 📄 A │  │ 📦 + New Pack│  (虚线 + 引导文案)                 │
│ 📄 B │  └──────────────┘                                      │
└──────┴──────────────────────────────────────────────────────────┘
```

**关键交互**:

- [+New] → CreatePackWizard (Modal) (issue 1: 从侧边栏移到工具栏)
- [📥 Import] → ImportWizard (Modal)
- [📤 Export] → ExportDialog (Modal for selected pack)
- 悬停卡片 → 显示 [Disable] / [Delete] 按钮
- **删除点击** → 确认对话框: "Are you sure? This cannot be undone." (issue 9)
- **禁用点击** → 确认对话框: "Disabling will hide all content from this pack"
- 卡片底部类型图标 (issue 4 fix): **仅显示 Top 4 非零类型 + "+N more"**，如 `🪄391  👹3  🧝9  +7 more`。hover 时展开 tooltip 显示全部 11 种类型分布
- 全部 11 种类型为零 → 隐藏类型图标行，显示 "Empty pack"
- Enabled 卡片: 绿色状态点 🟢 / Disabled: 灰色状态点 ⚫

### 3.1a Empty State: 0 Content Packs (issue 3)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              [📦  large illustration]                 │
│                                                      │
│           Welcome to Rulebook                         │
│     Create your first content pack or import one      │
│                                                      │
│       [Create Your First Pack]   [Import a Pack]     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.2 Wireframe 2: CreatePackWizard（创建内容包向导）

**页面用途**: 引导用户创建新内容包

**布局**: Modal 对话框，3 步骤

```
┌───────────────────────────────────────────────────────────┐
│  Create New Content Pack                        [✕]      │
├───────────────────────────────────────────────────────────┤
│  Step 1 of 3: Basic Information                          │
│  ├───┬───┬───┐                                          │
│  │ 1 │ 2 │ 3 │                                          │
│  └───┴───┴───┘                                          │
│                                                           │
│  Pack ID *          Pack Name *                           │
│  ┌─────────────┐    ┌─────────────────────────────┐     │
│  │my-homebrew  │    │ My Homebrew Spells          │     │
│  └─────────────┘    └─────────────────────────────┘     │
│  (kebab-case, unique)                                    │
│                                                           │
│  Version             Author                               │
│  ┌───────┐          ┌───────────────────────────┐       │
│  │ 1.0.0 │          │ DM Awesome                │       │
│  └───────┘          └───────────────────────────┘       │
│                                                           │
│  Description (optional)                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────┤
│                               [Cancel]  [Next →]         │
└───────────────────────────────────────────────────────────┘
```

**关键交互**:

- Step 1: 基本信息 | Step 2: 选择初始内容类型 | Step 3: 确认
- Pack ID 重复 → 实时错误提示
- Modal 关闭时若已输入内容 → "You have unsaved changes. Discard?" (issue 6)

---

### 3.3 Wireframe 3: 内容包详情页面（PackDetail）

**页面用途**: 单包内容 CRUD 管理

**布局**: 标签页分区 + 表格 + 工具栏 + All Content 全局视图

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]                                 [@User]            [⚙️] │
├──────┬───────────────────────────────────────────────────────────┤
│ Side │  ← Back    My Homebrew Spells     [Import] [Export] [⋯]  │
│ bar  │  ID: my-homebrew | v1.0 | Enabled | Author: DM Awesome  │
│      │  ═══ Global Actions ═══                                 │  ← issue 5: 全局操作栏
│      │  [Export All] [Validate All]  12 items · ~32 KB          │
│      │  ═══════════════════════════                              │
│      │  ┌─ Tabs ────────────────────────────────────────────┐   │
│      │  │ [All(12)] [🪄Spells(6)] [👹Monsters(3)] [🧝Species(2)] [⚔️(1)]│
│      │  └────────────────────────────────────────────────────┘   │
│      │──────────────────────────────────────────────────────────┤
│      │  All Content:  Search...                [+Add] [Filter]   │  ← Toolbar
│      │  ┌──────┬────────────┬──────┬─────────┬─────────┬─────┐ │
│      │  │ Type │ Name       │ Lvl  │ School  │ Classes │ Src │ │
│      │  ├──────┼────────────┼──────┼─────────┼─────────┼─────┤ │
│      │  │ 🪄   │ Acid Rain  │ 3    │ Evoc    │ Wiz,Dru │ SRD │ │
│      │  │ 👹   │ Goblin     │ -    │ -       │ -       │ SRD │ │
│      │  │ 🧝   │ Elf        │ -    │ -       │ -       │ SRD │ │
│      │  │ 🪄   │ Fireball+  │ 3    │ Evoc    │ Wiz,Sor │ SRD │ │
│      │  └──────┴────────────┴──────┴─────────┴─────────┴─────┘ │
│      │  [Delete Selected]              Showing 4 of 12          │
└──────┴──────────────────────────────────────────────────────────┘
```

**"All Content" Tab (issue 5)**:

- 跨类型统一表格，增加 `Type` 列（图标标识）
- 全局操作栏：`[Export All]`、`[Validate All]` — 一键操作整个包
- 切换到按类型标签 → 工具栏变为类型专属操作（如 `[Spells]` 标签 → `[+Add Spell]`）

**Monsters Tab = 0 空态 (issue 3)**:

```
│  [Spells(12)] [Monsters(0)] [Species(0)] ...             │
│──────────────────────────────────────────────────────────┤
│                                                          │
│                    👹  No monsters yet                    │
│              Add your first monster to this pack          │
│                                                          │
│                  [+ Add Monster]   or  [Import]          │
│                                                          │
```

**关键交互**:

- 点击行 → ContentEditor (全屏，带参数)
- **[Delete Selected]** → 确认对话框: "Delete 3 spells? This cannot be undone." (issue 9)
- 表格排序：点击列头

---

### 3.4 Wireframe 4: 内容编辑器 — 单栏 + 按需预览 (issue 2)

**页面用途**: 创建/编辑单个内容项

**布局**: 默认单栏表单全宽（高效填写），预览为按需触发的抽屉面板

```
┌───────────────────────────────────────────────────────────────────┐
│  [Logo]                                    [Unsaved] [Save] [⋯]  │
├──────┬────────────────────────────────────────────────────────────┤
│ Side │  ← Back to My Homebrew Spells                             │
│ bar  │                                                            │
│      │  Edit Spell: Acid Rain        [👁 Preview] [Save] [Cancel]│  ← 右上角预览按钮
│      │  ┌──────────────────────────────────────────────────────┐ │
│      │  │ ── Basic Information ────────────────────────────   │ │
│      │  │ Spell ID *      │ Spell Name *                      │ │
│      │  │ [acid-rain    ] │ [Acid Rain                    ]   │ │
│      │  │                 │                                     │ │
│      │  │ Level       School              (Level 3 example:    │ │  ← 内联提示
│      │  │ [3 ▼]       [Evocation ▼]       fireball-like spells)│ │
│      │  │                                                       │ │
│      │  │ Classes:  [☑ Wizard] [☑ Sorcerer] [☑ Druid] [☐ ...]│ │
│      │  │                                                       │ │
│      │  │ ── Casting Information (auto-expand from template) ─ │ │
│      │  │ Casting Time *  Range *    Components  Duration *    │ │
│      │  │ [1 action     ] [150 feet] ☑V ☑S ⚬M [Instant     ] │ │
│      │  │                                                       │ │
│      │  │ ── Description ───────────────────────────────────  │ │
│      │  │ ┌─────────────────────────────────────────────────┐ │ │
│      │  │ │ You call down a rain of acid...                 │ │ │
│      │  │ │ (Rich text / Markdown)                          │ │ │
│      │  │ └─────────────────────────────────────────────────┘ │ │
│      │  │                                                       │ │
│      │  │ ── Higher Levels ────────────────────────────────── │ │
│      │  │ ┌─────────────────────────────────────────────────┐ │ │
│      │  │ │ When cast at 4th level, damage increases by 1d4 │ │ │
│      │  │ └─────────────────────────────────────────────────┘ │ │
│      │  └──────────────────────────────────────────────────────┘ │
│      │                                                            │
│      │  [Save] [Save & New] [Cancel] [Delete]                    │
└──────┴────────────────────────────────────────────────────────────┘
```

**预览触发方式 (issue 2 fix)**:

| 方式   | 触发                | 行为                                  |
| ------ | ------------------- | ------------------------------------- |
| 默认   | 无预览面板          | 全宽单栏表单                          |
| 按钮   | 点击 `[👁 Preview]` | 右侧滑出抽屉（400px），表单自适应缩窄 |
| 快捷键 | `Ctrl/Cmd + P`      | 切换抽屉开关                          |
| 设置   | Layout → Split View | 用户可固定打开分栏模式                |

```
┌─── Preview Drawer (400px, slide-in) ───┐
│  ⬥ Preview Acid Rain              [✕] │
│  ┌──────────────────────────────────┐  │
│  │          SpellCard               │  │
│  │        (live render)             │  │
│  └──────────────────────────────────┘  │
│  [Open Full Preview in New Tab]        │
└────────────────────────────────────────┘
```

**关键交互**:

- 默认全宽表单，Preview 是按需触发的工具，不占用 1/3 屏幕
- **Unsaved changes**: 点击 Back/Tab/关闭 → "You have unsaved changes. Save before leaving?" (issue 6)
- 手风琴区块：已完成 = 绿色 ✓，未完成 = 灰色 ○ (issue 4)
- 保存成功后 → Toast 提示 "Spell saved" + 可撤销 "Undo" (3s 内)

### 3.4a Wireframe 4a: Monster 编辑器 — Simple/Advanced 模式 (issue 7)

**页面用途**: Monster 最复杂，提供两种模式降低新手门槛

```
┌───────────────────────────────────────────────────────────────────┐
│  Edit Monster: Ancient Dragon     [Simple|Advanced] [👁] [Save]  │  ← 模式切换
├──────┬────────────────────────────────────────────────────────────┤
│ Side │  ┌──────────────────────────────────────────────────────┐ │
│ bar  │  │ SIMPLE MODE (default for new monsters)              │ │
│      │  │                                                      │ │
│      │  │ ── Quick Setup ───────────────────────────────────  │ │
│      │  │ Name         Type+Size      CR      Alignment        │ │
│      │  │ [Ancient Dra][Dragon>Huge▼] [20 ▼]  [Chaotic Evil▼]│ │
│      │  │                                                      │ │
│      │  │ ── Combat Stats ──────────────────────────────────  │ │
│      │  │ HP               AC             Speed               │ │
│      │  │ [546 (23d20+299)] [22 ▼]        [fly 80, walk 40  ]│ │
│      │  │                                                      │ │
│      │  │ ── Core Attacks ──────────────────────────────────  │ │
│      │  │ Bite: [+17] to hit,  [2d10+8] piercing             │ │
│      │  │ [+ Add Attack]                                      │ │
│      │  │                                                      │ │
│      │  │ ═══ Expand for advanced options ═══                │ │
│      │  │ [Switch to Advanced Mode →]                         │ │  ← CTA
│      │  │                                                      │ │
│      │  └──────────────────────────────────────────────────────┘ │
│      │                                                            │
│      │  ┌──────────────────────────────────────────────────────┐ │
│      │  │ ADVANCED MODE (toggle)                               │ │
│      │  │ ┌─────────────────┐                                  │ │
│      │  │ │Tab: Combat [✓]  │  ┌────────────────────────────┐ │ │
│      │  │ │Tab: Abilities[○]│  │ Ability Scores:            │ │ │
│      │  │ │Tab: Actions [○] │  │ STR 30(+10) DEX 10(+0)    │ │ │
│      │  │ │Tab: Spells  [○] │  │ CON 30(+10) INT 18(+4)    │ │ │
│      │  │ │Tab: Legendary[○]│  │ WIS 15(+2)  CHA 23(+6)    │ │ │
│      │  │ └─────────────────┘  │                             │ │ │
│      │  │                       │ Saving Throws:             │ │ │
│      │  │ (only visible when   │ ☑ DEX +8  ☑ CON +18      │ │ │
│      │  │  Advanced is on)     │ ☑ WIS +9  ☐ STR ☐ INT ...│ │ │
│      │  │                       └────────────────────────────┘ │ │
│      │  └──────────────────────────────────────────────────────┘ │
└──────┴────────────────────────────────────────────────────────────┘
```

**Simple Mode vs Advanced Mode (issue 7 fix)**:

| 模式         | 显示字段                                                                           | 目标用户           |
| ------------ | ---------------------------------------------------------------------------------- | ------------------ |
| **Simple**   | Name, Type/Size, CR, Alignment, HP, AC, Speed, 攻击动作                            | 新手 / 快速创建    |
| **Advanced** | Simple 全部 + 能力值, 豁免, 技能, 感官, 语言, Spellcasting, Legendary/Lair Actions | 有经验的内容创作者 |

- Simple mode 底部有 `[Switch to Advanced Mode →]` CTA
- 切换到 Advanced 后，可随时切回 Simple（已填的高级字段保留但不显示）
- Simple 模式下，未填的高级字段使用默认值（自动推导）

**编辑器实现优先级 (issue 7 — simpler types first)**:

1. **Phase 1**: Spell, Weapon, Armor, Gear（简单类型，字段少）— 手风琴区块
2. **Phase 2**: Species, Background, Feat（中等复杂度）— 手风琴区块
3. **Phase 2**: Monster（最高复杂度）— Simple/Advanced 双模式 + 竖向 Tab
4. **Phase 2**: Class/Subclass/Glossary — 各类型专属设计

---

### 3.5 Wireframe 5: 内容浏览器 — 跨包只读 (issue 2, 10)

**页面用途**: 跨包浏览所有内容。**只读，侧重发现和对比**（明确与 PackDetail 的分工）。

```
┌───────────────────────────────────────────────────────────────────┐
│  [Logo]                                     [@User]         [⚙️] │
├──────┬────────────────────────────────────────────────────────────┤
│ Side │  Browse Spells                                             │
│ bar  │  ┌────────────────────────────────────────────────────────┤
│      │  │ 🔍 fire  │ [Level:1..3 ✕] [School:Evoc ✕] [SRD ✕]   │ ← chips
│      │  │           │                     [Clear All Filters]    │
│      │  └────────────────────────────────────────────────────────┤
│      │  ┌──────────────┐  ┌──────────┐  ┌──────────┐          │
│      │  │ ▼ Source     │  │ [List][Grid]│  │ Showing 24│        │
│      │  │ ☑ SRD 5.2   │  └──────────┘  └──────────┘          │
│      │  │ ☑ Homebrew  │                                         │
│      │  │ ☐ Official  │  ┌──────┐┌──────┐┌──────┐┌──────┐       │
│      │  │              │  │Fire  ││Fire- ││Flame ││Wall  │       │
│      │  │ ▼ Level      │  │Bolt  ││ball  ││Strike││ofFire│       │
│      │  │ ☑ Cantrip   │  │(evoc)││(evoc)││(evoc)││(evoc)│       │
│      │  │ ☑ 1st       │  │SRD   ││SRD   ││SRD   ││SRD   │       │
│      │  │ ☑ 2nd       │  └──────┘└──────┘└──────┘└──────┘       │
│      │  │ ☑ 3rd       │  ┌──────┐                                │
│      │  │ ☐ 4th+      │  │ ...  │                                │
│      │  │              │  └──────┘                                │
│      │  │ ▼ School     │                                         │
│      │  │ ☑ Evocation │  [Load More]                            │
│      │  │ ☐ Abjuration│                                         │
│      │  │ ▶ Conjuration│                                         │
│      │  └──────────────┘                                         │
└──────┴────────────────────────────────────────────────────────────┘
```

**关键交互 (issue 10 fix)**:

- 过滤组可折叠 `▼` / 展开 `▶`
- 点击卡片 → 只读详情抽屉（含 [Add to My Pack] 按钮）
- **Active Filter Chips**: 已激活的过滤条件显示为可删除的 chip tag
- **[Clear All Filters]**: 一键清空所有过滤条件
- **Mobile**: 过滤器改为底部弹出面板 (Bottom Sheet)

#### "Add to My Pack" 子流程 (issue 6):

```
┌─── Detail Drawer: Fireball ──────────────────────────┐
│  ← Back to Browse      [Add to My Pack]              │
│                                                       │
│  (SpellCard — 只读渲染)                               │
│                                                       │
│  Source: SRD 5.2 · Level 3 · Evocation               │
│  Available in: SRD 5.2 pack                          │
└───────────────────────────────────────────────────────┘
                    │ 点击 [Add to My Pack]
                    ▼
┌─── Add to My Pack (Modal) ───────────────────────────┐
│  Add "Fireball" to a Content Pack                    │
│                                                       │
│  Select target pack:                                  │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🔍 Search packs...                            │  │
│  ├───────────────────────────────────────────────┤  │
│  │ ○ My Homebrew Spells        (Homebrew)       │  │
│  │ ○ Campaign Monsters         (Homebrew)       │  │
│  ├───────────────────────────────────────────────┤  │
│  │ + Create New Pack...                          │  │  ← inline 创建
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ⚠️ Fireball already exists in My Homebrew Spells   │
│     [Add Another Version]  [Cancel]                  │  ← 冲突提示
│                                                       │
│  or:                                                  │
│  ✅ Added Fireball to My Homebrew Spells             │  ← 成功
│     [View in Pack]  [Close]                          │
├───────────────────────────────────────────────────────┤
│                               [Cancel]  [Add to Pack]│
└───────────────────────────────────────────────────────┘
```

**关键交互**:

- 下拉/搜索已存在的包 → 选择 → [Add to Pack]
- 若目标包已有同 ID 内容 → 提示冲突，可选择 "Add Another Version" 或取消
- `+ Create New Pack` → 内联创建（迷你 CreatePackWizard，仅需 Name + ID）
- 成功后 → "View in Pack" 跳转到 PackDetail

**搜索无结果空态 (issue 3)**:

```
│  ┌──────────────────────────────────────┐
│  │                                      │
│  │         🔍  No spells found          │
│  │    Try adjusting your filters or     │
│  │    search with different keywords    │
│  │                                      │
│  │         [Clear All Filters]         │
│  │                                      │
│  └──────────────────────────────────────┘
```

---

### 3.6 Wireframe 6: 导入向导 — Quick Mode + Guided Mode (issue 3)

**页面用途**: 引导用户导入 JSON 内容包

**双模式策略**: 无线冲突 → Quick Mode (1 步)；有冲突/错误 → 展开 Guided Mode (3 步)

#### Quick Mode（默认，无线冲突场景）:

```
┌───────────────────────────────────────────────────────────┐
│  Import Content Pack                            [✕]      │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         📁  Drop JSON file or click to upload     │  │
│  │            (Supports .json files up to 10MB)      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─ Import Summary ──────────────────────────────────┐  │
│  │ 📦 My Homebrew Spells · v1.0 · DM Awesome        │  │
│  │ 🪄12  👹3  🧝0  →  Total: 15 items               │  │
│  │ ✅ All content valid                              │  │
│  │ ✅ No conflicts detected                          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Import as:                                               │
│  ☉ New Pack (create "My Homebrew Spells")               │
│  ○ Merge into:  [Select existing pack...  ▼]            │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│              [Cancel]        [Import Now →]               │  ← 一键导入
└───────────────────────────────────────────────────────────┘
```

**Quick Mode 触发条件**:

- 文件验证通过 ✓
- 无冲突内容 ✓
- 无格式错误 ✓

#### Guided Mode（有冲突/错误时自动展开）:

当检测到冲突或错误时，Quick Mode 自动展开为 3 步流程：

```
┌───────────────────────────────────────────────────────────┐
│  Import Content Pack          ⚠️ 2 issues detected [✕]   │
├───────────────────────────────────────────────────────────┤
│  Step 1 · Upload    Step 2 · Resolve    Step 3 · Import  │
│  ├───────────────────────────────────────────────────────┤
│  │ UPLOAD COMPLETE: my-spells.json (45 KB)              │
│  │ ✅ Format valid · 12 items · 2 conflicts            │
│  └───────────────────────────────────────────────────────┤
│                                                           │
│  ── Conflicts (2) ───────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ⚠️ fireball                                         │ │
│  │   Already exists in SRD 5.2                         │ │
│  │   [Keep Both] [Replace Existing] [Skip This One]   │ │
│  │─────────────────────────────────────────────────────│ │
│  │ ⚠️ acid-rain                                        │ │
│  │   Already exists in My Homebrew (different school)  │ │
│  │   Yours: Evocation  |  Existing: Conjuration       │ │
│  │   [Keep Both] [Replace Existing] [Skip This One]   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ── All Other Items (10) ────────────────────────────── │
│  [✓ Select All]    10 items with no conflicts            │
│  ┌───────────────────────────────────────┐              │
│  │ ☑ Frost Bolt · lv2 · Evoc             │              │
│  │ ☑ Wall of Ice · lv4 · Evoc           │              │
│  │ ...                                    │              │
│  └───────────────────────────────────────┘              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Import as: ☉ New Pack  ○ Merge into [Select...▼]       │
│                                     [← Back] [Import 12] │
└───────────────────────────────────────────────────────────┘
```

**双模式切换逻辑**:

```
拖入文件 → 验证
  ├─ 全部通过 + 无冲突 → Quick Mode (单页, 一键导入)
  └─ 有冲突/错误 → 自动展开 Guided Mode (冲突解决面板)
```

---

### 3.7 Wireframe 7: 导出对话框 (issue 8)

**页面用途**: 导出内容包为 JSON

**布局**: Modal 对话框，摘要优先

```
┌───────────────────────────────────────────────────────┐
│  Export Content Pack                        [✕]      │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Export: My Homebrew Spells                          │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ ✅ Content Summary                             │  │
│  │                                               │  │
│  │ 🪄 12 Spells    👹 0 Monsters    🧝 0 Species│  │
│  │                                               │  │
│  │ File Size: ~32 KB (JSON)                     │  │
│  │ Exporting: 1 file (my-homebrew-spells.json)  │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  Format:                                              │
│  ☉ Single JSON (recommended)                         │
│  ○ Multiple files (spells.json + monsters.json...)  │
│                                                       │
│  Options:                                             │
│  ☑ Include edit metadata (created/updated dates)     │
│  ☐ Minify JSON (compact)                             │
│                                                       │
│  ▶ Preview JSON  (collapsed — click to expand)       │
│                                                       │
├───────────────────────────────────────────────────────┤
│  [Cancel]    [Copy to Clipboard]  [Download JSON]    │
└───────────────────────────────────────────────────────┘
```

**关键交互 (issue 8 fix)**:

- JSON 预览默认折叠 `▶ Preview JSON`，点击展开代码块
- 摘要区显示内容统计 + 预估文件大小 ➜ 替换原始 JSON 块
- [Download JSON]: 自动命名 `{pack-id}.json`

---

### 3.8 Wireframe 8: 确认对话框 (issue 9)

**通用确认对话框 — 删除内容包**:

```
┌───────────────────────────────────────────────┐
│  ⚠️  Delete Content Pack            [✕]      │
├───────────────────────────────────────────────┤
│                                               │
│  Are you sure you want to delete              │
│  "My Homebrew Spells"?                        │
│                                               │
│  This will permanently remove:                │
│  🪄 12 Spells                                 │
│                                               │
│  ⚠️  This action cannot be undone.           │
│                                               │
├───────────────────────────────────────────────┤
│               [Cancel]  [Delete]              │
└───────────────────────────────────────────────┘
```

**批量删除确认**:

```
┌───────────────────────────────────────────────┐
│  ⚠️  Delete 3 Spells               [✕]      │
├───────────────────────────────────────────────┤
│                                               │
│  You are about to delete 3 spells:           │
│  • Acid Rain                                  │
│  • Fireball                                   │
│  • Frost Bolt                                 │
│                                               │
│  ⚠️  This action cannot be undone.           │
│                                               │
├───────────────────────────────────────────────┤
│               [Cancel]  [Delete All]          │
└───────────────────────────────────────────────┘
```

**禁用内容包确认**:

```
┌───────────────────────────────────────────────┐
│  🔕  Disable Content Pack           [✕]      │
├───────────────────────────────────────────────┤
│                                               │
│  Disabling "SRD 5.2" will hide                │
│  all content from this pack in Browse         │
│  and search results.                          │
│                                               │
│  Affected: 🪄391 👹0 🧝9                       │
│                                               │
├───────────────────────────────────────────────┤
│               [Cancel]  [Disable]             │
└───────────────────────────────────────────────┘
```

**所有破坏性操作**必须弹出确认对话框：
| 操作 | 确认内容 |
|------|---------|
| Delete Pack | 包名 + 内容数量 |
| Delete Content (批量) | 数量 + 名称列表 (≤5 个显示全名) |
| Disable Pack | 包名 + 影响范围 |
| Discard Changes | "You have unsaved changes" |

---

### 3.9 Wireframe 9: Loading & Skeleton States (issue 8)

**页面用途**: 定义所有异步操作的过渡态，避免 UI 闪烁

#### 3.9a PackList Skeleton

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]                       Rulebook             [...loading] │
├──────┬───────────────────────────────────────────────────────────┤
│ Side │  Content Packs                     [+New] [📥] [📤]       │
│ bar  │───────────────────────────────────────────────────────────┤
│      │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│      │  │ ████████████  │  │ ████████████  │  │ ████████████  │ │
│      │  │ ██████        │  │ ██████        │  │ ██████        │ │
│      │  │ ████████████  │  │ ████████████  │  │ ████████████  │ │
│      │  │ ████ ████     │  │ ████ ████     │  │ ████ ████     │ │
│      │  │               │  │               │  │               │ │
│      │  │ [████]        │  │ [████]        │  │ [████]        │ │
│      │  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────┴──────────────────────────────────────────────────────────┘
```

- 卡片 3~6 个占位块（pulsing animation `animate-pulse`）
- 文字行用灰色圆角矩块，宽度按内容类型变化

#### 3.9b Table Skeleton (PackDetail / Browse)

```
┌──────┬────────────┬──────┬────────┬──────────────┐
│ ████ │ ████████████│ ████ │ ████████│ ████████████ │
├──────┼────────────┼──────┼────────┼──────────────┤
│ ████ │ ████████████│ ████ │ ████████│ ████████████ │
│ ████ │ ████████████│ ████ │ ████    │ ████████████ │
│ ████ │ ████████████│ ████ │ ████████│ ████████████ │
│ ████ │ ████████    │ ████ │ ████████│ ████████████ │
│ ████ │ ████████████│ ████ │ ████████│ ████████████ │
└──────┴────────────┴──────┴────────┴──────────────┘
```

- 5~8 行占位行，宽度随机变化（模拟真实数据）

#### 3.9c Form Loading (编辑器加载已有数据)

```
┌──────────────────────────────────────────────────┐
│  Edit Spell: ████████████     [████] [████]     │
│  ┌────────────────────────────────────────────┐ │
│  │ ████████████  │ ████████████              │ │
│  │ ████          │                            │ │
│  │ ██████████    │ ██████████████             │ │
│  │               │                            │ │
│  │ █████████████████████████████████████████ │ │
│  │ █████████████████████████████████████████ │ │
│  │ ██████████████████████████                │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- Form skeleton 显示字段标签和输入框占位

#### 3.9d Import Progress

```
┌───────────────────────────────────────────────────┐
│  Importing Content Pack...                        │
│                                                   │
│  ████████████████░░░░░░░░░░░░  65%               │  ← 进度条
│                                                   │
│  Processing: Frost Bolt (8 of 12)                │  ← 当前项
│  ✅ 7 imported  ⚠️ 1 skipped                     │  ← 实时统计
│                                                   │
│  [Cancel Import]                                  │
└───────────────────────────────────────────────────┘
```

#### 3.9e Save Button States

```
[Save]           → 默认
[█ Saving...]    → 保存中 (disabled, spinner 图标)
[✅ Saved]       → 成功 (2s 后恢复为 [Save])
[⚠️ Save Failed] → 失败 (红色，tooltip 显示原因)
```

#### 3.9f 加载状态规范

| 场景                         | 加载方式                | 最小时长 |
| ---------------------------- | ----------------------- | -------- |
| PackList                     | Skeleton cards (6 个)   | 200ms    |
| PackDetail 内容表格          | Skeleton rows (5 行)    | 200ms    |
| ContentEditor (加载已有内容) | Form skeleton           | 300ms    |
| ContentBrowser 搜索结果      | Skeleton grid (8 卡片)  | 200ms    |
| Import 解析大文件            | Progress bar + 实时统计 | 无延迟   |
| Save 操作                    | Button spinner          | 无延迟   |
| IndexedDB 读                 | Skeleton                | 200ms    |

**原则**: 任何需要 ≥100ms 的异步操作必须显示加载态。Skeleton 使用 Tailwind `animate-pulse`，最小显示 200ms（避免闪烁）。

---

## 4. User Flows

### 4.1 Flow: 创建 + 填充内容包

```
PackList (空态: 0 packs)
  │
  ├─→ [Create Your First Pack] → CreatePackWizard
  │     ├─→ Step 1: Basic Info
  │     ├─→ Step 2: Select types (check Spells)
  │     └─→ Step 3: Confirm → [Create Pack]
  │
  └─→ Redirect to PackDetail (空态: Monsters=0, Species=0, ...)
        │
        ├─→ [Spells] Tab → Empty state: "No spells yet"
        │     └─→ [+ Add Spell] → ContentEditor
        │           ├─→ Fill Basic Info
        │           ├─→ Fill Casting Info
        │           ├─→ Fill Description
        │           ├─→ Preview updates in real-time (right panel)
        │           └─→ [Save] → return to PackDetail (Spells=1)
        │
        └─→ Repeat for more spells...
```

### 4.2 Flow: 导入内容包

```
PackList → [📥 Import] → ImportWizard
  │
  ├─→ Step 1: Upload JSON → validate → 显示 summary
  ├─→ Step 2: Preview → 勾选内容项 → 处理冲突
  │     ├─→ 冲突行: [Keep Both] / [Replace] / [Skip]
  │     └─→ [Next →]
  └─→ Step 3: Options
        ├─→ [Create New Pack] → [Import All] → Success → Packs list
        └─→ [Merge to Existing] → select pack → [Import All] → Success
```

### 4.3 Flow: Browse 跨包发现

```
Sidebar → [🔍 Browse]
  │
  └─→ ContentBrowser (Spells, 默认)
        ├─→ 展开/折叠过滤组
        ├─→ 勾选过滤条件 → chips 显示激活条件
        ├─→ 结果实时更新
        │
        ├─→ 点击 SpellCard → Detail Drawer (只读)
        │     └─→ "Add to My Pack" → 选择目标包 → 确认 → 添加成功
        │
        ├─→ [Clear All Filters] → 回到默认视图
        └─→ 搜索无结果 → Empty state: "No spells found"
```

---

## 5. Component Specifications

### 5.1 RulebookLayout

```
┌────────────────────────────────────┐
│  TopBar (fixed, h=56px, z=50)     │
│  Logo + Breadcrumb + Actions       │
├────────┬───────────────────────────┤
│        │                           │
│ Sidebar│  MainContent              │
│ w=240px│  flex-1, overflow-auto    │
│        │                           │
│ [📦] │                           │
│ [🔍] │                           │
│        │                           │
└────────┴───────────────────────────┘
```

### 5.2 PackCard（含类型分布可视化 — issue 4 optimized）

```
┌──────────────────────────────┐
│ 🟢                           │  ← 绿色=Enabled,灰色=Disabled
│ 📦 Pack Name                 │
│ v1.0 · Homebrew              │
│                              │
│ 🪄12  👹3  🧝1  🛡️5  +7 more│  ← Top 4 非零类型, 其余折叠
│                              │
│ [Open] [Export]  [⋯]        │  ← ⋯ = Disable/Delete dropdown
└──────────────────────────────┘
width: 280px, height: 160px
hover: shadow-lg + scale(1.02)
+7 more 悬停 → tooltip: "⚔️5 weapons, 🎒3 gears, 🎓2 classes, 📖1 bg, ..."
Empty pack → 隐藏类型图标行，显示 "No content"
```

### 5.3 ContentEditor Tabs/Accordion (issue 4)

**简单类型** (Spell, Feat, Weapon): 手风琴展开折叠区块

```
┌─────────────────────────────────────┐
│ ▼ Basic Information        [✓]      │  ← Collapsible
│ ▸ Casting Information      [✓]      │
│ ▸ Description              [○]      │  ← 有未填字段
└─────────────────────────────────────┘
```

**复杂类型** (Monster): 左侧竖向 Tab

```
┌─────────────────────────────────────┐
│ Tab: Basic        ✓                 │
│ Tab: Abilities    ○                 │  ← Active: 蓝色高亮
│ Tab: Actions      ○                 │
│ Tab: Spellcasting ○                 │
│ Tab: Legendary    ○                 │
│ Tab: Preview                        │
└─────────────────────────────────────┘
```

### 5.4 Active Filter Chips (issue 10)

```
┌────────────────────────────────────────────────────────────┐
│ 🔍 fire │ [Level: 1st - 3rd ✕] [School: Evoc ✕] [SRD ✕] │
│         │                                [Clear All]       │
└────────────────────────────────────────────────────────────┘
```

每个 chip 可单独删除（点击 `✕`），[Clear All] 一键清除。

---

## 6. Responsive Design

### 6.1 Desktop Layouts

| 页面                    | 布局                                                   |
| ----------------------- | ------------------------------------------------------ |
| PackList                | 侧边栏(240px) + 卡片网格 (2-4 列)                      |
| PackDetail              | 侧边栏(240px) + 标签页 + 表格                          |
| ContentEditor (Spell)   | 侧边栏(240px) + 全宽单栏表单；预览为右侧抽屉(按需滑出) |
| ContentEditor (Monster) | 侧边栏(240px) + Simple/Advanced双模式；预览为按需抽屉  |
| Browse                  | 侧边栏(240px) + 过滤器 (左, 256px) + 结果网格 (右)     |

### 6.2 ContentEditor: Desktop vs Tablet/Mobile (issue 5 revised)

**Desktop (≥ 1024px)**:

- 默认全宽单栏表单（效率优先）
- 点击 `[👁 Preview]` → 右侧滑出 400px 预览抽屉
- 高级用户可选 `Layout → Split View` 固定分栏

**Tablet (768-1023px)**:

- 全宽单栏表单
- Preview 作为底部弹出面板或全屏抽屉

**Mobile (< 768px)**:

- 全屏编辑器；顶部固定 [Save] [Cancel]
- `[👁 Preview]` 浮动按钮 → 全屏预览覆盖层

---

## 7. Accessibility

- 所有表单控件有 `<label>` 或 `aria-label`
- 破坏性按钮 (Delete) 使用 `role="alertdialog"` 的确认框
- Modal 打开时: `aria-modal="true"`, 焦点锁定
- 拖拽上传区: `role="button"`, `aria-label="Upload JSON file"`
- 键盘导航: Tab 切换字段, Escape 关闭 Modal, Enter 提交
- 颜色对比度 WCAG AA (≥4.5:1)

---

## 8. Error Handling & Unsaved Changes

### 8.1 Unsaved Changes Protection (issue 6)

**触发场景**:

1. 用户修改了编辑器中的表单字段
2. 点击了 Back、侧边栏导航、关闭标签页、或 Cancel 按钮

**行为**:

```
┌───────────────────────────────────────────────┐
│  ⚠️  Unsaved Changes                          │
├───────────────────────────────────────────────┤
│                                               │
│  You have unsaved changes to "Acid Rain".    │
│  Do you want to save before leaving?         │
│                                               │
├───────────────────────────────────────────────┤
│    [Discard]    [Cancel]    [Save & Leave]    │
└───────────────────────────────────────────────┘
```

- 浏览器 `beforeunload` 事件: 在关闭标签页时触发原生确认
- 路由守卫: React Router `useBlocker` 拦截导航

---

## 9. Implementation Checklist (Issue Tracking)

| #   | Issue                                                        | Status  |
| --- | ------------------------------------------------------------ | ------- |
| 1   | Navigation: 侧边栏仅 Packs/Browse → 增加Recent Packs快捷入口 | ✅ v2.1 |
| 2   | Browse vs PackDetail 职责明确分工                            | ✅ v2.0 |
| 3   | 空状态: 0 packs / 空标签页 / 搜索无结果                      | ✅ v2.0 |
| 4   | Monster Tab/Accordion 编辑器布局                             | ✅ v2.0 |
| 5   | Preview 默认为单栏，按需滑出抽屉 / FAB                       | ✅ v2.1 |
| 6   | Unsaved changes 保护和确认                                   | ✅ v2.0 |
| 7   | Import Wizard Quick/Guided 双模式                            | ✅ v2.1 |
| 8   | Export 对话框: 摘要优先，JSON 折叠                           | ✅ v2.0 |
| 9   | 确认对话框: 删除/禁用/丢弃                                   | ✅ v2.0 |
| 10  | Browse 过滤器: 折叠、clear all、chips                        | ✅ v2.0 |
| 11  | PackCard 类型分布可视化                                      | ✅ v2.0 |
| 12  | 完整设计系统 (Tokens: color/type/spacing/shape)              | ✅ v2.0 |
| 13  | Dark Mode 双主题规划                                         | ✅ v2.0 |
| 14  | 内容类型专属图标 (Lucide 映射)                               | ✅ v2.0 |
| 15  | PackCard 类型图标溢出 → Top 4 + "+N more" tooltip            | ✅ v2.1 |
| 16  | PackDetail "All Content" 跨类型 Tab                          | ✅ v2.1 |
| 17  | "Add to My Pack" 子流程 (目标包选择)                         | ✅ v2.1 |
| 18  | Monster 编辑器 Simple/Advanced 双模式                        | ✅ v2.1 |
| 19  | 编辑器实现优先级 (简单类型优先)                              | ✅ v2.1 |
| 20  | Loading/Skeleton 状态设计 (6 种场景)                         | ✅ v2.1 |

---

## 10. Appendices

### Appendix A: Zone Map — Key Screen Zones

```
┌───────────────┬──────────────────────────────────────┐
│  ZONE A       │  ZONE B                              │
│  App Shell    │  Context-Aware Content               │
│               │                                      │
│  Sidebar      │  a1: PackList (cards + toolbar)     │
│  (persistent  │  a2: PackDetail (tabs + table)      │
│   navigation) │  a3: ContentEditor (form + preview) │
│               │  a4: Browse (filters + results)     │
│               │                                      │
└───────────────┴──────────────────────────────────────┘
│  ZONE C: Modals & Overlays                            │
│  CreatePackWizard / ImportWizard / ExportDialog       │
│  ConfirmDialog / UnsavedChangesDialog                │
└───────────────────────────────────────────────────────┘
```

### Appendix B: References

- [Rulebook PRD](./PRD.md)
- [open20-core Content Module](../core/src/content/)
- [@open20/ui Components](../ui/src/components/)

---

_End of Design Document v2.0_
