// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Spell } from 'open20-core';
import { useSpellCapabilities } from '../useSpellCapabilities';
import { useCharacterStore } from '@/stores/character-store';
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
vi.mock('@/stores/character-store', () => ({
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

vi.mock('@/core/data-loader', () => ({
  dataLoader: {},
}));

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
});
