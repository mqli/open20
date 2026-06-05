import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCharacterStore } from '@/stores/character-store';
import { storageService } from '@/core/storage-service';
import type { AppCharacter } from '@/core/types';
import type { AbilityName } from 'open20-core';

// Mock the storage-service module
vi.mock('@/core/storage-service', () => ({
  StorageService: vi.fn(),
  storageService: {
    loadCharacters: vi.fn(() => []),
    saveCharacter: vi.fn(),
    deleteCharacter: vi.fn(),
    savePreferences: vi.fn(),
    loadPreferences: vi.fn(() => ({})),
    clearAll: vi.fn(),
  },
}));

describe('CharacterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCharacterStore.setState({
      activeCharacter: null,
      characters: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should set active character', () => {
    const mockChar = { id: '1', name: 'Test' } as unknown as AppCharacter;
    useCharacterStore.getState().setActiveCharacter(mockChar);
    expect(useCharacterStore.getState().activeCharacter).toEqual(mockChar);
  });

  it('should delete a character from storage', () => {
    const mockChar = { id: '1', name: 'Test' } as unknown as AppCharacter;
    useCharacterStore.setState({
      activeCharacter: mockChar,
      characters: [mockChar],
    });

    useCharacterStore.getState().deleteCharacter('1');

    expect(useCharacterStore.getState().characters).toEqual([]);
    expect(useCharacterStore.getState().activeCharacter).toBeNull();
    expect(storageService.deleteCharacter).toHaveBeenCalledWith('1');
  });

  it('should learn a spell and save to storage', () => {
    const mockChar = {
      id: '1',
      name: 'Test',
      classes: [
        {
          classId: 'Wizard',
          level: 1,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 6, used: 0 },
        },
      ],
      abilityScores: {
        base: {
          Intelligence: 16,
          Constitution: 10,
          Wisdom: 10,
          Charisma: 10,
          Strength: 10,
          Dexterity: 10,
        },
        racialBonuses: {},
        featBonuses: {},
        temporaryBonuses: {},
      },
      spells: {
        classSpellcasting: {
          Wizard: {
            classId: 'Wizard',
            spellcastingAbility: 'Intelligence' as AbilityName,
            spellSaveDC: 14,
            spellAttackBonus: 6,
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
      resources: [],
      hitPoints: {
        max: 8,
        current: 8,
        temporary: 0,
        deathSaves: { successes: 0, failures: 0, isStable: false },
      },
      combatStats: {
        AC: 10,
        initiative: 0,
        speed: 30,
        passivePerception: 10,
        proficiencyBonus: 2,
        attacks: [],
      },
      equipment: [],
      skills: {},
      feats: [],
      conditions: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      damageDefenses: { immune: [], resistant: [], vulnerable: [] },
      notes: '',
      createdAt: '',
      updatedAt: '',
      species: 'Human',
      speciesSubtype: null,
      background: 'Acolyte',
    } as unknown as AppCharacter;

    useCharacterStore.getState().setActiveCharacter(mockChar);
    useCharacterStore.getState().learnSpell('magic-missile');

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.classSpellcasting['Wizard'].knownSpells).toContain('magic-missile');
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  it('should prepare a spell', () => {
    const mockChar = {
      id: '1',
      name: 'Test',
      classes: [
        {
          classId: 'Wizard',
          level: 1,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 6, used: 0 },
        },
      ],
      abilityScores: {
        base: {
          Intelligence: 16,
          Constitution: 10,
          Wisdom: 10,
          Charisma: 10,
          Strength: 10,
          Dexterity: 10,
        },
        racialBonuses: {},
        featBonuses: {},
        temporaryBonuses: {},
      },
      spells: {
        classSpellcasting: {
          Wizard: {
            classId: 'Wizard',
            spellcastingAbility: 'Intelligence' as AbilityName,
            spellSaveDC: 14,
            spellAttackBonus: 6,
            knownSpells: ['magic-missile'],
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
      resources: [],
      hitPoints: {
        max: 8,
        current: 8,
        temporary: 0,
        deathSaves: { successes: 0, failures: 0, isStable: false },
      },
      combatStats: {
        AC: 10,
        initiative: 0,
        speed: 30,
        passivePerception: 10,
        proficiencyBonus: 2,
        attacks: [],
      },
      equipment: [],
      skills: {},
      feats: [],
      conditions: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      damageDefenses: { immune: [], resistant: [], vulnerable: [] },
      notes: '',
      createdAt: '',
      updatedAt: '',
      species: 'Human',
      speciesSubtype: null,
      background: 'Acolyte',
    } as unknown as AppCharacter;

    useCharacterStore.getState().setActiveCharacter(mockChar);
    useCharacterStore.getState().prepareSpell('magic-missile');

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.classSpellcasting['Wizard'].preparedSpells).toContain(
      'magic-missile',
    );
  });

  // ── FR-010: Spell Slot Consumption and Recovery Tests ──

  const createMockCharWithSlots = (): AppCharacter =>
    ({
      id: '1',
      name: 'Test Wizard',
      classes: [
        {
          classId: 'Wizard',
          level: 3,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 6, used: 0 },
        },
      ],
      abilityScores: {
        base: {
          Intelligence: 16,
          Constitution: 10,
          Wisdom: 10,
          Charisma: 10,
          Strength: 10,
          Dexterity: 10,
        },
        racialBonuses: {},
        featBonuses: {},
        temporaryBonuses: {},
      },
      spells: {
        classSpellcasting: {
          Wizard: {
            classId: 'Wizard',
            spellcastingAbility: 'Intelligence' as AbilityName,
            spellSaveDC: 14,
            spellAttackBonus: 6,
            knownSpells: [],
            preparedSpells: [],
            maxPrepared: 4,
          },
        },
        spellSlots: {
          0: { total: 0, used: 0 },
          1: { total: 3, used: 1 },
          2: { total: 1, used: 0 },
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
      resources: [],
      hitPoints: {
        max: 20,
        current: 20,
        temporary: 0,
        deathSaves: { successes: 0, failures: 0, isStable: false },
      },
      combatStats: {
        AC: 12,
        initiative: 0,
        speed: 30,
        passivePerception: 10,
        proficiencyBonus: 2,
        attacks: [],
      },
      equipment: [],
      skills: {},
      feats: [],
      conditions: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      damageDefenses: { immune: [], resistant: [], vulnerable: [] },
      notes: '',
      createdAt: '',
      updatedAt: '',
      species: 'Human',
      speciesSubtype: null,
      background: 'Acolyte',
    }) as unknown as AppCharacter;

  it('should consume a spell slot (FR-010)', () => {
    const mockChar = createMockCharWithSlots();
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().consumeSpellSlot(1);

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.spellSlots[1].used).toBe(2);
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  it('should not consume slot if all are already used (FR-010)', () => {
    const mockChar = createMockCharWithSlots();
    // Use all level 1 slots
    (mockChar as any).spells.spellSlots[1].used = 3;
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().consumeSpellSlot(1);

    const updatedChar = useCharacterStore.getState().activeCharacter;
    // Should remain at 3 (not go to 4)
    expect(updatedChar?.spells.spellSlots[1].used).toBe(3);
  });

  it('should recover a spell slot (FR-010)', () => {
    const mockChar = createMockCharWithSlots();
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().recoverSpellSlot(1);

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.spellSlots[1].used).toBe(0);
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  it('should not recover slot if none are used (FR-010)', () => {
    const mockChar = createMockCharWithSlots();
    // Already at 0 used
    (mockChar as any).spells.spellSlots[1].used = 0;
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().recoverSpellSlot(1);

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.spellSlots[1].used).toBe(0);
  });

  it('should recover all spell slots on long rest (FR-010)', () => {
    const mockChar = createMockCharWithSlots();
    // Use some slots
    (mockChar as any).spells.spellSlots[1].used = 2;
    (mockChar as any).spells.spellSlots[2].used = 1;
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().longRest();

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.spells.spellSlots[1].used).toBe(0);
    expect(updatedChar?.spells.spellSlots[2].used).toBe(0);
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  // ── FR-011: Concentration Status Tests ──

  it('should start concentrating on a spell (FR-011)', () => {
    const mockChar = createMockCharWithSlots();
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().startConcentration('fireball');

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.concentration).toEqual(expect.objectContaining({ spellId: 'fireball' }));
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  it('should end concentration (FR-011)', () => {
    const mockChar = createMockCharWithSlots();
    (mockChar as any).concentration = { spellId: 'fireball', startedAt: new Date().toISOString() };
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().endConcentration();

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.concentration).toBeNull();
    expect(storageService.saveCharacter).toHaveBeenCalled();
  });

  it('should replace existing concentration when starting new one (FR-011)', () => {
    const mockChar = createMockCharWithSlots();
    (mockChar as any).concentration = { spellId: 'haste', startedAt: new Date().toISOString() };
    useCharacterStore.getState().setActiveCharacter(mockChar);

    useCharacterStore.getState().startConcentration('fireball');

    const updatedChar = useCharacterStore.getState().activeCharacter;
    expect(updatedChar?.concentration).toEqual(expect.objectContaining({ spellId: 'fireball' }));
  });
});
