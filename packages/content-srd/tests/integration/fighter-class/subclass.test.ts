import { describe, it, expect } from 'vitest';
import { createTestDepsForCreate, getTestSubclass } from '../../create-test-loader';
import { createCharacter } from 'open20-core/character';

function getSubclassFeatureNames(subclassId: string, level: number) {
  const subclass = getTestSubclass(subclassId);
  expect(subclass).toBeDefined();
  return subclass!.featuresByLevel
    .find((entry) => entry.level === level)!
    .features.map((feature) => feature.name);
}

describe('D&D SRD 5.2 - Fighter Class: Subclasses', () => {
  // ============================================================
  // CHAMPION SUBCLASS (PHB p.72-73, SRD)
  // ============================================================
  describe('Fighter: Champion Subclass', () => {
    it('should create a Champion Fighter', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
        subclassId: 'Champion',
      });
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
        deps,
      );

      expect(champion.classes[0]!.classId).toBe('Fighter');
      expect(champion.classes[0]!.level).toBe(3);
      expect(champion.classes[0]!.subclassId).toBe('Champion');
      expect(getSubclassFeatureNames('Champion', 3)).toContain('Improved Critical');
    });

    it('should have Champion features at level 3', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
        subclassId: 'Champion',
      });
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
        deps,
      );

      expect(champion.classes[0]!.level).toBe(3);
      expect(champion.classes[0]!.subclassId).toBe('Champion');
      expect(getSubclassFeatureNames('Champion', 3)).toContain('Improved Critical');
    });
  });
});
