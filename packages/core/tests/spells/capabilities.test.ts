// tests/spells/capabilities.test.ts
// Tests for spell capability pure functions

import { describe, it, expect } from 'vitest';
import {
  getCasterType,
  getCasterTypeForClass,
  getMatchingClassIds,
  getSpellClassStates,
  getAvailableSlots,
  canCastSpellWithSlots,
  getSpellAttackBonusForClass,
  getBestSpellAttackBonus,
  pickBestClassId,
} from '../../src/spells/capabilities';
import type { Character } from '../../src/types/character';
import type { SpellLevel } from '../../src/types/spell';
import type { ClassSpellData, PactMagicSlots } from '../../src/types/spell';
import type { Class } from '../../src/types/class';

// ── Fixtures ─────────────────────────────────

import { createMockDeps } from '../fixtures/data-loader';
import { createMockSpell } from '../fixtures/spells';

// Minimal mock character with Wizard class
const MOCK_CHARACTER = {
  classes: [
    {
      classId: 'Wizard',
      level: 3,
      subclassId: null,
      subclassLevel: null,
      hitDice: { die: 'd6' as const, used: 0 },
    },
  ],
  spells: {
    classSpellcasting: {
      Wizard: {
        classId: 'Wizard',
        spellcastingAbility: 'Intelligence' as const,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        knownCantrips: ['fire-bolt'],
        knownSpells: ['fireball', 'shield'],
        preparedSpells: ['shield', 'fireball'],
        alwaysPreparedSpells: [],
        maxPrepared: 5,
      } as unknown as ClassSpellData,
    },
    spellSlots: {
      1: { total: 4, used: 1 },
      2: { total: 3, used: 0 },
      3: { total: 3, used: 0 },
    } as unknown as Record<number, { total: number; used: number }>,
    pactMagicSlots: null as unknown as PactMagicSlots | null,
  },
};

// Mock classes for getCasterType tests
const mockWizardClass: Class = {
  id: 'Wizard',
  name: 'Wizard',
  source: '2024 PHB',
  hitDie: 'd6' as any,
  savingThrowProficiencies: ['Intelligence', 'Wisdom'] as any,
  armorTraining: [],
  weaponProficiencies: [],
  weaponMastery: false,
  featuresByLevel: [],
  spellcasting: {
    ability: 'Intelligence' as any,
    knownSource: 'spellbook',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
};

const mockClericClass: Class = {
  id: 'Cleric',
  name: 'Cleric',
  source: '2024 PHB',
  hitDie: 'd8' as any,
  savingThrowProficiencies: ['Wisdom', 'Charisma'] as any,
  armorTraining: ['Light', 'Medium', 'Heavy', 'Shields'],
  weaponProficiencies: ['Simple'],
  weaponMastery: false,
  featuresByLevel: [],
  spellcasting: {
    ability: 'Wisdom' as any,
    knownSource: 'class_list',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
};

// deps with classes for getCasterType tests
const mockWizardDeps = createMockDeps({
  classes: { Wizard: mockWizardClass },
});

const mockClericDeps = createMockDeps({
  classes: { Cleric: mockClericClass },
});

// ── Tests ─────────────────────────────────────

describe('getCasterType', () => {
  it('should identify non-caster', () => {
    const char = { ...MOCK_CHARACTER, classes: [] } as unknown as Character;
    const deps = createMockDeps();
    const result = getCasterType(char, deps);
    expect(result.isSpellbookCaster).toBe(false);
    expect(result.canLearn).toBe(false);
    expect(result.canPrepare).toBe(false);
  });

  it('should identify spellbook caster (Wizard)', () => {
    const char = MOCK_CHARACTER as unknown as Character;
    const result = getCasterType(char, mockWizardDeps);
    expect(result.isSpellbookCaster).toBe(true);
    expect(result.canLearn).toBe(true);
    expect(result.canPrepare).toBe(true);
  });

  it('should identify preparer (Cleric)', () => {
    const char = {
      ...MOCK_CHARACTER,
      classes: [
        {
          classId: 'Cleric',
          level: 3,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 'd8' as const, used: 0 },
        },
      ],
    } as unknown as Character;
    const result = getCasterType(char, mockClericDeps);
    expect(result.isSpellbookCaster).toBe(false);
    expect(result.canLearn).toBe(false);
    expect(result.canPrepare).toBe(true);
  });
});

describe('getCasterTypeForClass', () => {
  it('should return false for unknown class', () => {
    const deps = createMockDeps();
    const result = getCasterTypeForClass('Unknown', deps);
    expect(result.isSpellbookCaster).toBe(false);
    expect(result.canLearn).toBe(false);
    expect(result.canPrepare).toBe(false);
  });

  it('should identify Wizard as spellbook caster', () => {
    const result = getCasterTypeForClass('Wizard', mockWizardDeps);
    expect(result.isSpellbookCaster).toBe(true);
    expect(result.canLearn).toBe(true);
    expect(result.canPrepare).toBe(true);
  });
});

describe('getMatchingClassIds', () => {
  it('should return matching class IDs', () => {
    const spell = createMockSpell({ classes: ['Wizard'] });
    const result = getMatchingClassIds(MOCK_CHARACTER as unknown as Character, spell);
    expect(result).toContain('Wizard');
  });

  it('should be case-insensitive', () => {
    const spell = createMockSpell({ classes: ['wizard'] });
    const result = getMatchingClassIds(MOCK_CHARACTER as unknown as Character, spell);
    expect(result).toContain('Wizard');
  });

  it('should return empty for non-matching', () => {
    const spell = createMockSpell({ classes: ['Fighter'] });
    const result = getMatchingClassIds(MOCK_CHARACTER as unknown as Character, spell);
    expect(result).toEqual([]);
  });
});

describe('getSpellClassStates', () => {
  it('should return empty for no class spellcasting data', () => {
    const char = { spells: { classSpellcasting: {} } } as unknown as Character;
    const result = getSpellClassStates(char, 'fireball');
    expect(result).toEqual([]);
  });

  it('should detect known and prepared spell', () => {
    const result = getSpellClassStates(MOCK_CHARACTER as unknown as Character, 'fireball');
    expect(result.length).toBe(1);
    expect(result[0]?.isKnown).toBe(true);
    expect(result[0]?.isPrepared).toBe(true);
    expect(result[0]?.isAlwaysPrepared).toBe(false);
  });

  it('should detect cantrip known', () => {
    const result = getSpellClassStates(MOCK_CHARACTER as unknown as Character, 'fire-bolt');
    expect(result.length).toBe(1);
    expect(result[0]?.isCantripKnown).toBe(true);
    expect(result[0]?.isKnown).toBe(true);
  });
});

describe('getAvailableSlots', () => {
  it('should always return hasRegularSlot=true for cantrips', () => {
    const result = getAvailableSlots(MOCK_CHARACTER as unknown as Character, 0 as SpellLevel);
    expect(result.hasRegularSlot).toBe(true);
    expect(result.hasPactSlot).toBe(false);
  });

  it('should detect available regular slot', () => {
    // MOCK_CHARACTER has level-1 slots: total=4, used=1 → available
    const result = getAvailableSlots(MOCK_CHARACTER as unknown as Character, 1 as SpellLevel);
    expect(result.hasRegularSlot).toBe(true);
  });

  it('should detect no available slot when all used', () => {
    const char = {
      ...MOCK_CHARACTER,
      spells: {
        ...MOCK_CHARACTER.spells,
        spellSlots: {
          ...MOCK_CHARACTER.spells.spellSlots,
          1: { total: 2, used: 2 },
        },
      },
    } as unknown as Character;
    const result = getAvailableSlots(char, 1 as SpellLevel);
    expect(result.hasRegularSlot).toBe(false);
  });

  it('should detect pact slot for Warlock', () => {
    const char = {
      ...MOCK_CHARACTER,
      classes: [
        ...MOCK_CHARACTER.classes,
        {
          classId: 'Warlock',
          level: 3,
          subclassId: null,
          subclassLevel: null,
          hitDice: { die: 'd6' as const, used: 0 },
        },
      ],
      spells: {
        ...MOCK_CHARACTER.spells,
        pactMagicSlots: { level: 2, total: 2, used: 0, resetOn: 'Short Rest' as const },
      },
    } as unknown as Character;
    const resultL1 = getAvailableSlots(char, 1 as SpellLevel);
    expect(resultL1.hasPactSlot).toBe(true);
    const resultL3 = getAvailableSlots(char, 3 as SpellLevel);
    expect(resultL3.hasPactSlot).toBe(false); // pact level is 2, spell is level 3
  });
});

describe('canCastSpellWithSlots', () => {
  it('should return false if spell not known/prepared', () => {
    const spell = createMockSpell({ id: 'unknown-spell', level: 1, classes: ['Wizard'] });
    const deps = createMockDeps();
    const result = canCastSpellWithSlots(MOCK_CHARACTER as unknown as Character, spell);
    expect(result).toBe(false);
  });

  it('should return true if prepared and has slots', () => {
    const spell = createMockSpell({ id: 'fireball', level: 1, classes: ['Wizard'] });
    // Add fireball to known/prepared
    const char = {
      ...MOCK_CHARACTER,
      spells: {
        ...MOCK_CHARACTER.spells,
        classSpellcasting: {
          Wizard: {
            ...MOCK_CHARACTER.spells.classSpellcasting.Wizard,
            knownSpells: ['fireball', 'shield'],
            preparedSpells: ['fireball'],
          },
        },
      },
    } as unknown as Character;
    const deps = createMockDeps();
    const result = canCastSpellWithSlots(char, spell);
    expect(result).toBe(true);
  });

  it('should return true for cantrips', () => {
    const spell = createMockSpell({ id: 'fire-bolt', level: 0, classes: ['Wizard'] });
    const char = {
      ...MOCK_CHARACTER,
      spells: {
        ...MOCK_CHARACTER.spells,
        classSpellcasting: {
          Wizard: {
            ...MOCK_CHARACTER.spells.classSpellcasting.Wizard,
            knownCantrips: ['fire-bolt'],
          },
        },
      },
    } as unknown as Character;
    const deps = createMockDeps();
    const result = canCastSpellWithSlots(char, spell);
    expect(result).toBe(true);
  });
});

describe('getSpellAttackBonusForClass', () => {
  it('should return spell attack bonus for class', () => {
    const result = getSpellAttackBonusForClass(MOCK_CHARACTER as unknown as Character, 'Wizard');
    expect(result).toBe(7);
  });

  it('should return 0 for unknown class', () => {
    const result = getSpellAttackBonusForClass(MOCK_CHARACTER as unknown as Character, 'Unknown');
    expect(result).toBe(0);
  });
});

describe('getBestSpellAttackBonus', () => {
  it('should return best bonus across classes', () => {
    const char = {
      ...MOCK_CHARACTER,
      spells: {
        ...MOCK_CHARACTER.spells,
        classSpellcasting: {
          Wizard: {
            ...MOCK_CHARACTER.spells.classSpellcasting.Wizard,
            spellAttackBonus: 5,
          },
          Cleric: {
            classId: 'Cleric',
            spellcastingAbility: 'Wisdom' as const,
            spellSaveDC: 13,
            spellAttackBonus: 7,
            knownCantrips: [],
            knownSpells: [],
            preparedSpells: [],
            alwaysPreparedSpells: [],
            maxPrepared: 0,
          },
        },
      },
    } as unknown as Character;
    const result = getBestSpellAttackBonus(char);
    expect(result).toBe(7); // Cleric has higher bonus
  });

  it('should return 0 for no classes', () => {
    const char = { spells: { classSpellcasting: {} } } as unknown as Character;
    const result = getBestSpellAttackBonus(char);
    expect(result).toBe(0);
  });
});

describe('pickBestClassId', () => {
  it('should return null for empty candidates and no classes', () => {
    const char = { spells: { classSpellcasting: {} } } as unknown as Character;
    const result = pickBestClassId(char, []);
    expect(result).toBeNull();
  });

  it('should return first class for empty candidates with classes', () => {
    const result = pickBestClassId(MOCK_CHARACTER as unknown as Character, []);
    expect(result).toBe('Wizard');
  });

  it('should return the only candidate', () => {
    const result = pickBestClassId(MOCK_CHARACTER as unknown as Character, ['Wizard']);
    expect(result).toBe('Wizard');
  });

  it('should pick class with highest spellAttackBonus', () => {
    const char = {
      ...MOCK_CHARACTER,
      spells: {
        ...MOCK_CHARACTER.spells,
        classSpellcasting: {
          Wizard: {
            ...MOCK_CHARACTER.spells.classSpellcasting.Wizard,
            spellAttackBonus: 5,
          },
          Cleric: {
            classId: 'Cleric',
            spellcastingAbility: 'Wisdom' as const,
            spellSaveDC: 13,
            spellAttackBonus: 7,
            knownCantrips: [],
            knownSpells: [],
            preparedSpells: [],
            alwaysPreparedSpells: [],
            maxPrepared: 0,
          },
        },
      },
    } as unknown as Character;
    const result = pickBestClassId(char, ['Wizard', 'Cleric']);
    expect(result).toBe('Cleric'); // Higher spellAttackBonus
  });
});
