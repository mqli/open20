// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Character, Spell, SpellLevel, SpellSchool } from 'open20-core';

// Use vi.hoisted so variables are available when vi.mock is hoisted
const { mockSharedCastLevel, storeState } = vi.hoisted(() => ({
  mockSharedCastLevel: vi.fn(),
  storeState: { activeCharacter: null as any },
}));

vi.mock('@open20/ui', () => ({
  useSpellCastLevel: mockSharedCastLevel,
}));

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: vi.fn((selector?: (s: any) => any) =>
    selector ? selector(storeState) : storeState,
  ),
}));

import { useSpellCastLevel } from '../useSpellCastLevel';

describe('useSpellCastLevel', () => {
  const mockReturn = {
    availableCastLevels: [2, 3, 4] as SpellLevel[],
    selectedCastLevel: 2 as SpellLevel,
    setSelectedCastLevel: vi.fn(),
    effectiveCastLevel: 2 as SpellLevel,
    effectiveDamageEntries: [{ dice: '4d6', type: 'Fire' }],
    effectiveHealDice: '',
  };

  function makeSpell(overrides: Partial<Spell> = {}): Spell {
    return {
      id: 'scorching-ray',
      name: 'Scorching Ray',
      level: 2 as SpellLevel,
      school: 'Evocation' as SpellSchool,
      castingTime: '1 action',
      range: '120 ft.',
      duration: 'Instantaneous',
      attack: false,
      concentration: false,
      ritual: false,
      source: 'SRD',
      components: ['V', 'S'],
      description: [],
      classes: ['Wizard'],
      ...overrides,
    } as Spell;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    storeState.activeCharacter = null;
    mockSharedCastLevel.mockReturnValue(mockReturn);
  });

  it('read active from store', () => {
    const mockCharacter = {
      classes: [{ classId: 'Wizard', level: 5 }],
      spells: {
        classSpellcasting: {},
        spellSlots: {},
        pactMagicSlots: null,
        featSpells: {},
      },
    } as unknown as Character;
    storeState.activeCharacter = mockCharacter;

    const spell = makeSpell();
    renderHook(() => useSpellCastLevel(spell));

    expect(mockSharedCastLevel).toHaveBeenCalledWith(spell, mockCharacter);
  });

  it('passes null character when store has none', () => {
    const spell = makeSpell();
    renderHook(() => useSpellCastLevel(spell));

    expect(mockSharedCastLevel).toHaveBeenCalledWith(spell, null);
  });

  it('forwards shared result', () => {
    const spell = makeSpell();
    const { result } = renderHook(() => useSpellCastLevel(spell));

    expect(result.current.availableCastLevels).toEqual([2, 3, 4]);
    expect(result.current.selectedCastLevel).toBe(2);
    expect(result.current.effectiveCastLevel).toBe(2);
    expect(result.current.effectiveDamageEntries).toEqual([{ dice: '4d6', type: 'Fire' }]);
    expect(result.current.effectiveHealDice).toBe('');
  });
});
