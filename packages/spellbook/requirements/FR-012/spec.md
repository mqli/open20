# FR-012: Spell Detail Page (Full Information)

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-002 (Spell data fields)  

---

## 1. Description

Spell detail page displays complete information: name, level, school, casting time, range, components, duration, description text.

**Source**: PRD.md → FR-012

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player, **I want to** view complete spell information, **so that** I correctly understand the spell effects.

### 2.2 Acceptance Criteria

- [ ] Spell name displayed
- [ ] Level displayed (cantrip or Level N)
- [ ] School displayed with color coding
- [ ] Casting time displayed
- [ ] Range displayed
- [ ] Components displayed (V, S, M with details)
- [ ] Duration displayed
- [ ] Full description displayed
- [ ] "At Higher Levels" section shown (if applicable)
- [ ] Available classes shown at bottom

### 2.3 UI Components Affected

- `SpellDetail.tsx` - Flyout panel showing spell details

### 2.4 open20-core API Usage

```typescript
// src/core/spell-service.ts
import { getSpell } from 'open20-core';
import type { Spell } from 'open20-core';

static getSpell(id: string): Spell | undefined {
  return getSpell(id);
}
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Create SpellDetail flyout panel
2. Display all spell fields
3. Add color coding for school
4. Add "At Higher Levels" section
5. Add available classes at bottom
6. Add dice rolling section (if applicable)

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/spell-library/SpellDetail.tsx` | Create | Flyout panel for spell details |

### 3.3 Estimated Effort

Medium - 6 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/spell-detail.test.tsx
describe('FR-012: Spell Detail Page', () => {
  it('should display all spell information', () => {
    render(<SpellDetail spellId="fire-bolt" />);
    expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
    expect(screen.getByText('Evocation')).toBeInTheDocument();
  });
});
```

### 4.2 Integration Tests

- [ ] Click spell card opens detail flyout
- [ ] All fields displayed correctly
- [ ] "At Higher Levels" shows when applicable
- [ ] Close flyout works (X button, Escape key, backdrop click)

### 4.3 Manual Testing

- [ ] Test multiple spells
- [ ] Test cantrips vs leveled spells
- [ ] Test spells with material components
- [ ] Test spells with "At Higher Levels"

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Use flyout panel (not separate page) for better UX
- Flyout slides in from right on desktop, bottom sheet on mobile

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
- [ ] Committed with `[FR-012]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
