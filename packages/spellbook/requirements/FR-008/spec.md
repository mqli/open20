# FR-008: Spell Preparation with Class Rules

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-006 (Character profile), FR-004 (Spell search)  

---

## 1. Description

Support spell preparation (Prepare Spells) feature, automatically limit preparation quantity according to class rules (refer to Spell Preparation by Class table). Different classes have different preparation rules.

**Source**: PRD.md → FR-008

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player (Wizard/Cleric/Druid), **I want to** prepare spells for the day, **so that** I comply with D&D rules and can cast my prepared spells.

### 2.2 Acceptance Criteria

- [ ] Wizard/Cleric/Druid can prepare spells (preparation casters)
- [ ] Sorcerer/Warlock/Bard cannot prepare (known casters)
- [ ] Preparation limit = Level + Spellcasting Ability Modifier
- [ ] Only spells on class spell list can be prepared
- [ ] Prepared spells saved to character
- [ ] "Prepare Spells" modal shows available spells

### 2.3 UI Components Affected

- `CharacterSheet.tsx` - Shows "Prepare Spells" button
- `PreparedSpells.tsx` - Shows prepared spells list
- `PrepareSpellsModal.tsx` - Modal for preparing spells

### 2.4 open20-core API Usage

```typescript
// src/core/character-service.ts
import { prepareSpell, unprepareSpell, getPreparedSpells } from 'open20-core';

static prepareSpell(character: Character, spellId: string): Character {
  return prepareSpell(character, spellId);
}

static unprepareSpell(character: Character, spellId: string): Character {
  return unprepareSpell(character, spellId);
}

static getPreparedSpells(character: Character): Spell[] {
  return getPreparedSpells(character);
}
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Determine if character is preparation caster
2. Calculate preparation limit (Level + Spellcasting Ability Modifier)
3. Create "Prepare Spells" modal
4. Show spells available for that class
5. Allow toggling preparation
6. Enforce preparation limit

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/character-sheet/PrepareSpellsModal.tsx` | Create | Modal for spell preparation |
| `src/components/character-sheet/PreparedSpells.tsx` | Create | List of prepared spells |
| `src/stores/character-store.ts` | Modify | Add prepare/unprepare actions |

### 3.3 Estimated Effort

Large - 8 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/spell-preparation.test.ts
describe('FR-008: Spell Preparation', () => {
  it('should allow Wizard to prepare spells', () => {
    const wizard = createMockCharacter({ class: 'Wizard', level: 5, int: 16 });
    expect(canPrepareSpells(wizard)).toBe(true);
    expect(getPreparationLimit(wizard)).toBe(8); // 5 + 3
  });
  
  it('should not allow Sorcerer to prepare spells', () => {
    const sorcerer = createMockCharacter({ class: 'Sorcerer', level: 5 });
    expect(canPrepareSpells(sorcerer)).toBe(false);
  });
});
```

### 4.2 Integration Tests

- [ ] "Prepare Spells" button shows for Wizards
- [ ] "Prepare Spells" button hidden for Sorcerers
- [ ] Preparation limit enforced
- [ ] Prepared spells persist after refresh

### 4.3 Manual Testing

- [ ] Test Wizard preparation
- [ ] Test Cleric preparation
- [ ] Test Sorcerer (no preparation)
- [ ] Test preparation limit

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use open20-core `prepareSpell()` and `unprepareSpell()` (handles class rules)
- Preparation limit calculated by open20-core

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
- [ ] Committed with `[FR-008]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
