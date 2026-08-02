// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Spell, SpellLevel, SpellSchool } from 'open20-core';
import type { SpellCapabilities } from '@open20/ui';

// Use vi.hoisted so the variable is available when vi.mock is hoisted
const { mockSharedCapabilities, storeState } = vi.hoisted(() => ({
  mockSharedCapabilities: vi.fn(),
  storeState: { activeCharacter: null as any },
}));

vi.mock('@open20/ui', () => ({
  useSpellCapabilities: mockSharedCapabilities,
  useSpellCastLevel: vi.fn(),
  useSpellCardSurface: vi.fn(),
}));

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: vi.fn((selector?: (s: any) => any) =>
    selector ? selector(storeState) : storeState,
  ),
}));

vi.mock('@/core/content-resolver', () => ({
  resolveDeps: vi.fn(() => ({ classes: {} })),
}));

import { useSpellCapabilities } from '../useSpellCapabilities';
import { resolveDeps } from '@/core/content-resolver';

const mockResolveDeps = vi.mocked(resolveDeps);

describe('useSpellCapabilities', () => {
  const emptyCaps: SpellCapabilities = {
    isKnown: false,
    isPrepared: false,
    isCantripKnown: false,
    isClassSpell: false,
    isConcentratingOnThis: false,
    knows: false,
    canCast: false,
    showPrepareButton: false,
    showLearnButton: false,
    showCantripButton: false,
    hasRegularSlot: false,
    hasPactSlot: false,
    isWarlock: false,
    matchingClassIds: [],
    accessibleClassIds: [],
    preparedClassIds: [],
    alwaysPreparedClassIds: [],
    cantripKnownClassIds: [],
    spellAttackBonus: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storeState.activeCharacter = null;
    mockResolveDeps.mockReturnValue({ classes: {} });
    mockSharedCapabilities.mockReturnValue(emptyCaps);
  });

  function makeSpell(overrides: Partial<Spell> = {}): Spell {
    return {
      id: 'test-spell',
      name: 'Test Spell',
      level: 1 as SpellLevel,
      school: 'Evocation' as SpellSchool,
      castingTime: '1 action',
      range: '60 ft.',
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

  it('passes null character and empty deps when no character', () => {
    const spell = makeSpell();

    renderHook(() => useSpellCapabilities(spell));

    expect(mockSharedCapabilities).toHaveBeenCalledWith(spell, null, { classes: {} });
  });

  it('passes active character and resolved deps from store', () => {
    const mockCharacter = {
      classes: [
        {
          classId: 'Wizard',
          level: 1,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 'd6', used: 0 },
        },
      ],
      spells: {
        classSpellcasting: {
          Wizard: {
            knownSpells: ['test-spell'],
            preparedSpells: ['test-spell'],
            alwaysPreparedSpells: [],
            knownCantrips: [],
            spellAttackBonus: 5,
            maxPrepared: 3,
          },
        },
        spellSlots: { 1: { total: 2, used: 0 } },
        pactMagicSlots: null,
        featSpells: {},
      },
      concentration: null,
    };

    const resolvedDeps = {
      classes: { Wizard: { spellSlotsByLevel: { 1: [2] } } },
    };

    storeState.activeCharacter = mockCharacter;
    mockResolveDeps.mockReturnValue(resolvedDeps as any);

    const spell = makeSpell();
    renderHook(() => useSpellCapabilities(spell));

    expect(mockSharedCapabilities).toHaveBeenCalledWith(spell, mockCharacter, resolvedDeps);
  });

  it('forwards the shared hook result', () => {
    mockSharedCapabilities.mockReturnValue({
      ...emptyCaps,
      isKnown: true,
      isPrepared: true,
      canCast: true,
      spellAttackBonus: 5,
    });

    const spell = makeSpell();
    const { result } = renderHook(() => useSpellCapabilities(spell));

    expect(result.current.isKnown).toBe(true);
    expect(result.current.isPrepared).toBe(true);
    expect(result.current.canCast).toBe(true);
    expect(result.current.spellAttackBonus).toBe(5);
  });

  it('passes null spell through to shared hook', () => {
    renderHook(() => useSpellCapabilities(null));

    expect(mockSharedCapabilities).toHaveBeenCalledWith(null, null, { classes: {} });
  });
});
