# FR-002: Spell Data Fields

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-001 (SRD spell data)  

---

## 1. Description

Each spell contains the following fields: name, level (0-9), school, casting time, range, components (V/S/M), duration, description, class list, whether attack roll is required, damage dice, damage type.

**Source**: PRD.md → FR-002

---

## 2. Detailed Specification

### 2.1 User Story

**As a** spellcasting player, **I want to** see all relevant spell information, **so that** I can understand how to cast the spell correctly.

### 2.2 Acceptance Criteria

- [ ] Name field displayed
- [ ] Level field displayed (0 = cantrip)
- [ ] School field displayed
- [ ] Casting time field displayed
- [ ] Range field displayed
- [ ] Components field displayed (V, S, M with details)
- [ ] Duration field displayed
- [ ] Description field displayed
- [ ] Class list displayed
- [ ] Attack roll indicator displayed (if applicable)
- [ ] Damage dice and type displayed (if applicable)

### 2.3 UI Components Affected

- `SpellCard.tsx` - Shows level, school, components
- `SpellDetail.tsx` - Shows all fields
- `SpellDetail.tsx` - Shows damage/dice info

### 2.4 open20-core API Usage

```typescript
// Spell type from open20-core
import type { Spell } from 'open20-core';

// Accessing spell fields
const spell: Spell = getSpell('fire-bolt');
console.log(spell.name);        // "Fire Bolt"
console.log(spell.level);       // 0 (cantrip)
console.log(spell.school);      // "Evocation"
console.log(spell.castingTime); // "1 action"
console.log(spell.range);       // "120 feet"
console.log(spell.components);  // { V: true, S: true, M: false }
console.log(spell.duration);    // "Instantaneous"
console.log(spell.description); // "You hurl a mote of fire..."
console.log(spell.classes);     // ["Sorcerer", "Wizard", "Warlock"]
console.log(spell.attackType);  // "ranged" or null
console.log(spell.damage);      // { dice: "1d10", type: "fire" } or null
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Define Spell type (re-export from open20-core)
2. Update SpellCard to show required fields
3. Update SpellDetail to show all fields
4. Add damage/dice display if applicable

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/core/types.ts` | Create | Re-export Spell type from open20-core |
| `src/components/spell-library/SpellCard.tsx` | Modify | Show level, school, components |
| `src/components/spell-library/SpellDetail.tsx` | Modify | Show all spell fields |

### 3.3 Estimated Effort

Medium - 4 hours

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/spell-display.test.ts
describe('FR-002: Spell Data Fields', () => {
  it('should display all required fields', () => {
    const spell = SpellService.getSpell('fire-bolt');
    expect(spell.name).toBeDefined();
    expect(spell.level).toBeDefined();
    expect(spell.school).toBeDefined();
    expect(spell.castingTime).toBeDefined();
    expect(spell.range).toBeDefined();
    expect(spell.components).toBeDefined();
    expect(spell.duration).toBeDefined();
    expect(spell.description).toBeDefined();
    expect(spell.classes).toBeDefined();
  });
});
```

### 4.2 Integration Tests

- [ ] SpellCard shows level, school, components
- [ ] SpellDetail shows all fields
- [ ] Damage/dice info shown when applicable

### 4.3 Manual Testing

- [ ] Check multiple spells for correct field display
- [ ] Check cantrips show "Cantrip" not "Level 0"
- [ ] Check material component details show correctly

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Re-export Spell type from open20-core (single source of truth)
- Use open20-core field names directly (no mapping layer)

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
- [ ] Committed with `[FR-002]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
