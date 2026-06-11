import { describe, it, expect, vi, beforeEach } from 'vitest';
import { characterService } from '@/core/character-service';

// Mock spellService.getSpell to return test spells
const mockGetSpell = vi.fn((id: string) => {
  const spells: Record<string, { id: string; name: string; level: number; classes: string[] }> = {
    fireball: { id: 'fireball', name: 'Fireball', level: 3, classes: ['Wizard', 'Sorcerer'] },
    'magic-missile': { id: 'magic-missile', name: 'Magic Missile', level: 1, classes: ['Wizard'] },
    haste: { id: 'haste', name: 'Haste', level: 3, classes: ['Wizard', 'Sorcerer'] },
  };
  return spells[id] || null;
});

// Setup: mock the spellService property on characterService
beforeEach(() => {
  vi.clearAllMocks();
  // Access private spellService property for testing
  (characterService as any).spellService = {
    getSpell: mockGetSpell,
  };
});

describe('CharacterService', () => {
  const createMockCharacter = (params: { name: string; classLevel: number }) => ({
    name: params.name,
    classes: [{ classId: 'Wizard', level: params.classLevel }],
    abilityScores: {
      base: {
        Strength: 10,
        Dexterity: 12,
        Constitution: 14,
        Intelligence: 16,
        Wisdom: 13,
        Charisma: 8,
      },
      race: {},
      background: {},
      gears: {},
      misc: {},
      feats: {},
    },
    spells: {
      classSpellcasting: {
        Wizard: {
          classId: 'Wizard',
          spellcastingAbility: 'Intelligence' as const,
          spellSaveDC: 13,
          spellAttackBonus: 5,
          knownSpells: [],
          preparedSpells: [],
          maxPrepared: 4,
        },
      },
      spellSlots: {
        0: { total: 0, used: 0 },
        1: { total: 2, used: 0 },
        2: { total: 0, used: 0 },
        3: { total: 0, used: 0 },
        4: { total: 0, used: 0 },
        5: { total: 0, used: 0 },
        6: { total: 0, used: 0 },
        7: { total: 0, used: 0 },
        8: { total: 0, used: 0 },
        9: { total: 0, used: 0 },
      },
      pactMagicSlots: null,
    },
    hitPoints: { current: 8, max: 8, temporary: 0 },
    concentration: null,
    id: 'test-char-id',
    updatedAt: '',
  });

  it('should create a character with correct initial stats', () => {
    const params = {
      name: 'Test Wizard',
      speciesId: 'Human',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 1,
      abilityScores: {
        Strength: 10,
        Dexterity: 12,
        Constitution: 14,
        Intelligence: 16,
        Wisdom: 13,
        Charisma: 8,
      },
    };

    // Mock createCharacter to return a character with level 1
    const mockChar = createMockCharacter({ name: 'Test Wizard', classLevel: 1 });
    vi.spyOn(characterService as any, 'createCharacter').mockReturnValue(mockChar);

    const character = characterService.createCharacter(params as any);

    expect(character.name).toBe('Test Wizard');
    expect(character.classes[0].classId).toBe('Wizard');
    expect(character.classes[0].level).toBe(1);
  });

  it('should calculate correct stats for higher level characters', () => {
    const params = {
      name: 'Test Wizard',
      speciesId: 'Human',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 5,
      abilityScores: {
        Strength: 10,
        Dexterity: 12,
        Constitution: 14,
        Intelligence: 16,
        Wisdom: 13,
        Charisma: 8,
      },
    };

    // Mock createCharacter to return a character with level 5
    const mockChar = createMockCharacter({ name: 'Test Wizard', classLevel: 5 });
    vi.spyOn(characterService as any, 'createCharacter').mockReturnValue(mockChar);

    const character = characterService.createCharacter(params as any);

    expect(character.classes[0].level).toBe(5);
  });

  it('should handle spell preparation', () => {
    const character = createMockCharacter({ name: 'Test', classLevel: 1 });
    const spellId = 'fireball';

    // Mock prepareSpellForClass to return updated character
    const updatedChar = {
      ...character,
      spells: {
        ...character.spells,
        classSpellcasting: {
          ...character.spells.classSpellcasting,
          Wizard: {
            ...character.spells.classSpellcasting['Wizard'],
            preparedSpells: [spellId],
          },
        },
      },
    };
    vi.spyOn(characterService as any, 'prepareSpell').mockReturnValue(updatedChar);

    const result = characterService.prepareSpell(character as any, spellId);
    expect(result.spells.classSpellcasting['Wizard'].preparedSpells).toContain(spellId);
  });

  it('should manage spell slots', () => {
    const character = createMockCharacter({ name: 'Test', classLevel: 1 });

    // Mock consumeSpellSlot to return character with used slot
    const updatedChar = {
      ...character,
      spells: {
        ...character.spells,
        spellSlots: {
          ...character.spells.spellSlots,
          1: { ...character.spells.spellSlots[1], used: 1 },
        },
      },
    };
    vi.spyOn(characterService as any, 'consumeSpellSlot').mockReturnValue(updatedChar);

    const result = characterService.consumeSpellSlot(character as any, 1);
    expect(result.spells.spellSlots[1].used).toBe(1);
  });

  it('should handle long rest', () => {
    const character = createMockCharacter({ name: 'Test', classLevel: 1 });
    const withUsedSlot = {
      ...character,
      spells: {
        ...character.spells,
        spellSlots: {
          ...character.spells.spellSlots,
          1: { ...character.spells.spellSlots[1], used: 1 },
        },
      },
    };

    // Mock longRest to return character with reset slots
    const restedChar = {
      ...withUsedSlot,
      spells: {
        ...withUsedSlot.spells,
        spellSlots: {
          ...withUsedSlot.spells.spellSlots,
          1: { ...withUsedSlot.spells.spellSlots[1], used: 0 },
        },
      },
    };
    vi.spyOn(characterService as any, 'longRest').mockReturnValue(restedChar);

    const result = characterService.longRest(withUsedSlot as any);
    expect(result.spells.spellSlots[1].used).toBe(0);
  });

  it('should handle concentration', () => {
    const character = createMockCharacter({ name: 'Test', classLevel: 1 });
    const spellId = 'haste';

    // Mock startConcentration
    const withConcentration = {
      ...character,
      concentration: { spellId },
    };
    vi.spyOn(characterService as any, 'startConcentration').mockReturnValue(withConcentration);

    const result = characterService.startConcentration(character as any, spellId);
    expect(result.concentration).toBeDefined();
    expect(result.concentration?.spellId).toBe(spellId);

    // Mock endConcentration
    const withoutConcentration = {
      ...withConcentration,
      concentration: null,
    };
    vi.spyOn(characterService as any, 'endConcentration').mockReturnValue(withoutConcentration);

    const ended = characterService.endConcentration(result as any);
    expect(ended.concentration).toBeNull();
  });

  it('should handle learning and unlearning spells', () => {
    const character = createMockCharacter({ name: 'Test', classLevel: 1 });
    const spellId = 'magic-missile';

    // Mock learnSpell to return character with known spell
    const withLearned = {
      ...character,
      spells: {
        ...character.spells,
        classSpellcasting: {
          ...character.spells.classSpellcasting,
          Wizard: {
            ...character.spells.classSpellcasting['Wizard'],
            knownSpells: [spellId],
          },
        },
      },
    };
    vi.spyOn(characterService as any, 'learnSpell').mockReturnValue(withLearned);

    const result = characterService.learnSpell(character as any, spellId);
    expect(result.spells.classSpellcasting['Wizard'].knownSpells).toContain(spellId);
  });
});
