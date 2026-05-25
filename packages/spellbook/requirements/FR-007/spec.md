# FR-007: Auto-Calculate Spell Slots by Class/Level

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: open20-core `calculateSpellSlots()`  

---

## 1. Description

Automatically calculate available spell slots based on character class and level (Spell Slots). Different classes get different numbers of slots at each level.

**Source**: PRD.md → FR-007

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player, **I want to** see my available spell slots automatically calculated, **so that** I don't have to manually track them.

### 2.2 Acceptance Criteria

- [ ] Spell slots calculated based on class and level
- [ ] Slots update when level changes
- [ ] Correct slot table used for each class
- [ ] Multiclassing rules applied (if applicable)
- [ ] Slots displayed in Character Sheet

### 2.3 UI Components Affected

- `CharacterSheet.tsx` - Displays spell slots
- `SpellSlots.tsx` - Displays slot tracker
- `character-store.ts` - Stores calculated slots

### 2.4 open20-core API Usage

```typescript
// src/core/character-service.ts
import { calculateSpellSlots } from 'open20-core';
import type { Character, SpellSlotMap } from 'open20-core';

static getSpellSlots(character: Character): SpellSlotMap {
  return calculateSpellSlots(character);
}
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Call `calculateSpellSlots()` from open20-core
2. Store result in Zustand store
3. Display slots in SpellSlots component
4. Update slots when character levels up

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/core/character-service.ts` | Modify | Add getSpellSlots method |
| `src/stores/character-store.ts` | Modify | Store spell slots |
| `src/components/character-sheet/SpellSlots.tsx` | Create | Slot tracker UI |

### 3.3 Estimated Effort

Medium - 4 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/spell-slots.test.ts
describe('FR-007: Auto-Calculate Spell Slots', () => {
  it('should calculate slots for Wizard level 5', () => {
    const character = createMockCharacter({ class: 'Wizard', level: 5 });
    const slots = CharacterService.getSpellSlots(character);
    expect(slots[1].total).toBe(4);
    expect(slots[2].total).toBe(3);
    expect(slots[3].total).toBe(2);
  });
});
```

### 4.2 Integration Tests

- [ ] Spell slots display correctly for all classes
- [ ] Slots update when level changes
- [ ] Slot tracker shows correct numbers

### 4.3 Manual Testing

- [ ] Test Wizard, Cleric, Druid, etc.
- [ ] Test level progression
- [ ] Test multiclassing (if applicable)

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use open20-core `calculateSpellSlots()` (handles all class/level combinations)
- Store calculated slots in character object (immutable updates)

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
- [ ] Committed with `[FR-007]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
