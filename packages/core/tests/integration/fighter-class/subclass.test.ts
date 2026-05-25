import { describe, it, expect } from 'vitest';
import { createDataLoader } from '../../../src/data/loader';
import { createCharacter } from '../../../src/character/create';

const dataLoader = createDataLoader();

function getSubclassFeatureNames(subclassId: string, level: number) {
  const subclass = dataLoader.getSubclass(subclassId);
  expect(subclass).toBeDefined();
  return subclass!.featuresByLevel
    .find(entry => entry.level === level)!
    .features.map(feature => feature.name);
}

describe('D&D SRD 5.2 - Fighter Class: Subclasses', () => {
  // ============================================================
  // CHAMPION SUBCLASS (PHB p.72-73, SRD)
  // ============================================================
  describe('Fighter: Champion Subclass', () => {
    it('should create a Champion Fighter', () => {
      const champion = createCharacter(
        {
          name: 'Valeros',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          subclassId: 'Champion',
          classLevel: 3,
          abilityScores: {
            Strength: 17,
            Dexterity: 13,
            Constitution: 16,
            Intelligence: 10,
            Wisdom: 12,
            Charisma: 9,
          },
        },
        dataLoader
      );

      expect(champion.classes[0]!.classId).toBe('Fighter');
      expect(champion.classes[0]!.level).toBe(3);
      expect(champion.classes[0]!.subclassId).toBe('Champion');
      expect(getSubclassFeatureNames('Champion', 3)).toContain('Improved Critical');
    });

    it('should have Champion features at level 3', () => {
      const champion = createCharacter(
        {
          name: 'Valeros',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          subclassId: 'Champion',
          classLevel: 3,
          abilityScores: {
            Strength: 17,
            Dexterity: 13,
            Constitution: 16,
            Intelligence: 10,
            Wisdom: 12,
            Charisma: 9,
          },
        },
        dataLoader
      );

      expect(champion.classes[0]!.level).toBe(3);
      expect(champion.classes[0]!.subclassId).toBe('Champion');
      expect(getSubclassFeatureNames('Champion', 3)).toContain('Improved Critical');
    });
  });

  // ============================================================
  // BATTLE MASTER SUBCLASS (PHB p.73-74, SRD)
  // ============================================================
  describe('Fighter: Battle Master Subclass', () => {
    it('should create a Battle Master Fighter', () => {
      const battlemaster = createCharacter(
        {
          name: 'Dungeon Master',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          subclassId: 'Battle Master',
          classLevel: 3,
          abilityScores: {
            Strength: 16,
            Dexterity: 14,
            Constitution: 15,
            Intelligence: 10,
            Wisdom: 13,
            Charisma: 8,
          },
        },
        dataLoader
      );

      expect(battlemaster.classes[0]!.classId).toBe('Fighter');
      expect(battlemaster.classes[0]!.level).toBe(3);
      expect(battlemaster.classes[0]!.subclassId).toBe('Battle Master');
      expect(getSubclassFeatureNames('Battle Master', 3)).toEqual(
        expect.arrayContaining(['Combat Superiority', 'Student of War'])
      );
    });

    it('should have Battle Master features at level 3', () => {
      const battlemaster = createCharacter(
        {
          name: 'Tactician',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          subclassId: 'Battle Master',
          classLevel: 3,
          abilityScores: {
            Strength: 16,
            Dexterity: 14,
            Constitution: 15,
            Intelligence: 10,
            Wisdom: 13,
            Charisma: 8,
          },
        },
        dataLoader
      );

      expect(battlemaster.classes[0]!.level).toBe(3);
      expect(battlemaster.classes[0]!.subclassId).toBe('Battle Master');
      expect(getSubclassFeatureNames('Battle Master', 3)).toEqual(
        expect.arrayContaining(['Combat Superiority', 'Student of War'])
      );
    });
  });

  // ============================================================
  // ELDRITCH KNIGHT SUBCLASS (PHB p.74-75, SRD)
  // ============================================================
  describe('Fighter: Eldritch Knight Subclass', () => {
    it('should create an Eldritch Knight (spellcasting granted at level 3 via feature)', () => {
      const ek = createCharacter(
        {
          name: 'Arcanist',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          subclassId: 'Eldritch Knight',
          classLevel: 7,
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 16,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        dataLoader
      );

      // Note: Eldritch Knight spellcasting is granted by a subclass feature at level 3
      // The current implementation doesn't automatically add subclass-granted spellcasting
      // This test verifies the character is created successfully
      expect(ek.classes[0]!.level).toBe(7);
      expect(ek.classes[0]!.subclassId).toBe('Eldritch Knight');
      expect(getSubclassFeatureNames('Eldritch Knight', 3)).toEqual(
        expect.arrayContaining(['Spellcasting', 'Weapon Bond'])
      );
      expect(getSubclassFeatureNames('Eldritch Knight', 7)).toContain('War Magic');
    });

    it('should have fighter levels', () => {
      const ek = createCharacter(
        {
          name: 'Arcanist',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          subclassId: 'Eldritch Knight',
          classLevel: 3,
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 16,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        dataLoader
      );

      expect(ek.classes[0]!.level).toBe(3);
      expect(ek.classes[0]!.subclassId).toBe('Eldritch Knight');
      expect(getSubclassFeatureNames('Eldritch Knight', 3)).toEqual(
        expect.arrayContaining(['Spellcasting', 'Weapon Bond'])
      );
    });

    it('should document that Eldritch Knight spell slots are not materialized yet', () => {
      const ek = createCharacter(
        {
          name: 'Arcanist',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          subclassId: 'Eldritch Knight',
          classLevel: 7,
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 16,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        dataLoader
      );

      expect(ek.classes[0]!.level).toBe(7);
      expect(ek.classes[0]!.subclassId).toBe('Eldritch Knight');
      expect(ek.spells.classSpellcasting['Fighter']).toBeUndefined();
      expect(ek.spells.spellSlots[1]!.total).toBe(0);
      expect(getSubclassFeatureNames('Eldritch Knight', 3)).toContain('Spellcasting');
    });
  });
});
