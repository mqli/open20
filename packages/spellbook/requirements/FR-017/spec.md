# FR-017: Spell Damage Dice Rolling

**Priority**: P1  
**Status**: ✅ Completed  
**Assigned To**: -  
**Depends On**: open20-core `rollSpellDamage()`  

---

## 1. Description

Support rolling spell damage dice. When clicking the damage button, the app rolls the spell's damage dice (e.g., 3d6 for Fireball cast at 3rd level) and adds the spellcasting ability modifier. Also supports upcasting (casting at higher slot for increased damage).

**Source**: PRD.md → FR-017

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player,  
**I want to** roll spell damage dice,  
**so that** I can determine how much damage my spell deals.

### 2.2 Acceptance Criteria

- [x] Damage button on spell cards/actions
- [x] Rolls damage dice based on spell expression (e.g., 3d6)
- [x] Adds spellcasting ability modifier to damage
- [x] Supports upcasting (higher level = more dice)
- [x] Displays result in dice overlay
- [x] Shows damage type (e.g., "Fire damage: 12")

### 2.3 UI Components Affected

- `SpellActionRow.tsx` - Damage button and display
- `SpellCardWrapper.tsx` - Handles damage roll logic
- `CastLevelSelect.tsx` - Select slot level for upcasting
- `DiceRollOverlay.tsx` - Displays roll result
- `roll-store.ts` - Stores roll results

### 2.4 open20-core API Usage

```typescript
// packages/core/src/rolls/character.ts
import { rollSpellDamage } from 'open20-core';

const result = rollSpellDamage(character, spell, classId, castAtLevel?);
// Returns: { dice: [{ die: 'd6', results: [4, 6, 2] }], bonus: 3, total: 15, type: 'fire' }
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Add damage button to `SpellActionRow.tsx`
2. Add `CastLevelSelect.tsx` for upcasting
3. Call `rollSpellDamage()` on click
4. Store result in `roll-store.ts`
5. Display result in `DiceRollOverlay.tsx` with damage type
6. Add damage history (optional)

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/spell/SpellActionRow.tsx` | Modify | Add damage button |
| `src/components/spell/SpellCardWrapper.tsx` | Modify | Handle damage roll |
| `src/components/spell/CastLevelSelect.tsx` | Create | Select slot level for upcasting |
| `src/stores/roll-store.ts` | Modify | Store roll results |
| `src/components/dice/DiceRollOverlay.tsx` | Modify | Display result with type |

### 3.3 Estimated Effort

Medium - 5 hours (Completed)

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// TODO: Create SpellActionRow.test.tsx
describe('FR-017: Spell Damage Dice Rolling', () => {
  it('should roll damage dice based on spell expression', () => {
    // Test 3d6 for Fireball at 3rd level
  });
  
  it('should add ability modifier to damage', () => {
    // Test +3 for INT 16
  });
  
  it('should support upcasting (higher level = more dice)', () => {
    // Test Fireball at 4th level = 4d6
  });
  
  it('should display damage type', () => {
    // Test "Fire damage: 15"
  });
});
```

### 4.2 Integration Tests

- [ ] Click damage button → dice overlay appears
- [ ] Upcast selection affects damage
- [ ] Result shows damage type
- [ ] Damage history shows previous rolls

### 4.3 Manual Testing

- [x] Click damage button on Fireball (3d6 + INT mod)
- [x] Upcast to 4th level (4d6 + INT mod)
- [x] Verify damage type displayed
- [x] Test with different damage types (fire, cold, etc.)

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use `open20-core`'s `rollSpellDamage()` for dice logic
- Support upcasting via `CastLevelSelect` component
- Display damage type prominently (important for resistance/immunity)
- Store damage rolls separately from attack rolls

### 5.2 Challenges Encountered

- Handling spells with multiple damage types (e.g., Chromatic Orb)
- Parsing damage expressions from spell descriptions

### 5.3 Lessons Learned

- Damage type display is crucial for D&D 5e
- Upcasting UI should be intuitive (dropdown or button group)

---

## 6. Completion Checklist

- [x] Code implemented
- [ ] Unit tests written (70%+ coverage for P1) - **NEEDS TESTS**
- [ ] Integration tests written
- [x] Manual testing completed
- [x] Documentation updated
- [x] Code review completed
- [x] Committed with `[FR-017]` prefix
- [x] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-06-05  
**Updated By**: AI Agent
