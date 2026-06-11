// tests/engine/spell-casting.test.ts
// Tests for spell casting mechanics — ritual casting, upcasting, cantrips

import { describe, it, expect } from 'vitest';
import {
  canCastAsRitual,
  castAsRitual,
  getRitualCastingTime,
  isCantrip,
  canUpcast,
  getUpcastDescription,
  getAvailableCastLevels,
  castSpell,
} from '../../src/character/spell-casting';
import type { Spell, Character } from '../../src/types';
import { createMockDeps } from '../fixtures/data-loader';

// Mock spells
const mockSpell: Spell = {
  id: 'detect-magic',
  name: 'Detect Magic',
  level: 1,
  school: 'Divination',
  castingTime: 'Action',
  range: 'Self',
  components: ['V', 'S'] as const,
  duration: 'Concentration, up to 10 minutes',
  concentration: true,
  ritual: true,
  description: ['For the duration, you sense the presence of magic...'],
  classes: ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'],
  source: 'SRD 5.2',
};

const mockCantrip: Spell = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  level: 0,
  school: 'Evocation',
  castingTime: 'Action',
  range: '120 feet',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['You hurl a mote of fire...'],
  classes: ['wizard', 'sorcerer'],
  source: 'SRD 5.2',
};

const mockUpcastSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: 'Action',
  range: '150 feet',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['A bright streak flashes from your pointing finger...'],
  usingAHigherLevelSpellSlot: [
    'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
  ],
  classes: ['wizard', 'sorcerer'],
  source: 'SRD 5.2',
};

// Mock deps with spells
const deps = createMockDeps({
  spells: {
    'detect-magic': mockSpell,
    'fire-bolt': mockCantrip,
    fireball: mockUpcastSpell,
  },
});

const mockWizardChar = {
  schemaVersion: '1.0.0',
  name: 'Test Wizard',
  species: 'human',
  speciesSubtype: null,
  background: 'sage',
  classes: [
    {
      classId: 'Wizard',
      level: 3,
      subclassId: null,
      subclassLevel: null,
      hitDice: { die: 6 as const, used: 0 },
    },
  ],
  abilityScores: {
    base: {
      Strength: 10,
      Dexterity: 14,
      Constitution: 13,
      Intelligence: 15,
      Wisdom: 12,
      Charisma: 10,
    },
    racialBonuses: {
      Strength: 0,
      Dexterity: 0,
      Constitution: 0,
      Intelligence: 0,
      Wisdom: 0,
      Charisma: 0,
    },
    featBonuses: {
      Strength: 0,
      Dexterity: 0,
      Constitution: 0,
      Intelligence: 0,
      Wisdom: 0,
      Charisma: 0,
    },
    temporaryBonuses: {
      Strength: 0,
      Dexterity: 0,
      Constitution: 0,
      Intelligence: 0,
      Wisdom: 0,
      Charisma: 0,
    },
  },
  skills: {
    athletics: { proficient: false, expertise: false },
    acrobatics: { proficient: false, expertise: false },
    sleightOfHand: { proficient: false, expertise: false },
    stealth: { proficient: false, expertise: false },
    arcana: { proficient: true, expertise: false },
    history: { proficient: false, expertise: false },
    investigation: { proficient: false, expertise: false },
    nature: { proficient: false, expertise: false },
    religion: { proficient: false, expertise: false },
    animalHandling: { proficient: false, expertise: false },
    insight: { proficient: false, expertise: false },
    medicine: { proficient: false, expertise: false },
    perception: { proficient: false, expertise: false },
    survival: { proficient: false, expertise: false },
    deception: { proficient: false, expertise: false },
    intimidation: { proficient: false, expertise: false },
    performance: { proficient: false, expertise: false },
    persuasion: { proficient: false, expertise: false },
  },
  feats: [],
  equipment: [],
  spells: {
    classSpellcasting: {
      Wizard: {
        classId: 'Wizard',
        spellcastingAbility: 'Intelligence',
        spellSaveDC: 13,
        spellAttackBonus: 5,
        knownSpells: ['detect-magic', 'fire-bolt', 'fireball'],
        preparedSpells: ['detect-magic', 'fireball'],
        alwaysPreparedSpells: [],
        maxPrepared: 5,
      },
    },
    spellSlots: {
      0: { total: 0, used: 0 },
      1: { total: 4, used: 0 },
      2: { total: 2, used: 0 },
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
    initiative: 2,
    speed: 30,
    passivePerception: 13,
    proficiencyBonus: 2,
    attacks: [],
  },
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  conditions: [],
  damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
  notes: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
} as unknown as Character;

describe('spell-casting', () => {
  describe('canCastAsRitual', () => {
    it('should return true for ritual spells on class list', () => {
      expect(canCastAsRitual(mockWizardChar, mockSpell)).toBe(true);
    });

    it('should return false for non-ritual spells', () => {
      expect(canCastAsRitual(mockWizardChar, mockCantrip)).toBe(false);
    });

    it('should return false if character cannot cast rituals', () => {
      const nonCasterChar = {
        ...mockWizardChar,
        classes: [
          {
            classId: 'fighter',
            level: 3,
            subclassId: null,
            subclassLevel: null,
            hitDice: { die: 'd10' as const, used: 0 },
          },
        ],
      };
      expect(canCastAsRitual(nonCasterChar, mockSpell)).toBe(false);
    });
  });

  describe('getRitualCastingTime', () => {
    it('should return 10 minutes for 1 action spells', () => {
      expect(getRitualCastingTime('1 action')).toBe('10 minutes');
    });

    it('should add 10 minutes for minute-based casting times', () => {
      expect(getRitualCastingTime('1 minute')).toBe('11 minutes');
    });
  });

  describe('castAsRitual', () => {
    it('should succeed for valid ritual casting', () => {
      const result = castAsRitual(mockWizardChar, mockSpell);
      expect(result.success).toBe(true);
      expect(result.char).toBe(mockWizardChar); // Character unchanged
    });

    it('should fail for non-ritual spells', () => {
      const result = castAsRitual(mockWizardChar, mockCantrip);
      expect(result.success).toBe(false);
    });
  });

  describe('isCantrip', () => {
    it('should return true for level 0 spells', () => {
      expect(isCantrip(mockCantrip)).toBe(true);
    });

    it('should return false for level 1+ spells', () => {
      expect(isCantrip(mockSpell)).toBe(false);
    });
  });

  describe('canUpcast', () => {
    it('should return true if spell has upcast text', () => {
      expect(canUpcast(mockUpcastSpell)).toBe(true);
    });

    it('should return false if spell has no upcast text', () => {
      expect(canUpcast(mockSpell)).toBe(false);
    });
  });

  describe('getUpcastDescription', () => {
    it('should return upcast description for higher slot level', () => {
      const desc = getUpcastDescription(mockUpcastSpell, 4);
      expect(desc).toContain('When you cast this spell using a spell slot of 4th level');
    });

    it('should return undefined for same level', () => {
      const desc = getUpcastDescription(mockUpcastSpell, 3);
      expect(desc).toBeUndefined();
    });
  });

  describe('getAvailableCastLevels', () => {
    it('should return only cantrip level for cantrips', () => {
      expect(getAvailableCastLevels(mockWizardChar as Character, mockCantrip)).toEqual([0]);
    });

    it('should return theoretical upcast levels without a character', () => {
      expect(getAvailableCastLevels(null, mockUpcastSpell)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return only base level for non-upcast spells without a character', () => {
      expect(getAvailableCastLevels(undefined, mockSpell)).toEqual([1]);
    });

    it('should return levels with available slots for a character', () => {
      expect(getAvailableCastLevels(mockWizardChar as Character, mockSpell)).toEqual([1]);
    });

    it('should include higher upcast levels when slots are available', () => {
      const charWithSlots = {
        ...mockWizardChar,
        spells: {
          ...mockWizardChar.spells,
          spellSlots: {
            ...mockWizardChar.spells.spellSlots,
            3: { total: 2, used: 0 },
            4: { total: 1, used: 0 },
          },
        },
      };
      expect(getAvailableCastLevels(charWithSlots as Character, mockUpcastSpell)).toEqual([3, 4]);
    });
  });

  describe('castSpell', () => {
    // Create a higher-level wizard for testing level 3+ spells
    const highLevelWizard = {
      ...mockWizardChar,
      classes: [{ classId: 'Wizard', level: 5 }],
      spells: {
        ...mockWizardChar.spells,
        spellSlots: {
          ...mockWizardChar.spells.spellSlots,
          3: { total: 2, used: 0 },
        },
      },
    } as any;

    it('should succeed for cantrips without using slots', () => {
      const result = castSpell(mockWizardChar, mockCantrip, 0);
      expect(result.success).toBe(true);
      expect(result.message).toContain('cantrip');
    });

    it('should fail if slot level is too low', () => {
      const result = castSpell(mockWizardChar, mockUpcastSpell, 2);
      expect(result.success).toBe(false);
      expect(result.message).toContain('requires level 3');
    });

    it('should succeed for valid spell cast', () => {
      const result = castSpell(highLevelWizard, mockUpcastSpell, 3);
      expect(result.success).toBe(true);
    });

    it('should include upcast description when upcasting', () => {
      // Give wizard a 4th level slot
      const charWithSlots = {
        ...mockWizardChar,
        spells: {
          ...mockWizardChar.spells,
          spellSlots: {
            ...mockWizardChar.spells.spellSlots,
            4: { total: 1, used: 0 },
          },
        },
      };
      const result = castSpell(charWithSlots, mockUpcastSpell, 4);
      expect(result.success).toBe(true);
      expect(result.message).toContain('damage increases');
    });
  });
});
