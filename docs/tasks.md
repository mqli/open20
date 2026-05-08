# Development Tasks — DND 2024 Character Sheet UI

> **Source docs**: `docs/agent-ui-guide.md`, `docs/ui-design.md`
> **Estimated total**: ~140h (3.5 weeks full-time)

---

## Prerequisites Checklist

- [ ] `open20-core` is available as npm package or local workspace reference
- [ ] Development environment: Node 18+, pnpm/npm
- [ ] Design tokens exported from `ui-design.md` section 3

---

## Phase 0: Project Foundation (8h)

### 0.1 Repository & Workspace Setup

| Task | Est | Details |
|------|-----|---------|
| Create `packages/web` React app with Vite | 1h | `pnpm create vite web --template react-ts` |
| Configure TypeScript paths for monorepo | 0.5h | Add `paths` in tsconfig to reference `open20-core` |
| Install dependencies | 0.5h | tailwind, zustand, react-router, react-i18next, lucide-react, @tanstack/virtual |
| Install shadcn/ui | 1h | `npx shadcn@latest init` with Tailwind |
| Add base shadcn components | 1h | `button`, `card`, `dialog`, `sheet`, `slider`, `tabs` |
| Configure Tailwind with design tokens | 1h | Colors, spacing, typography from ui-design.md 3.1-3.3 |
| Setup ESLint + Prettier | 0.5h | For consistent code style |
| Create `lib/providers/` folder structure | 0.5h | Storage & Computation abstraction skeleton |
| Initialize Git and initial commit | 0.5h | |

**Acceptance**: `pnpm dev` starts without errors, shadcn components render

---

## Phase 1: Core Infrastructure (12h)

### 1.1 Provider Abstraction Layer

| Task | Est | Details |
|------|-----|---------|
| Define `StorageProvider` interface | 1h | `saveCharacter`, `loadCharacter`, `deleteCharacter`, `listCharacters` |
| Define `ComputationProvider` interface | 1h | `createCharacter`, `modifyHP`, `recompute`, `serialize`, etc. |
| Implement `LocalStorageProvider` | 2h | localStorage with prefix `open20_char_` |
| Implement `LocalComputationProvider` | 2h | Delegate to open20-core |
| Implement `AppProviders` context | 1h | Dependency injection, default to local providers |
| Create `useAppContext()` hook | 0.5h | Access providers from any component |
| Write unit tests for providers | 2h | Mock storage, test serialize/deserialize |
| Add IndexedDB provider stub (future) | 0.5h | Placeholder interface for Phase 2 |
| Add Remote provider stub (future) | 0.5h | Placeholder interface for Phase 3 |

**Acceptance**: Providers can be swapped without changing UI code

### 1.2 State Management

| Task | Est | Details |
|------|-----|---------|
| Create `characterStore` (Zustand) | 2h | Character state, all actions |
| Connect store to `ComputationProvider` | 1h | All mutations go through provider |
| Connect store to `StorageProvider` | 1h | Auto-save on mutations (debounced 500ms) |
| Create `useCharacter()` hook | 0.5h | Convenience wrapper for components |
| Add persistence middleware | 0.5h | Zustand `persist` with storage provider |

**Acceptance**: Character changes auto-save to localStorage

### 1.3 Theme & i18n

| Task | Est | Details |
|------|-----|---------|
| Setup dark/light theme system | 1h | Tailwind `darkMode: 'class'`, CSS variables |
| Add theme toggle to settings store | 0.5h | Persist to localStorage |
| Setup react-i18next | 1h | Add `en`, `zh` namespaces |
| Create `useLocale()` hook | 0.5h | `t()` function wrapper |
| Add translation keys for Game Mode | 2h | All labels, buttons, tooltips |

**Acceptance**: Theme and language persist, `t('key')` works everywhere

---

## Phase 2: Game Mode MVP (24h)

### 2.1 Layout & Shell

| Task | Est | Details |
|------|-----|---------|
| Create `<GameLayout>` | 1h | Header, scrollable content, action bar |
| Create `<GameHeader>` | 1h | Avatar, name, class/level, menu button |
| Setup React Router routes | 0.5h | `/`, `/game/:id`, `/create`, etc. |
| Add route guards (redirect to /create if no character) | 0.5h | |
| Create `<EmptyState>` component | 0.5h | "Create your first character" CTA |

### 2.2 Combat Stats Display

| Task | Est | Details |
|------|-----|---------|
| Create `<StatCard>` component | 1h | Label, value, accent color, onTap |
| Create `<HPDisplay>` component | 2h | Current/max/temp HP, color states |
| Create `<DeathSaves>` component | 1h | Success/failure circles |
| Create `<CombatStatsPanel>` | 1h | Grid of AC, HP, Initiative, PP cards |

### 2.3 Weapons & Skills

| Task | Est | Details |
|------|-----|---------|
| Create `<WeaponRow>` component | 1h | Name, attack bonus, damage, mastery |
| Create `<WeaponList>` container | 1h | Filter equipped weapons |
| Create `<SkillBadge>` component | 1h | Name, modifier, proficient indicator |
| Create `<SkillChips>` container | 1h | Pinned skills with copy-to-clipboard |

### 2.4 Resources & Spell Slots

| Task | Est | Details |
|------|-----|---------|
| Create `<ResourceDots>` component | 1h | Filled/empty dots, tap to toggle |
| Create `<ResourceTracker>` component | 1h | Name + dots, per resource |
| Create `<SlotCircle>` component | 0.5h | Filled/empty circle |
| Create `<SpellSlotTracker>` component | 1.5h | Per-level slots, consume/recover |
| Context-aware: hide if no spells/resources | 0.5h | Per D6 principle |

### 2.5 Conditions & Quick Actions

| Task | Est | Details |
|------|-----|---------|
| Create `<ConditionChip>` component | 1h | Name, active state, toggle |
| Create `<ConditionBar>` component | 1h | Active chips + "+Condition" button |
| Create `<QuickActionBar>` component | 1h | Short Rest, Long Rest buttons |
| Create condition picker bottom sheet | 1h | List of all conditions |

### 2.6 HP & Rest Flows

| Task | Est | Details |
|------|-----|---------|
| Create `<HPModifyPanel>` (bottom sheet) | 2h | Damage/heal buttons, temp HP, death saves |
| Create `<ShortRestFlow>` dialog | 2h | Hit dice selection, HP preview |
| Create `<LongRestFlow>` dialog | 1h | Confirmation of effects |
| Wire up rest actions to store | 1h | `doShortRest`, `doLongRest` |

### 2.7 Game Mode Assembly

| Task | Est | Details |
|------|-----|---------|
| Assemble Game Mode screen | 2h | Combine all components per ui-design.md 5.1 |
| Responsive adjustments (mobile-first) | 1h | 375px critical viewport |
| Wire up all interactions | 1h | onTap handlers, state updates |
| Auto-save integration | 0.5h | Verify 500ms debounce works |
| End-to-end test | 1h | Create → Game Mode → modify HP → refresh |

**Acceptance**: Full Game Mode works offline, all interactions persist

---

## Phase 3: Character Creation Wizard (20h)

### 3.1 Wizard Infrastructure

| Task | Est | Details |
|------|-----|---------|
| Create `<StepWizard>` layout | 1h | Progress indicator, nav buttons |
| Create step progress component | 1h | 9 steps, completed/current/pending states |
| Add step validation | 1h | Block "Next" until valid |
| Add auto-save per step | 1h | localStorage, resume on refresh |

### 3.2 Selection Steps

| Task | Est | Details |
|------|-----|---------|
| Create `<CardGrid>` component | 1h | Reusable for species, class, background |
| Species selection (Step 1) | 2h | 10 species cards, trait display |
| Class selection (Step 2) | 2h | 12 classes, feature preview |
| Background selection (Step 3) | 2h | 16 backgrounds, skill/tool grants |

### 3.3 Ability Assignment

| Task | Est | Details |
|------|-----|---------|
| Create mode switcher (Array/Point Buy/Manual) | 1h | Tabs UI |
| Implement Standard Array logic | 2h | Drag or tap to assign values |
| Implement Point Buy logic | 3h | +/- buttons, cost calculation |
| Implement Manual Input | 1h | Direct number entry |
| Show racial modifiers | 1h | Add to total, show modifier |
| Add validation | 1h | Min/max, required selections |

### 3.4 Skills, Feats, Equipment

| Task | Est | Details |
|------|-----|---------|
| Skill selection (auto + pick remaining) | 2h | Grouped by ability, expertise toggle |
| Feat selection (virtual scroll) | 3h | Search, categories, prerequisites |
| Starting equipment | 2h | Auto-filled, swap option |
| Details + Review (name, backstory) | 1h | Text inputs, summary view |

### 3.5 Creation Completion

| Task | Est | Details |
|------|-----|---------|
| Create character via store | 1h | Call `initCharacter()` |
| Navigate to Game Mode | 0.5h | On success |
| Error handling | 0.5h | Validation errors, retry |

**Acceptance**: Complete 9-step wizard, character appears in Game Mode

---

## Phase 4: Full Character Sheet (16h)

### 4.1 Sheet Layout

| Task | Est | Details |
|------|-----|---------|
| Create `<SheetLayout>` | 1h | Header + tabs + scrollable content |
| Create `<TabNav>` component | 0.5h | Combat, Skills, Spells, More |
| Tab content: Combat | 2h | All combat stats, saves, weapons |
| Tab content: Skills | 2h | Full skill list, filters |
| Tab content: Spells | 2h | Spell list, preparation |
| Tab content: More | 2h | Equipment, features, notes, currency |

### 4.2 Level Up Modal

| Task | Est | Details |
|------|-----|---------|
| Create `<LevelUpModal>` | 2h | New level, HP choice, features |
| HP selection (fixed vs roll) | 1h | Radio + roll button |
| ASI/Feat selector | 2h | Toggle + search |
| Apply level up | 1h | Call `levelUp()` via store |

### 4.3 Character List

| Task | Est | Details |
|------|-----|---------|
| Create `/characters` route | 1h | List view |
| Character card component | 1h | Name, class, level, last played |
| Switch character | 1h | Navigate to Game Mode |
| Delete character | 0.5h | Confirmation dialog |

### 4.4 Settings Page

| Task | Est | Details |
|------|-----|---------|
| Theme toggle (Dark/Light/Auto) | 1h | System preference support |
| Language toggle (EN/ZH) | 1h | |
| Export character | 0.5h | JSON file download |
| Import character | 1h | File upload + validation |
| Reset data | 0.5h | Clear all localStorage |

**Acceptance**: All CRUD operations work, data persists across sessions

---

## Phase 5: Polish & Quality (20h)

### 5.1 Responsive Design

| Task | Est | Details |
|------|-----|---------|
| Implement `md` breakpoint (768px) | 2h | Two-column layout |
| Implement `lg` breakpoint (1024px) | 2h | Three-column layout |
| Implement `xl` breakpoint (1280px) | 2h | Full desktop layout |
| Test on real mobile devices | 2h | Physical testing |

### 5.2 Accessibility

| Task | Est | Details |
|------|-----|---------|
| Semantic HTML audit | 1h | Proper heading hierarchy, landmarks |
| ARIA labels on all interactive elements | 2h | Buttons, inputs, dialogs |
| Keyboard navigation | 2h | Tab order, Enter/Space activation |
| Focus management | 1h | Modal trap, return focus on close |
| Screen reader testing | 1h | VoiceOver/NVDA |

### 5.3 Animation & UX

| Task | Est | Details |
|------|-----|---------|
| Condition chip transitions | 1h | 0.2s ease |
| Resource dot animations | 1h | 0.15s ease |
| Bottom sheet slide-up | 1h | 0.3s ease-out |
| Theme toggle transition | 1h | 0.3s ease |
| Toast notifications | 1h | "Copied 1d20+7", save confirmation |
| Loading states | 1h | Skeleton, spinner |

### 5.4 Performance

| Task | Est | Details |
|------|-----|---------|
| Route-based code splitting | 1h | `React.lazy()` |
| Memoization audit | 2h | `React.memo`, `useMemo`, `useCallback` |
| Virtual scroll for long lists | 2h | Feats, spells |
| Performance budget check | 1h | FCP < 1.5s, TTI < 3s |

### 5.5 Testing

| Task | Est | Details |
|------|-----|---------|
| Unit tests for all components | 4h | @testing-library/react |
| Integration tests for flows | 2h | Creation wizard, rest, level up |
| E2E tests (Playwright) | 4h | Critical paths |

**Acceptance**: 95%+ accessibility score, 60fps animations, FCP < 1.5s

---

## Phase 6: Future Infrastructure (Deferred)

### 6.1 IndexedDB Provider

| Task | Est | Details |
|------|-----|---------|
| Implement `IndexedDBProvider` | 4h | Replace localStorage for larger data |
| Add sync queue | 4h | Queue operations when offline |
| Background sync on reconnect | 2h | |

### 6.2 Remote Provider

| Task | Est | Details |
|------|-----|---------|
| Design REST API | 4h | OpenAPI spec |
| Implement `RemoteStorageProvider` | 4h | |
| Implement `RemoteComputationProvider` | 4h | |
| Auth integration | 4h | OAuth/JWT |

---

## Task Summary

| Phase | Tasks | Hours |
|-------|-------|-------|
| 0: Foundation | 10 | 8h |
| 1: Infrastructure | 17 | 12h |
| 2: Game Mode MVP | 30 | 24h |
| 3: Creation Wizard | 20 | 20h |
| 4: Full Sheet | 15 | 16h |
| 5: Polish & Quality | 25 | 20h |
| **Total (MVP)** | **92** | **100h** |
| 6: Future | 8 | 22h |
| **Grand Total** | **100** | **122h** |

---

## Daily Standup Format

```
## Today: [Task ID] - [Short description]
- Status: Not Started / In Progress / Done / Blocked
- Notes: [Any blockers or decisions]
- Tomorrow: [Next task]
```

## Definition of Done

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Responsive on 375px, 768px, 1280px viewports
- [ ] Theme toggle works
- [ ] Language toggle works
- [ ] Data persists across page refresh
- [ ] No console errors
- [ ] Performance budget met (FCP < 1.5s, TTI < 3s)
