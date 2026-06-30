// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Spell } from 'open20-core';
import { useSpellCapabilities } from '../useSpellCapabilities';
import { useCharacterStore } from '@/stores/characterStore';
import { spellService } from '@/core/spell-service';
import {
  getCasterType,
  getMatchingClassIds,
  getSpellClassStates,
  getAvailableSlots,
  canCastSpellWithSlots,
  getBestSpellAttackBonus,
  pickBestClassId,
  knowsSpell,
  isSpellPrepared,
} from 'open20-core/spells';

// Mock the stores and services
vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: vi.fn(),
}));

vi.mock('@/core/spell-service', () => ({
  spellService: {
    isSpellKnown: vi.fn(),
    isSpellPrepared: vi.fn(),
    isSpellForCharacter: vi.fn(),
  },
}));

vi.mock('open20-core/spells', () => ({
  getCasterType: vi.fn(),
  getMatchingClassIds: vi.fn(() => []),
  getSpellClassStates: vi.fn(() => []),
  getAvailableSlots: vi.fn(() => ({ hasRegularSlot: false, hasPactSlot: false })),
  canCastSpellWithSlots: vi.fn(() => false),
  getBestSpellAttackBonus: vi.fn(() => 0),
  pickBestClassId: vi.fn(() => null),
  knowsSpell: vi.fn(() => false),
  isSpellPrepared: vi.fn(() => false),
}));

// Mock content-resolver (used by useSpellCapabilities)
vi.mock('@/core/content-resolver', () => ({
  resolveDeps: vi.fn(() => ({})),
}));

import { resolveDeps } from '@/core/content-resolver';

// Get mocked function references
const mockUseCharacterStore = vi.mocked(useCharacterStore);
const mockSpellService = vi.mocked(spellService);
const mockGetCasterType = vi.mocked(getCasterType);
const mockGetMatchingClassIds = vi.mocked(getMatchingClassIds);
const mockGetSpellClassStates = vi.mocked(getSpellClassStates);
const mockGetAvailableSlots = vi.mocked(getAvailableSlots);
const mockCanCastSpellWithSlots = vi.mocked(canCastSpellWithSlots);
const mockGetBestSpellAttackBonus = vi.mocked(getBestSpellAttackBonus);
const mockPickBestClassId = vi.mocked(pickBestClassId);
const mockKnowsSpell = vi.mocked(knowsSpell);
const mockIsSpellPrepared = vi.mocked(isSpellPrepared);
const mockResolveDeps = vi.mocked(resolveDeps);

describe('useSpellCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCharacterStore.mockReturnValue({ activeCharacter: null });
    mockGetCasterType.mockReturnValue({
      canLearn: false,
      canPrepare: false,
      isSpellbookCaster: false,
    });
    mockGetMatchingClassIds.mockReturnValue([]);
    mockGetSpellClassStates.mockReturnValue([]);
    mockGetAvailableSlots.mockReturnValue({ hasRegularSlot: false, hasPactSlot: false });
    mockCanCastSpellWithSlots.mockReturnValue(false);
    mockGetBestSpellAttackBonus.mockReturnValue(0);
    mockPickBestClassId.mockReturnValue(null);
    mockKnowsSpell.mockReturnValue(false);
    mockIsSpellPrepared.mockReturnValue(false);
    mockSpellService.isSpellKnown.mockReturnValue(false);
    mockSpellService.isSpellPrepared.mockReturnValue(false);
    mockSpellService.isSpellForCharacter.mockReturnValue(false);
  });

  const createMockCharacter = (overrides = {}) => ({
    id: 'char1',
    name: 'Test Character',
    classes: [
      {
        classId: 'Wizard',
        level: 1,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd6' as const, used: 0 },
      },
    ],
    spells: {
      classSpellcasting: {
        Wizard: {
          knownSpells: [],
          preparedSpells: [],
          alwaysPreparedSpells: [],
          knownCantrips: [],
          spellAttackBonus: 5,
          maxPrepared: 3,
        },
      },
      spellSlots: {},
      pactMagicSlots: null,
    },
    concentration: null,
    ...overrides,
  });

  const createMockSpell = (overrides: Partial<Spell> = {}): Spell =>
    ({
      id: 'test-spell',
      name: 'Test Spell',
      level: 1,
      school: 'Evocation',
      castingTime: '1 action',
      range: '60 ft.',
      duration: 'Instantaneous',
      attack: false,
      concentration: false,
      ritual: false,
      source: 'SRD' as const,
      components: ['V', 'S'] as const,
      description: [] as readonly string[],
      classes: ['Wizard'] as readonly string[],
      ...overrides,
    }) as unknown as Spell;

  it('should return empty capabilities when no character', () => {
    const spell = createMockSpell();

    const { result } = renderHook(() => useSpellCapabilities(spell));

    expect(result.current.isKnown).toBe(false);
    expect(result.current.isPrepared).toBe(false);
    expect(result.current.canCast).toBe(false);
    expect(result.current.spellAttackBonus).toBe(0);
  });

  it('should return empty capabilities when no spell', () => {
    const mockCharacter = createMockCharacter();
    mockUseCharacterStore.mockReturnValue({ activeCharacter: mockCharacter });

    const { result } = renderHook(() => useSpellCapabilities(null));

    expect(result.current.isKnown).toBe(false);
    expect(result.current.canCast).toBe(false);
  });

  it('should detect class spell correctly', () => {
    const mockCharacter = createMockCharacter();
    mockUseCharacterStore.mockReturnValue({ activeCharacter: mockCharacter });
    mockGetMatchingClassIds.mockReturnValue(['Wizard']);

    const spell = createMockSpell();
    const { result } = renderHook(() => useSpellCapabilities(spell));

    expect(result.current.isClassSpell).toBe(true);
    expect(result.current.matchingClassIds).toContain('Wizard');
  });

  it('should compute canCast for cantrips', () => {
    const mockCharacter = createMockCharacter({
      spells: {
        classSpellcasting: {
          Wizard: {
            knownSpells: [],
            preparedSpells: [],
            alwaysPreparedSpells: [],
            knownCantrips: ['test-cantrip'],
            spellAttackBonus: 5,
            maxPrepared: 3,
          },
        },
        spellSlots: {},
        pactMagicSlots: null,
      },
    });
    mockUseCharacterStore.mockReturnValue({ activeCharacter: mockCharacter });
    mockGetMatchingClassIds.mockReturnValue(['Wizard']);
    mockGetSpellClassStates.mockReturnValue([
      {
        classId: 'Wizard',
        isKnown: true,
        isPrepared: false,
        isAlwaysPrepared: false,
        isCantripKnown: true,
      },
    ]);
    mockGetCasterType.mockReturnValue({
      canLearn: true,
      canPrepare: true,
      isSpellbookCaster: true,
    });
    mockKnowsSpell.mockReturnValue(true);
    mockCanCastSpellWithSlots.mockReturnValue(true);

    const spell = createMockSpell({
      id: 'test-cantrip',
      level: 0 as const,
      classes: ['Wizard'] as readonly string[],
    });
    const { result } = renderHook(() => useSpellCapabilities(spell));

    expect(result.current.isClassSpell).toBe(true);
    expect(result.current.canCast).toBe(true);
  });

  describe('multiclass spell level access', () => {
    const createMulticlassCharacter = () => ({
      id: 'char1',
      name: 'Multiclass Character',
      // Cleric 5 + Wizard 1 → combined caster level 6 → 3rd-level slots
      classes: [
        {
          classId: 'Cleric',
          level: 5,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 'd8' as const, used: 0 },
        },
        {
          classId: 'Wizard',
          level: 1,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 'd6' as const, used: 0 },
        },
      ],
      spells: {
        classSpellcasting: {
          Cleric: {
            knownSpells: [],
            preparedSpells: [],
            alwaysPreparedSpells: [],
            knownCantrips: [],
            spellAttackBonus: 7,
            maxPrepared: 8,
          },
          Wizard: {
            knownSpells: ['shield', 'mage-armor'],
            preparedSpells: ['shield'],
            alwaysPreparedSpells: [],
            knownCantrips: [],
            spellAttackBonus: 5,
            maxPrepared: 3,
          },
        },
        // Combined multiclass slots (total caster level 6 = Cleric 5 + Wizard 1)
        spellSlots: {
          1: { total: 4, used: 0 } as { total: number; used: number },
          2: { total: 3, used: 0 } as { total: number; used: number },
          3: { total: 3, used: 0 } as { total: number; used: number },
        },
        pactMagicSlots: null,
      },
      concentration: null,
    });

    beforeEach(() => {
      // resolveDeps returns per-class spell slot tables for calculateSpellSlots
      mockResolveDeps.mockReturnValue({
        classes: {
          // Cleric 5: spellSlotsByLevel[5] = [4, 3, 2] → 3rd-level access
          Cleric: { spellSlotsByLevel: { 5: [4, 3, 2] } },
          // Wizard 1: spellSlotsByLevel[1] = [2] → only 1st-level access
          Wizard: { spellSlotsByLevel: { 1: [2] } },
        },
      } as any);
      // Caster type: preparer (not spellbook), all class spells are "known"
      mockGetCasterType.mockReturnValue({
        canLearn: false,
        canPrepare: true,
        isSpellbookCaster: false,
      });
      mockGetSpellClassStates.mockReturnValue([]);
      mockGetAvailableSlots.mockReturnValue({ hasRegularSlot: false, hasPactSlot: false });
      mockCanCastSpellWithSlots.mockReturnValue(false);
      mockGetBestSpellAttackBonus.mockReturnValue(0);
      mockPickBestClassId.mockReturnValue(null);
      mockKnowsSpell.mockReturnValue(false);
      mockIsSpellPrepared.mockReturnValue(false);
    });

    it('should allow 3rd-level spell when at least one matching class can access it', () => {
      const char = createMulticlassCharacter();
      mockUseCharacterStore.mockReturnValue({ activeCharacter: char });
      // Spell is on both Cleric and Wizard lists
      mockGetMatchingClassIds.mockReturnValue(['Cleric', 'Wizard']);
      mockKnowsSpell.mockReturnValue(true);

      const spell = createMockSpell({
        id: 'spirit-guardians',
        level: 3,
        classes: ['Cleric', 'Wizard'],
      });
      const { result } = renderHook(() => useSpellCapabilities(spell));

      // Cleric 5 can access 3rd-level spells → prepare button should show
      expect(result.current.isClassSpell).toBe(true);
      expect(result.current.matchingClassIds).toEqual(['Cleric', 'Wizard']);
      // Only Cleric 5 can access 3rd level; Wizard 1 cannot
      expect(result.current.accessibleClassIds).toEqual(['Cleric']);
      expect(result.current.showPrepareButton).toBe(true);
    });

    it('should deny 3rd-level spell when only a low-level class matches', () => {
      const char = createMulticlassCharacter();
      mockUseCharacterStore.mockReturnValue({ activeCharacter: char });
      // Spell is only on Wizard list
      mockGetMatchingClassIds.mockReturnValue(['Wizard']);
      mockKnowsSpell.mockReturnValue(true);

      const spell = createMockSpell({ id: 'fireball', level: 3, classes: ['Wizard'] });
      const { result } = renderHook(() => useSpellCapabilities(spell));

      // Wizard 1 can NOT access 3rd-level spells → prepare button hidden
      expect(result.current.isClassSpell).toBe(true);
      expect(result.current.matchingClassIds).toEqual(['Wizard']);
      expect(result.current.accessibleClassIds).toEqual([]);
      expect(result.current.showPrepareButton).toBe(false);
    });

    it('should allow 1st-level spell for any class', () => {
      const char = createMulticlassCharacter();
      mockUseCharacterStore.mockReturnValue({ activeCharacter: char });
      mockGetMatchingClassIds.mockReturnValue(['Wizard']);
      mockKnowsSpell.mockReturnValue(true);

      const spell = createMockSpell({ id: 'shield', level: 1, classes: ['Wizard'] });
      const { result } = renderHook(() => useSpellCapabilities(spell));

      // Wizard 1 can access 1st-level spells → prepare button should show
      expect(result.current.accessibleClassIds).toEqual(['Wizard']);
      expect(result.current.showPrepareButton).toBe(true);
    });

    it('should only include accessible classes in accessibleClassIds for multiclass', () => {
      const char = createMulticlassCharacter();
      mockUseCharacterStore.mockReturnValue({ activeCharacter: char });
      // Spell is on both Cleric and Wizard lists
      mockGetMatchingClassIds.mockReturnValue(['Cleric', 'Wizard']);
      mockKnowsSpell.mockReturnValue(true);

      // 1st-level: both Cleric 5 and Wizard 1 can access
      const l1Spell = createMockSpell({ id: 'shield', level: 1, classes: ['Cleric', 'Wizard'] });
      const { result: l1 } = renderHook(() => useSpellCapabilities(l1Spell));
      expect(l1.current.accessibleClassIds).toEqual(['Cleric', 'Wizard']);

      // 3rd-level: only Cleric 5 can access
      const l3Spell = createMockSpell({
        id: 'spirit-guardians',
        level: 3,
        classes: ['Cleric', 'Wizard'],
      });
      const { result: l3 } = renderHook(() => useSpellCapabilities(l3Spell));
      expect(l3.current.accessibleClassIds).toEqual(['Cleric']);
    });

    it('should show learn button only when per-class level allows it', () => {
      const char = createMulticlassCharacter();
      mockUseCharacterStore.mockReturnValue({ activeCharacter: char });
      mockGetMatchingClassIds.mockReturnValue(['Wizard']);
      // Spellbook caster so canLearn is true
      mockGetCasterType.mockReturnValue({
        canLearn: true,
        canPrepare: true,
        isSpellbookCaster: true,
      });
      mockKnowsSpell.mockReturnValue(false);

      // 3rd-level Wizard-only spell: Wizard 1 can't learn it
      const highSpell = createMockSpell({ id: 'fireball', level: 3, classes: ['Wizard'] });
      const { result: resultHigh } = renderHook(() => useSpellCapabilities(highSpell));
      expect(resultHigh.current.showLearnButton).toBe(false);

      // 1st-level Wizard spell: Wizard 1 can learn it
      const lowSpell = createMockSpell({ id: 'shield', level: 1, classes: ['Wizard'] });
      const { result: resultLow } = renderHook(() => useSpellCapabilities(lowSpell));
      expect(resultLow.current.showLearnButton).toBe(true);
    });
  });
});
