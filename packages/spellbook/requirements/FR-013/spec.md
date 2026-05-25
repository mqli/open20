# FR-013: Component Detail Display (V/S/M)

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-002 (Spell data fields), FR-012 (Spell detail page)  

---

## 1. Description

Component detail display: Verbal (V), Somatic (S), Material (M), material components show specific requirements.

**Source**: PRD.md → FR-013

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player, **I want to** see which components are required for a spell, **so that** I know if I need a material component pouch or can cast silently.

### 2.2 Acceptance Criteria

- [ ] Verbal (V) component displayed with icon
- [ ] Somatic (S) component displayed with icon
- [ ] Material (M) component displayed with icon
- [ ] Material component details shown (what item is needed)
- [ ] Components displayed in SpellCard (shorthand: V, S, M)
- [ ] Components displayed in SpellDetail (full details)

### 2.3 UI Components Affected

- `SpellCard.tsx` - Shows component shorthand (V, S, M)
- `SpellDetail.tsx` - Shows full component details

### 2.4 open20-core API Usage

```typescript
// Spell components from open20-core
import type { Spell } from 'open20-core';

const spell = getSpell('fire-bolt');
console.log(spell.components);
// { V: true, S: true, M: false, materialDescription: undefined }

const spell2 = getSpell('identify');
console.log(spell2.components);
// { V: true, S: false, M: true, materialDescription: 'a pearl worth at least 100 gp...' }
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Display V, S, M icons in SpellCard
2. Display full component details in SpellDetail
3. Show material component description when M is true
4. Use icons: speech bubble (V), hand (S), gem (M)

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/spell-library/SpellCard.tsx` | Modify | Show V, S, M shorthand |
| `src/components/spell-library/SpellDetail.tsx` | Modify | Show full component details |

### 3.3 Estimated Effort

Small - 3 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/component-display.test.tsx
describe('FR-013: Component Detail Display', () => {
  it('should display V, S, M icons', () => {
    render(<SpellCard spellId="fire-bolt" />);
    expect(screen.getByText('V')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });
  
  it('should show material component details', () => {
    render(<SpellDetail spellId="identify" />);
    expect(screen.getByText(/pearl worth at least 100 gp/)).toBeInTheDocument();
  });
});
```

### 4.2 Integration Tests

- [ ] V, S, M shown correctly in SpellCard
- [ ] Material description shown in SpellDetail
- [ ] Icons change based on components required

### 4.3 Manual Testing

- [ ] Test spell with only V
- [ ] Test spell with V + S
- [ ] Test spell with V + S + M
- [ ] Verify material descriptions are accurate

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use text shorthand in SpellCard (V, S, M) to save space
- Show full details in SpellDetail with icons
- Use lucide-react icons for V (MessageSquare), S (Hand), M (Gem)

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
- [ ] Committed with `[FR-013]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
