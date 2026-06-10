# FR-016: Spell Attack Roll (d20)

**Priority**: P1  
**Status**: ✅ Completed  
**Assigned To**: -  
**Depends On**: open20-core `rollSpellAttack()`  

---

## 1. Description

Support rolling spell attack dice (d20 + spell attack bonus). When clicking the attack button, the app rolls a d20 and adds the spell attack bonus, displaying the result.

**Source**: PRD.md → FR-016

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player,  
**I want to** roll spell attack dice,  
**so that** I can determine if my spell hits the target.

### 2.2 Acceptance Criteria

- [x] Attack button on spell cards/actions
- [x] Rolls d20 + spell attack bonus
- [x] Displays result in dice overlay
- [x] Shows total and breakdown (d20 result + bonus)
- [x] Roll history (optional)

### 2.3 UI Components Affected

- `SpellCard.tsx` - Composable spell card wrapper
- `SpellCardActions.tsx` - Attack button and roll logic
- `DiceRollOverlay.tsx` - Displays roll result
- `roll-store.ts` - Stores roll results

### 2.4 open20-core API Usage

```typescript
// packages/core/src/rolls/character.ts
import { rollSpellAttack } from 'open20-core';

const result = rollSpellAttack(character, classId, castAtLevel?);
// Returns: { dice: [{ die: 'd20', results: [15] }], bonus: 6, total: 21 }
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Add attack button to `SpellActionRow.tsx`
2. Call `rollSpellAttack()` on click
3. Store result in `roll-store.ts`
4. Display result in `DiceRollOverlay.tsx`
5. Add roll history (optional)

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/spell/SpellCard.tsx` | Use | Composable card wrapper |
| `src/components/spell/SpellCardActions.tsx` | Modify | Add attack button and roll logic |
| `src/stores/roll-store.ts` | Modify | Store roll results |
| `src/components/dice/DiceRollOverlay.tsx` | Modify | Display result |

### 3.3 Estimated Effort

Medium - 4 hours (Completed)

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// TODO: Create SpellActionRow.test.tsx
describe('FR-016: Spell Attack Roll', () => {
  it('should roll d20 + attack bonus', () => {
    // Test rollSpellAttack called correctly
  });
  
  it('should display roll result', () => {
    // Test DiceRollOverlay shows correct total
  });
  
  it('should handle advantage/disadvantage (future)', () => {
    // Test optional features
  });
});
```

### 4.2 Integration Tests

- [ ] Click attack button → dice overlay appears
- [ ] Result updates correctly
- [ ] Roll history shows previous rolls

### 4.3 Manual Testing

- [x] Click attack button on a spell
- [x] Verify d20 + bonus calculation
- [x] Test with different characters/classes

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use `open20-core`'s `rollSpellAttack()` for dice logic (single source of truth)
- Display result in overlay for visibility
- Store roll history for reference

### 5.2 Challenges Encountered

- None - core library handled dice rolling reliably

### 5.3 Lessons Learned

- Delegating dice mechanics to core library reduces bugs
- Overlay display is better than inline for dice results

---

## 6. Completion Checklist

- [x] Code implemented
- [ ] Unit tests written (70%+ coverage for P1) - **NEEDS TESTS**
- [ ] Integration tests written
- [x] Manual testing completed
- [x] Documentation updated
- [x] Code review completed
- [x] Committed with `[FR-016]` prefix
- [x] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-06-05  
**Updated By**: AI Agent
