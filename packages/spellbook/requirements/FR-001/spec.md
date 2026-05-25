# FR-001: Built-in D&D 5e SRD Spell Data

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: open20-core npm package  

---

## 1. Description

Built-in D&D 5e SRD (System Reference Document) open license spell data. The app should include all spells from the SRD, which are freely available for use.

**Source**: PRD.md → FR-001

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player, **I want to** access all D&D 5e SRD spells, **so that** I can browse and search the complete spell list without internet.

### 2.2 Acceptance Criteria

- [ ] All SRD spells are available offline
- [ ] Spell data is loaded from open20-core npm package
- [ ] No network request needed to access spell data
- [ ] Spell data includes all required fields (name, level, school, etc.)

### 2.3 UI Components Affected

- `SpellLibrary.tsx` - Displays spell list
- `SpellCard.tsx` - Displays spell preview
- `SpellDetail.tsx` - Displays full spell info

### 2.4 open20-core API Usage

```typescript
// src/core/spell-service.ts
import { getSpell, searchSpells, getAllSpells } from 'open20-core';

// Get all spells
static getAllSpells(): Spell[] {
  return getAllSpells();
}

// Get spell by ID
static getSpell(id: string): Spell | undefined {
  return getSpell(id);
}
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Install open20-core npm package
2. Import spell data from open20-core
3. Load spells on app startup
4. Cache spells in memory for fast access

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add open20-core dependency |
| `src/core/spell-service.ts` | Create | Spell data access layer |
| `src/stores/spell-store.ts` | Modify | Load spells on mount |

### 3.3 Estimated Effort

Small - 2 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/spell-service.test.ts
describe('FR-001: SRD Spell Data', () => {
  it('should load all SRD spells', () => {
    const spells = SpellService.getAllSpells();
    expect(spells.length).toBeGreaterThan(0);
  });
  
  it('should have all required fields', () => {
    const spell = SpellService.getSpell('fire-bolt');
    expect(spell).toHaveProperty('name');
    expect(spell).toHaveProperty('level');
    expect(spell).toHaveProperty('school');
  });
});
```

### 4.2 Integration Tests

- [ ] Spell list renders with SRD spells
- [ ] Search works on SRD spells
- [ ] Filters work on SRD spells

### 4.3 Manual Testing

- [ ] Test offline (disable network)
- [ ] Verify all spells load
- [ ] Check spell details are correct

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use open20-core npm package for spell data (single source of truth)
- Load all spells at once (SRD is ~400 spells, small enough for memory)

### 5.2 Challenges Encountered

- None yet

### 5.3 Lessons Learned

- TBD

---

## 6. Completion Checklist

- [ ] Code implemented
- [ ] Unit tests written (80%+ coverage for P0)
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Committed with `[FR-001]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
