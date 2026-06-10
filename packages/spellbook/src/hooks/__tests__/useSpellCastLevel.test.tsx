// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Spell, SpellLevel } from 'open20-core';
import { useSpellCastLevel } from '../useSpellCastLevel';

const upcastSpell: Spell = {
  id: 'scorching-ray',
  name: 'Scorching Ray',
  level: 2 as SpellLevel,
  school: 'Evocation',
  castingTime: 'Action',
  range: '120 feet',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['You create rays of fire.'],
  usingAHigherLevelSpellSlot: [
    'The spell creates one additional ray for each slot level above 2nd.',
  ],
  damage: {
    entries: [{ dice: '4d6', type: 'Fire' }],
    perSlot: [{ dice: '1d6', type: 'Fire' }],
  },
  source: 'Test',
};

const healSpell: Spell = {
  id: 'cure-wounds',
  name: 'Cure Wounds',
  level: 1 as SpellLevel,
  school: 'Evocation',
  castingTime: 'Action',
  range: 'Touch',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['A creature regains hit points.'],
  usingAHigherLevelSpellSlot: ['The healing increases by 1d8 for each slot level above 1st.'],
  heal: { dice: '2d8', perSlot: '1d8' },
  source: 'Test',
};

describe('useSpellCastLevel', () => {
  it('exposes theoretical upcast levels without a character', () => {
    const { result } = renderHook(() => useSpellCastLevel(upcastSpell, null));

    expect(result.current.availableCastLevels).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.current.effectiveCastLevel).toBe(2);
    expect(result.current.effectiveDamageEntries).toEqual([{ dice: '4d6', type: 'Fire' }]);
  });

  it('scales damage and heal dice when cast level changes', () => {
    const { result } = renderHook(() => useSpellCastLevel(healSpell, null));

    act(() => {
      result.current.setSelectedCastLevel(3 as SpellLevel);
    });

    expect(result.current.effectiveCastLevel).toBe(3);
    expect(result.current.effectiveHealDice).toBe('4d8');
  });

  it('resets selected level when available slots change', () => {
    const characterWithSlots = {
      classes: [{ classId: 'Wizard', level: 5 }],
      spells: {
        spellSlots: {
          2: { total: 1, used: 0 },
          3: { total: 1, used: 0 },
        },
        pactMagicSlots: null,
        classSpellcasting: {},
      },
    } as any;

    const { result, rerender } = renderHook(
      ({ character }) => useSpellCastLevel(upcastSpell, character),
      { initialProps: { character: null as any } },
    );

    act(() => {
      result.current.setSelectedCastLevel(4 as SpellLevel);
    });
    expect(result.current.selectedCastLevel).toBe(4);

    rerender({ character: characterWithSlots });

    expect(result.current.availableCastLevels).toEqual([2, 3]);
    expect(result.current.selectedCastLevel).toBe(2);
  });
});
