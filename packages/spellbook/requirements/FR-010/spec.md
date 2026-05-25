# FR-010: Spell Slot Consumption and Recovery

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-007 (auto-calculate spell slots)  

---

## 1. Description

Support spell slot consumption (click to consume) and recovery (click to recover) operations. Also support Long Rest to recover all slots.

**Source**: PRD.md → FR-010

---

## 2. User Stories

**As a** spellcasting player,  
**I want to** track my spell slot consumption and recovery,  
**so that** I know exactly which spells I can still cast in the game.

---

## 3. Acceptance Criteria

### Spell Slot Tracker (UI)
- [ ] Row per spell level (0-9)
- [ ] Each slot shown as a circle (filled = available, outline = expended)
- [ ] Label: "Level N" on the left
- [ ] Label: "M/N remaining" on the right
- [ ] Cantrips row shows "Always available" (no circles)

### Slot Interaction
- [ ] Click filled circle → consume slot (change to expended)
- [ ] Click expended circle → recover slot (change to filled)
- [ ] Visual feedback: smooth transition (150ms)
- [ ] Warning tint when all slots at a level are expended

### Long Rest
- [ ] "Long Rest — Recover All Slots" button at bottom of slots section
- [ ] Single tap restores all slots
- [ ] Confirmation dialog (to prevent accidental click)
- [ ] Button is full-width, secondary style

### Short Rest
- [ ] "Short Rest" button (if character has short-rest resources)
- [ ] Recovers Hit Dice, some class features

### State Updates
- [ ] All slot changes persist to localStorage
- [ ] Character store updates immediately on click
- [ ] Undo? (Not in MVP - future enhancement)

---

## 4. UI Components Affected

| Component | Changes |
|-----------|----------|
| `SpellSlots.tsx` | New component - spell slot tracker |
| `CharacterSheet.tsx` | Integrate SpellSlots component |
| `character-store.ts` | Add `consumeSpellSlot`, `recoverSpellSlot`, `longRest` actions |

---

## 5. Technical Specification

### 5.1 Component: SpellSlots

```typescript
// src/components/character-sheet/SpellSlots.tsx
import { useCharacterStore } from '../../stores/character-store';
import type { SpellSlotMap } from 'open20-core';

export function SpellSlots() {
  const { activeCharacter, consumeSpellSlot, recoverSpellSlot, longRest } = useCharacterStore();
  
  if (!activeCharacter) return null;

  const slots = activeCharacter.spellSlots;

  return (
    <section className="spell-slots space-y-3">
      <h2 className="text-lg font-medium">Spell Slots</h2>

      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
        const slotInfo = slots[level];
        if (!slotInfo || slotInfo.total === 0) return null;

        const available = slotInfo.total - slotInfo.used;
        const allExpended = available === 0;

        return (
          <div 
            key={level} 
            className={`slot-row flex items-center gap-3 ${allExpended ? 'opacity-60' : ''}`}
          >
            <label className="w-20 text-sm">
              {level === 0 ? 'Cantrips' : `Level ${level}`}
            </label>

            <div className="slot-circles flex gap-1">
              {Array.from({ length: slotInfo.total }, (_, i) => {
                const isAvailable = i >= slotInfo.used;
                
                return (
                  <button
                    key={i}
                    className={`slot-circle w-6 h-6 rounded-full transition-all duration-150 ${
                      isAvailable
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'border-2 border-gray-300 border-dashed hover:border-gray-400'
                    }`}
                    onClick={() => {
                      if (isAvailable) {
                        consumeSpellSlot(level);
                      } else {
                        recoverSpellSlot(level);
                      }
                    }}
                    aria-label={`Level ${level} slot ${i + 1}: ${isAvailable ? 'available' : 'expended'}`}
                  />
                );
              })}
            </div>

            <span className="slot-count text-sm text-gray-600">
              {available}/{slotInfo.total}
            </span>
          </div>
        );
      })}

      <button
        onClick={() => {
          if (confirm('Are you sure you want to take a Long Rest? This will recover all spell slots.')) {
            longRest();
          }
        }}
        className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Long Rest — Recover All Slots
      </button>
    </section>
  );
}
```

### 5.2 Store Actions

```typescript
// In character-store.ts
consumeSpellSlot: (level: number) => {
  const { activeCharacter } = get();
  if (!activeCharacter) return;
  
  const updated = CharacterService.consumeSpellSlot(activeCharacter, level);
  set({ activeCharacter: updated });
  StorageService.saveCharacter(updated);
},

recoverSpellSlot: (level: number) => {
  const { activeCharacter } = get();
  if (!activeCharacter) return;
  
  const updated = CharacterService.recoverSpellSlot(activeCharacter, level);
  set({ activeCharacter: updated });
  StorageService.saveCharacter(updated);
},

longRest: () => {
  const { activeCharacter } = get();
  if (!activeCharacter) return;
  
  const updated = CharacterService.longRest(activeCharacter);
  set({ activeCharacter: updated });
  StorageService.saveCharacter(updated);
},
```

### 5.3 Spell Slot Data Structure

```typescript
// From open20-core
interface SpellSlots {
  [level: number]: {
    total: number;  // Total slots at this level
    used: number;    // Number of slots used
  };
}

// Example: Level 5 Wizard
{
  0: { total: 6, used: 0 },  // Cantrips known
  1: { total: 4, used: 2 },  // 2 used, 2 available
  2: { total: 3, used: 0 },
  3: { total: 2, used: 0 },
  // ... levels 4-9
}
```

---

## 6. open20-core API Usage

```typescript
// src/core/character-service.ts
import { consumeSpellSlot, recoverSpellSlot, longRest } from 'open20-core';

static consumeSpellSlot(character: Character, level: number): Character {
  return consumeSpellSlot(character, level);
}

static recoverSpellSlot(character: Character, level: number): Character {
  return recoverSpellSlot(character, level);
}

static longRest(character: Character): Character {
  return longRest(character);
}
```

---

## 7. Design Mockup

```
┌─────────────────────────────────┐
│ SPELL SLOTS                    │
├─────────────────────────────────┤
│ Cantrips     [Always available] │
│ Level 1      ● ● ● ○ 3/4     │  <- ● = available, ○ = expended
│ Level 2      ● ● ● 3/3         │
│ Level 3      ● ● 2/2           │
│                                │
│ [Long Rest — Recover All Slots]│
└─────────────────────────────────┘
```

### Visual States:

1. **Available slot**: Filled green circle (●)
2. **Expended slot**: Dashed outline circle (○)
3. **All expended (row)**: 60% opacity, warning tint
4. **Hover**: Slight scale transform (1.1x)

---

## 8. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Click slot when none available | Disable interaction, show tooltip |
| Long Rest with no expended slots | Still works (no-op), show message "No slots to recover" |
| Multiple clicks in rapid succession | Debounce or disable during animation |
| Character with no spell slots | Hide Spell Slots section entirely |

---

## 9. Testing Plan

### 9.1 Unit Tests

```typescript
// tests/unit/spell-slots.test.ts
describe('SpellSlots', () => {
  it('should consume slot on click', () => {
    const character = createMockCharacter();
    const updated = CharacterService.consumeSpellSlot(character, 1);
    
    expect(updated.spellSlots[1].used).toBe(1);
  });

  it('should recover slot on click', () => {
    const character = createMockCharacterWithExpendedSlots();
    const updated = CharacterService.recoverSpellSlot(character, 1);
    
    expect(updated.spellSlots[1].used).toBe(0);
  });

  it('should recover all slots on long rest', () => {
    const character = createMockCharacterWithExpendedSlots();
    const updated = CharacterService.longRest(character);
    
    Object.values(updated.spellSlots).forEach(slot => {
      expect(slot.used).toBe(0);
    });
  });
});
```

### 9.2 Integration Tests

- [ ] Click slot circle → store updates
- [ ] Long Rest → all slots recovered
- [ ] State persists to localStorage

### 9.3 Manual Testing

- [ ] Test on desktop (mouse click)
- [ ] Test on mobile (touch)
- [ ] Test keyboard navigation (Tab to slots, Enter to toggle)
- [ ] Test screen reader announcements

---

**Last Updated**: 2026-05-10  
**Updated By**: Tech Lead
