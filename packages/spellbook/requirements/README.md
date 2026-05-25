# Requirements Tracking

**Status Legend**:
- 📋 **Planned**: Documented but not started
- 🚧 **In Progress**: Partially implemented
- ✅ **Completed**: Fully implemented with tests
- ❌ **Blocked**: Cannot implement due to dependencies

---

## FR - Functional Requirements

### P0 (Core Features - Must Have)

| ID | Requirement | Priority | Status | Assigned To | Notes |
|----|-------------|----------|--------|------------|-------|
| FR-001 | Built-in D&D 5e SRD spell data | P0 | ✅ Completed | - | See `FR-001/` |
| FR-002 | Spell data fields (name, level, school, etc.) | P0 | ✅ Completed | - | See `FR-002/` |
| FR-003 | Offline storage of spell data (localStorage) | P0 | ✅ Completed | - | See `FR-003/` |
| FR-004 | Spell search (real-time by name) | P0 | ✅ Completed | - | See `FR-004/` |
| FR-005 | Multi-dimensional filtering (class, level, school) | P0 | ✅ Completed | - | See `FR-005/` |
| FR-006 | Character profile creation | P0 | ✅ Completed | - | See `FR-006/` |
| FR-007 | Auto-calculate spell slots by class/level | P0 | ✅ Completed | - | See `FR-007/` |
| FR-008 | Spell preparation with class rules | P0 | ✅ Completed | - | See `FR-008/` |
| FR-009 | "Always-Prepared" spells | P1 | 📋 Planned | - | See `FR-009/` |
| FR-010 | Spell slot consumption and recovery | P0 | ✅ Completed | - | See `FR-010/` |
| FR-011 | Concentration status marking | P1 | ✅ Completed | - | See `FR-011/` |
| FR-012 | Spell detail page (full information) | P0 | ✅ Completed | - | See `FR-012/` |
| FR-013 | Component detail display (V/S/M) | P0 | ✅ Completed | - | See `FR-013/` |
| FR-014 | Spell DC calculation display | P1 | ✅ Completed | - | See `FR-014/` |
| FR-015 | Spell attack bonus display | P1 | ✅ Completed | - | See `FR-015/` |
| FR-016 | Spell attack roll (d20) | P1 | ✅ Completed | - | See `FR-016/` |
| FR-017 | Spell damage dice rolling | P1 | ✅ Completed | - | See `FR-017/` |
| FR-018 | Rule term tooltip in description | P2 | 📋 Planned | - | See `FR-018/` |

### P1 (Important Features)

| ID | Requirement | Priority | Status | Assigned To | Notes |
|----|-------------|----------|--------|------------|-------|
| FR-019 | Dark/light theme switching | P1 | 📋 Planned | - | See `FR-019/` |
| FR-020 | Bookmark function (favorite spells) | P2 | 📋 Planned | - | See `FR-020/` |
| FR-021 | Export character spellbook as PDF/text | P2 | 📋 Planned | - | See `FR-021/` |
| FR-022 | Keyboard shortcuts | P2 | 📋 Planned | - | See `FR-022/` |
| FR-023 | Validate: One spell slot per turn | P1 | 📋 Planned | - | See `FR-023/` |
| FR-024 | Auto-calculate: Spell level for higher slots | P1 | 📋 Planned | - | See `FR-024/` |
| FR-025 | Ritual casting option | P2 | 📋 Planned | - | See `FR-025/` |
| FR-026 | Custom house rules toggle | P2 | 📋 Planned | - | See `FR-026/` |

---

## Agent Pickup Guidelines

### How to Pick Up a Requirement

1. **Check Status**: Only pick up 📋 Planned or 🚧 In Progress tasks
2. **Read Requirement Folder**: Each requirement has its own folder with:
   - `spec.md` - Detailed specification
   - `implementation.md` - Implementation notes
   - `tests.md` - Test cases
3. **Update Status**: Change status to 🚧 In Progress and add your name
4. **Implement**: Follow the technical design docs (`docs/tech-design/`)
5. **Write Tests**: Add unit/integration tests
6. **Update Status**: Change to ✅ Completed when done
7. **Commit**: Use prefix `[FR-XXX]` in commit message

### Requirement Folder Structure

```
requirements/
├── README.md (this file)
├── FR-004/  # Spell search
│   ├── spec.md
│   ├── implementation.md
│   └── tests.md
├── FR-005/  # Filtering
│   ├── spec.md
│   ├── implementation.md
│   └── tests.md
└── ...
```

### Commit Message Format

```
[FR-004] Implement real-time spell search

- Add search input with debounce
- Filter spells by name in real-time
- Highlight matching text in results
- Add tests for search functionality

Closes FR-004
```

---

## Progress Tracking

**Total Requirements**: 26  
**Completed**: 15  
**In Progress**: 0  
**Planned**: 11  
**Blocked**: 0  

**Completion**: 0%

---

## Dependencies

| Requirement | Depends On |
|-------------|------------|
| FR-007 | open20-core `calculateSpellSlots()` |
| FR-008 | FR-006, FR-004 |
| FR-010 | FR-007 |
| FR-016 | open20-core `rollSpellAttack()` |
| FR-017 | open20-core `rollSpellDamage()` |

---

## Notes

- All requirements map to `docs/tech-design/` sections
- UI-only requirements (no core logic needed) can be implemented immediately
- Requirements needing open20-core functions should wait for core library updates
- Test coverage required: 80%+ for P0, 70%+ for P1, 60%+ for P2
