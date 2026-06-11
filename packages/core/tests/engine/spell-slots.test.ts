// tests/engine/spell-slots.test.ts
// 法术位计算单元测试

import { describe, it, expect } from 'vitest';
import {
  calculateSpellSlots,
  calculatePactMagic,
  getMulticlassSpellcasterLevel,
  calculateMulticlassSpellSlots,
  type SpellSlotEntry,
} from '../../src/engine/spell-slots';
import { FULL_CASTER_SLOTS, PACT_MAGIC_SLOTS } from '../fixtures/spell-slots';
import type { Class } from '../../src/types/class';
import type { CharacterClass } from '../../src/types/character';

// ── Helper: Convert FULL_CASTER_SLOTS to spellSlotsByLevel format ──
function convertToSpellSlotsByLevel(
  slots: Record<number, Record<number, number>>,
): Record<number, ReadonlyArray<number>> {
  const result: Record<number, ReadonlyArray<number>> = {};
  for (const [levelStr, slotsByLevel] of Object.entries(slots)) {
    const level = parseInt(levelStr);
    // Convert { 1: 2, 2: 0, ... } to [2, 0, ...]
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => slotsByLevel[l] ?? 0);
    result[level] = array;
  }
  return result;
}

const SPELL_SLOTS_BY_LEVEL = convertToSpellSlotsByLevel(FULL_CASTER_SLOTS);

// ── Mock Class Data ──────────────────────────────────────

const SPELLCASTING_CLASSES: Record<string, Class> = {
  Wizard: {
    id: 'Wizard',
    name: 'Wizard',
    source: '2024 PHB',
    hitDie: 'd6',
    savingThrowProficiencies: ['Intelligence', 'Wisdom'],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Intelligence',
      knownSource: 'spellbook',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
    spellSlotsByLevel: SPELL_SLOTS_BY_LEVEL,
  },
  Cleric: {
    id: 'Cleric',
    name: 'Cleric',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Wisdom', 'Charisma'],
    armorTraining: ['Light', 'Medium', 'Shield'],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Wisdom',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
    spellSlotsByLevel: SPELL_SLOTS_BY_LEVEL,
  },
  Bard: {
    id: 'Bard',
    name: 'Bard',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Dexterity', 'Charisma'],
    armorTraining: ['Light'],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: { ability: 'Charisma', preparationTiming: 'level_up', changesPerPreparation: 1 },
  },
  Sorcerer: {
    id: 'Sorcerer',
    name: 'Sorcerer',
    source: '2024 PHB',
    hitDie: 'd6',
    savingThrowProficiencies: ['Constitution', 'Charisma'],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: { ability: 'Charisma', preparationTiming: 'level_up', changesPerPreparation: 1 },
  },
  Druid: {
    id: 'Druid',
    name: 'Druid',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Intelligence', 'Wisdom'],
    armorTraining: ['Light', 'Medium', 'Shield'],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Wisdom',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
  },
  Paladin: {
    id: 'Paladin',
    name: 'Paladin',
    source: '2024 PHB',
    hitDie: 'd10',
    savingThrowProficiencies: ['Wisdom', 'Charisma'],
    armorTraining: ['Light', 'Medium', 'Heavy', 'Shield'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Charisma',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 1,
    },
  },
  Ranger: {
    id: 'Ranger',
    name: 'Ranger',
    source: '2024 PHB',
    hitDie: 'd10',
    savingThrowProficiencies: ['Strength', 'Dexterity'],
    armorTraining: ['Light', 'Medium', 'Shield'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Wisdom',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 1,
    },
  },
  Warlock: {
    id: 'Warlock',
    name: 'Warlock',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Wisdom', 'Charisma'],
    armorTraining: ['Light'],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Charisma',
      preparationTiming: 'level_up',
      changesPerPreparation: 1,
      pactMagic: true,
      pactMagicSlots: PACT_MAGIC_SLOTS,
    },
  },
  Fighter: {
    id: 'Fighter',
    name: 'Fighter',
    source: '2024 PHB',
    hitDie: 'd10',
    savingThrowProficiencies: ['Strength', 'Constitution'],
    armorTraining: ['Light', 'Medium', 'Heavy', 'Shield'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: null,
  },
  Rogue: {
    id: 'Rogue',
    name: 'Rogue',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Dexterity', 'Intelligence'],
    armorTraining: ['Light'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: null,
  },
  Barbarian: {
    id: 'Barbarian',
    name: 'Barbarian',
    source: '2024 PHB',
    hitDie: 'd12',
    savingThrowProficiencies: ['Strength', 'Constitution'],
    armorTraining: ['Light', 'Medium', 'Shield'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: null,
  },
  Monk: {
    id: 'Monk',
    name: 'Monk',
    source: '2024 PHB',
    hitDie: 'd8',
    savingThrowProficiencies: ['Strength', 'Dexterity'],
    armorTraining: ['Light'],
    weaponMastery: true,
    featuresByLevel: [],
    spellcasting: null,
  },
};

// ── Helper Functions ──────────────────────────────────────

/** Create CharacterClass object */
function makeClass(classId: string, level: number): CharacterClass {
  return { classId, level } as CharacterClass;
}

/** Get spell slot total (for assertions) */
function getSlotTotal(result: Record<number, SpellSlotEntry>, level: number): number {
  return result[level]?.total ?? 0;
}

// ── Test Cases ─────────────────────────────────────────────

describe('calculateSpellSlots', () => {
  it('should return 2 level-1 slots for Wizard level 1', () => {
    const result = calculateSpellSlots('Wizard', 1, SPELLCASTING_CLASSES);
    expect(getSlotTotal(result, 1)).toBe(2);
    expect(getSlotTotal(result, 2)).toBe(0);
    expect(getSlotTotal(result, 9)).toBe(0);
  });

  it('should return 4/2 slots for Wizard level 3', () => {
    const result = calculateSpellSlots('Wizard', 3, SPELLCASTING_CLASSES);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(2);
    expect(getSlotTotal(result, 3)).toBe(0);
  });

  it('should return 4/3/2 slots for Wizard level 5', () => {
    const result = calculateSpellSlots('Wizard', 5, SPELLCASTING_CLASSES);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(3);
    expect(getSlotTotal(result, 3)).toBe(2);
    expect(getSlotTotal(result, 4)).toBe(0);
  });

  it('should return all zeros for non-spellcaster (Fighter)', () => {
    const result = calculateSpellSlots('Fighter', 5, SPELLCASTING_CLASSES);
    for (let level = 1; level <= 9; level++) {
      expect(getSlotTotal(result, level)).toBe(0);
    }
  });

  it('should return 2 level-1 slots for Cleric level 1 (full caster)', () => {
    const result = calculateSpellSlots('Cleric', 1, SPELLCASTING_CLASSES);
    expect(getSlotTotal(result, 1)).toBe(2);
    expect(getSlotTotal(result, 2)).toBe(0);
  });

  it('should return 4/3/3/3/1 slots for Wizard level 9', () => {
    const result = calculateSpellSlots('Wizard', 9, SPELLCASTING_CLASSES);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(3);
    expect(getSlotTotal(result, 3)).toBe(3);
    expect(getSlotTotal(result, 4)).toBe(3);
    expect(getSlotTotal(result, 5)).toBe(1);
    expect(getSlotTotal(result, 6)).toBe(0);
  });

  it('should always set used to 0 after calculation', () => {
    const result = calculateSpellSlots('Wizard', 5, SPELLCASTING_CLASSES);
    for (let level = 1; level <= 9; level++) {
      expect(result[level]!.used).toBe(0);
    }
  });

  it('should return all 9 levels in result', () => {
    const result = calculateSpellSlots('Wizard', 1, SPELLCASTING_CLASSES);
    for (let level = 1; level <= 9; level++) {
      expect(result[level]!).toBeDefined();
      expect(result[level]!).toHaveProperty('total');
      expect(result[level]!).toHaveProperty('used');
    }
  });
});

describe('calculatePactMagic', () => {
  const warlockClass = SPELLCASTING_CLASSES['Warlock'] as Class;

  it('should return { slotLevel: 1, slots: 1 } for Warlock level 1', () => {
    const result = calculatePactMagic(1, warlockClass);
    expect(result).not.toBeNull();
    expect(result!.slotLevel).toBe(1);
    expect(result!.slots).toBe(1);
  });

  it('should return { slotLevel: 2, slots: 2 } for Warlock level 3', () => {
    const result = calculatePactMagic(3, warlockClass);
    expect(result).not.toBeNull();
    expect(result!.slotLevel).toBe(2);
    expect(result!.slots).toBe(2);
  });

  it('should return { slotLevel: 3, slots: 2 } for Warlock level 5', () => {
    const result = calculatePactMagic(5, warlockClass);
    expect(result).not.toBeNull();
    expect(result!.slotLevel).toBe(3);
    expect(result!.slots).toBe(2);
  });

  it('should return { slotLevel: 5, slots: 3 } for Warlock level 11', () => {
    const result = calculatePactMagic(11, warlockClass);
    expect(result).not.toBeNull();
    expect(result!.slotLevel).toBe(5);
    expect(result!.slots).toBe(3);
  });

  it('should return null for warlockLevel < 1', () => {
    const result = calculatePactMagic(0, warlockClass);
    expect(result).toBeNull();
  });

  it('should return null for unknown warlock level (if pactMagicSlots returns falsy)', () => {
    // Create a Warlock class without pactMagicSlots for the level
    const warlockWithoutSlots = {
      ...warlockClass,
      spellcasting: {
        ...warlockClass.spellcasting!,
        pactMagicSlots: {}, // Empty slots
      },
    };
    const result = calculatePactMagic(1, warlockWithoutSlots);
    expect(result).toBeNull();
  });
});

describe('getMulticlassSpellcasterLevel', () => {
  it('should return 5 for single full caster (Wizard 5)', () => {
    const classes = [makeClass('Wizard', 5)];
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(5);
  });

  it('should return 0 for single non-caster (Fighter 5)', () => {
    const classes = [makeClass('Fighter', 5)];
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(0);
  });

  it('should return 3 for Fighter 5 + Wizard 3 (only Wizard counts)', () => {
    const classes = [makeClass('Fighter', 5), makeClass('Wizard', 3)];
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(3);
  });

  it('should return 5 for Paladin 4 + Wizard 3 (Paladin is half-caster)', () => {
    const classes = [makeClass('Paladin', 4), makeClass('Wizard', 3)];
    // Paladin: floor(4/2) = 2, Wizard: 3, total = 5
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(5);
  });

  it('should return 0 for Warlock 3 (Warlock does not count toward multiclass slots)', () => {
    const classes = [makeClass('Warlock', 3)];
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(0);
  });

  it('should return 8 for Bard 6 + Paladin 4', () => {
    const classes = [makeClass('Bard', 6), makeClass('Paladin', 4)];
    // Bard: 6, Paladin: floor(4/2) = 2, total = 8
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(8);
  });

  it('should handle Ranger as half-caster', () => {
    const classes = [makeClass('Ranger', 6)];
    // Ranger: floor(6/2) = 3
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(3);
  });

  it('should handle empty classes array', () => {
    const result = getMulticlassSpellcasterLevel([], SPELLCASTING_CLASSES);
    expect(result).toBe(0);
  });

  it('should handle multiple half-casters', () => {
    const classes = [makeClass('Paladin', 4), makeClass('Ranger', 6)];
    // Paladin: floor(4/2) = 2, Ranger: floor(6/2) = 3, total = 5
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(5);
  });

  it('should exclude Warlock from multiclass calculation even with other casters', () => {
    const classes = [makeClass('Wizard', 3), makeClass('Warlock', 5)];
    // Wizard: 3, Warlock: 0 (excluded), total = 3
    const result = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(result).toBe(3);
  });
});

describe('calculateMulticlassSpellSlots', () => {
  it('should return {1:4, 2:2, ...} for total level 3', () => {
    const result = calculateMulticlassSpellSlots(3);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(2);
    expect(getSlotTotal(result, 3)).toBe(0);
  });

  it('should return {1:4, 2:3, 3:2, ...} for total level 5', () => {
    const result = calculateMulticlassSpellSlots(5);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(3);
    expect(getSlotTotal(result, 3)).toBe(2);
    expect(getSlotTotal(result, 4)).toBe(0);
  });

  it('should return all zeros for total level 0', () => {
    const result = calculateMulticlassSpellSlots(0);
    for (let level = 1; level <= 9; level++) {
      expect(getSlotTotal(result, level)).toBe(0);
    }
  });

  it('should return all zeros for negative total level', () => {
    const result = calculateMulticlassSpellSlots(-1);
    for (let level = 1; level <= 9; level++) {
      expect(getSlotTotal(result, level)).toBe(0);
    }
  });

  it('should always set used to 0 after calculation', () => {
    const result = calculateMulticlassSpellSlots(5);
    for (let level = 1; level <= 9; level++) {
      expect(result[level]!.used).toBe(0);
    }
  });

  it('should return correct slots for high level (level 9)', () => {
    const result = calculateMulticlassSpellSlots(9);
    expect(getSlotTotal(result, 1)).toBe(4);
    expect(getSlotTotal(result, 2)).toBe(3);
    expect(getSlotTotal(result, 3)).toBe(3);
    expect(getSlotTotal(result, 4)).toBe(3);
    expect(getSlotTotal(result, 5)).toBe(1);
  });

  it('should return all 9 levels in result', () => {
    const result = calculateMulticlassSpellSlots(3);
    for (let level = 1; level <= 9; level++) {
      expect(result[level]!).toBeDefined();
      expect(result[level]!).toHaveProperty('total');
      expect(result[level]!).toHaveProperty('used');
    }
  });
});

describe('integration: multiclass spell slots flow', () => {
  it('should calculate correct multiclass slots for Fighter 5 + Wizard 3', () => {
    const classes = [makeClass('Fighter', 5), makeClass('Wizard', 3)];
    const totalLevel = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(totalLevel).toBe(3);

    const slots = calculateMulticlassSpellSlots(totalLevel);
    expect(getSlotTotal(slots, 1)).toBe(4);
    expect(getSlotTotal(slots, 2)).toBe(2);
  });

  it('should calculate correct multiclass slots for Paladin 4 + Wizard 3', () => {
    const classes = [makeClass('Paladin', 4), makeClass('Wizard', 3)];
    const totalLevel = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(totalLevel).toBe(5);

    const slots = calculateMulticlassSpellSlots(totalLevel);
    expect(getSlotTotal(slots, 1)).toBe(4);
    expect(getSlotTotal(slots, 2)).toBe(3);
    expect(getSlotTotal(slots, 3)).toBe(2);
  });

  it('should return no slots for Warlock 5 (Pact Magic does not use multiclass slots)', () => {
    const classes = [makeClass('Warlock', 5)];
    const totalLevel = getMulticlassSpellcasterLevel(classes, SPELLCASTING_CLASSES);
    expect(totalLevel).toBe(0);

    const slots = calculateMulticlassSpellSlots(totalLevel);
    for (let level = 1; level <= 9; level++) {
      expect(getSlotTotal(slots, level)).toBe(0);
    }
  });
});
