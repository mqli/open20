import { describe, it, expect } from 'vitest';
import { createTestDepsForCreate, createTestDeps } from '../create-test-loader';
import { createCharacter, levelUp, validateCharacter } from 'open20-core/character';

describe('D&D Player Behavior - Multiclass Characters', () => {
  describe('Session 7: Multiclass Characters', () => {
    it('should create a Fighter 1 / Wizard 1 multiclass character', () => {
      const deps = createTestDepsForCreate(
        {
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
        },
        {
          additionalClassIds: ['Wizard'],
        },
      );
      const char = createCharacter(
        {
          name: 'Gand',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 15,
            Wisdom: 12,
            Charisma: 8,
          },
          additionalClasses: [{ classId: 'Wizard', level: 1 }],
        },
        deps,
      );

      expect(char.classes).toHaveLength(2);
      expect(char.classes[0]!.classId).toBe('Fighter');
      expect(char.classes[0]!.level).toBe(1);
      expect(char.classes[1]!.classId).toBe('Wizard');
      expect(char.classes[1]!.level).toBe(1);
      expect(char.combatStats.proficiencyBonus).toBe(2);
    });

    it('should create a Wizard 3 / Fighter 2 with correct spell slots', () => {
      const deps = createTestDepsForCreate(
        {
          speciesId: 'Elf',
          backgroundId: 'sage',
          classId: 'Wizard',
        },
        {
          additionalClassIds: ['Fighter'],
        },
      );
      const char = createCharacter(
        {
          name: 'Mika',
          speciesId: 'Elf',
          backgroundId: 'sage',
          classId: 'Wizard',
          classLevel: 3,
          abilityScores: {
            Strength: 8,
            Dexterity: 14,
            Constitution: 13,
            Intelligence: 15,
            Wisdom: 12,
            Charisma: 10,
          },
          additionalClasses: [{ classId: 'Fighter', level: 2 }],
        },
        deps,
      );

      expect(char.classes).toHaveLength(2);
      expect(char.classes[0]!.classId).toBe('Wizard');
      expect(char.classes[0]!.level).toBe(3);
      expect(char.classes[1]!.classId).toBe('Fighter');
      expect(char.classes[1]!.level).toBe(2);
      expect(char.combatStats.proficiencyBonus).toBe(3);
      expect(char.spells.spellSlots[2]!.total).toBeGreaterThan(0);
    });

    it('should validate a multiclass character', () => {
      const deps = createTestDepsForCreate(
        {
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
        },
        {
          additionalClassIds: ['Wizard'],
        },
      );
      const char = createCharacter(
        {
          name: 'Gand',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 15,
            Wisdom: 12,
            Charisma: 8,
          },
          additionalClasses: [{ classId: 'Wizard', level: 1 }],
        },
        deps,
      );

      const depsForValidate = createTestDeps(char);
      const result = validateCharacter(char, depsForValidate);
      expect(result.valid).toBe(true);
    });

    it('should level up multiclass character correctly', () => {
      const deps = createTestDepsForCreate(
        {
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Wizard',
        },
        {
          additionalClassIds: ['Fighter'],
        },
      );
      let char = createCharacter(
        {
          name: 'Kira',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Wizard',
          abilityScores: {
            Strength: 14,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 15,
            Wisdom: 12,
            Charisma: 8,
          },
          additionalClasses: [{ classId: 'Fighter', level: 1 }],
        },
        deps,
      );

      expect(char.classes).toHaveLength(2);
      expect(char.classes[0]!.level).toBe(1);
      expect(char.classes[1]!.level).toBe(1);

      const depsForLevelUp = createTestDeps(char);
      char = levelUp(char, { classId: 'Fighter', hpChoice: 'fixed' }, depsForLevelUp);

      expect(char.classes[1]!.classId).toBe('Fighter');
      expect(char.classes[1]!.level).toBe(2);
      expect(char.classes[0]!.level).toBe(1);
      expect(char.combatStats.proficiencyBonus).toBe(2);
    });
  });

  describe('Session 8: Half-Caster Multiclass', () => {
    it('should calculate correct spell slots for Paladin 5 / Wizard 5', () => {
      const deps = createTestDepsForCreate(
        {
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Paladin',
        },
        {
          additionalClassIds: ['Wizard'],
        },
      );
      const char = createCharacter(
        {
          name: 'Theron',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Paladin',
          classLevel: 5,
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 10,
            Wisdom: 12,
            Charisma: 15,
          },
          additionalClasses: [{ classId: 'Wizard', level: 5 }],
        },
        deps,
      );

      expect(char.spells.spellSlots[1]!.total).toBe(4);
      expect(char.spells.spellSlots[2]!.total).toBe(3);
      expect(char.spells.spellSlots[3]!.total).toBe(3);
      expect(char.spells.spellSlots[4]!.total).toBe(1);
    });
  });
});
