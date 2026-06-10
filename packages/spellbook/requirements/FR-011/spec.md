# FR-011: Concentration Status Marking

**Priority**: P1  
**Status**: ✅ Completed  
**Assigned To**: -  
**Depends On**: FR-010 (Spell slot consumption and recovery)  

---

## 1. Description

Support concentration status marking for spells that require concentration. When a character casts a concentration spell, they can mark it as being concentrated on, and the UI shows this status.

**Source**: PRD.md → FR-011

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player,  
**I want to** mark which spell I'm concentrating on,  
**so that** I can track concentration and know when I need to make concentration saves.

### 2.2 Acceptance Criteria

- [x] Concentration toggle button on spell cards/actions
- [x] Concentration banner showing current concentrated spell
- [x] Visual indicator (glowing border/icon) on concentrated spell
- [x] Automatically clear concentration when spell ends or character takes damage
- [x] Prevent concentrating on multiple spells simultaneously

### 2.3 UI Components Affected

- `ConcentrationToggle.tsx` - Toggle concentration on/off
- `ConcentrationBanner.tsx` - Shows current concentration status in character sheet
- `SpellCard.tsx` - Composable spell card with concentration indicator
- `SpellCardBadges.tsx` - Displays concentration badge
- `character-store.ts` - Manages concentration state

### 2.4 open20-core API Usage

```typescript
// packages/core/src/character/spell-casting.ts
// Concentration is tracked in character.spells.concentration

// Start concentrating on a spell
characterService.startConcentration(character, spellId);

// End concentration
characterService.endConcentration(character);
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Add `concentration` field to character state
2. Create `ConcentrationToggle` component
3. Create `ConcentrationBanner` component
4. Update `character-store.ts` with concentration actions
5. Add visual indicators to spell cards

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/stores/character-store.ts` | Modify | Add start/end concentration actions |
| `src/components/spell/ConcentrationToggle.tsx` | Create | Toggle button for concentration |
| `src/components/character/CharacterSheet/ConcentrationBanner.tsx` | Create | Banner showing concentration status |
| `src/hooks/useSpellCapabilities.ts` | Modify | Add concentration status to capabilities |

### 3.3 Estimated Effort

Medium - 4 hours (Completed)

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// TODO: Add tests to character-service.test.ts
describe('FR-011: Concentration Status', () => {
  it('should start concentrating on a spell', () => {
    // Test startConcentration
  });
  
  it('should end concentration', () => {
    // Test endConcentration
  });
  
  it('should replace existing concentration', () => {
    // Test that concentrating on a new spell clears the old one
  });
});
```

### 4.2 Integration Tests

- [ ] Concentration toggle updates UI immediately
- [ ] Concentration banner shows correct spell name
- [ ] Concentration clears on long rest

### 4.3 Manual Testing

- [x] Test concentration toggle on spell card
- [x] Test concentration banner display
- [x] Test concentration replacement when casting new concentration spell

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Store concentration state in `character.spells.concentration` as `spellId | null`
- Show concentration banner at top of character sheet for visibility
- Use visual glow effect on spell cards to indicate concentration

### 5.2 Challenges Encountered

- None - implementation was straightforward

### 5.3 Lessons Learned

- Concentration is a common D&D mechanic, should be prominently displayed
- Visual indicators help players remember they're concentrating

---

## 6. Completion Checklist

- [x] Code implemented
- [ ] Unit tests written (80%+ coverage for P0) - **NEEDS TESTS**
- [ ] Integration tests written
- [x] Manual testing completed
- [x] Documentation updated
- [x] Code review completed
- [x] Committed with `[FR-011]` prefix
- [x] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-06-05  
**Updated By**: AI Agent
