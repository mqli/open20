// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Spell } from 'open20-core';
import { useSpellCapabilities } from '../useSpellCapabilities';
import { useCharacterStore } from '@/stores/character-store';
import { spellService } from '@/core/spell-service';
import { getCasterType } from '@/core/character-service';

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

vi.mock('@/core/character-service', () => ({
  getCasterType: vi.fn(),
}));

const mockUseCharacterStore = useCharacterStore as unknown as ReturnType<typeof vi.fn>;
const mockSpellService = spellService as unknown as Record<string, unknown>;
const mockGetCasterType = getCasterType as unknown as ReturnType<typeof vi.fn>;

describe('useSpellCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCharacterStore.mockReturnValue({ activeCharacter: null });
    mockGetCasterType.mockReturnValue({
      canLearn: false,
      canPrepare: false,
      isSpellbookCaster: false,
    });
    (mockSpellService.isSpellKnown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (mockSpellService.isSpellPrepared as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (mockSpellService.isSpellForCharacter as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });

  const baseSpell: Readonly<
    Pick<Spell, 'concentration' | 'ritual' | 'source' | 'components' | 'description' | 'classes'>
  > = {
    concentration: false,
    ritual: false,
    source: 'SRD',
    components: ['V', 'S'] as const,
    description: [] as readonly string[],
    classes: ['Wizard'] as readonly string[],
  };

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
      ...baseSpell,
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
    (mockSpellService.isSpellForCharacter as ReturnType<typeof vi.fn>).mockReturnValue(true);

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
    (mockSpellService.isSpellForCharacter as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const spell = createMockSpell({
      id: 'test-cantrip',
      level: 0 as const,
      classes: ['Wizard'] as readonly string[],
    });
    const { result } = renderHook(() => useSpellCapabilities(spell));

    expect(result.current.isClassSpell).toBe(true);
    expect(result.current.canCast).toBe(true); // Cantrips are castable if class spell
  });
});
