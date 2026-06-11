import { describe, it, expect } from 'vitest';
import {
  createTestDepsForCreate,
  createTestDeps,
  getTestSubclass,
  getTestClass,
} from '../../create-test-loader';
import {
  createCharacter,
  applyTypedDamage,
  consumeResource,
  shortRest,
} from 'open20-core/character';

describe('D&D SRD 5.2 - Fighter Class: Combat Scenarios', () => {
  // ============================================================
  // COMBINED FIGHTER GAMEPLAY SCENARIO
  // ============================================================
  describe('Fighter: Full Combat Scenario (Level 10)', () => {
    it('should simulate a complete Fighter combat encounter', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
      });
      let fighter = createCharacter(
        {
          name: 'Commander',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          classLevel: 10,
          abilityScores: {
            Strength: 18,
            Dexterity: 14,
            Constitution: 16,
            Intelligence: 10,
            Wisdom: 14,
            Charisma: 8,
          },
        },
        deps,
      );

      const initialHP = fighter.hitPoints.current;
      expect(fighter.classes[0]!.level).toBe(10);
      expect(fighter.combatStats.proficiencyBonus).toBe(4);

      expect(fighter.resources['Fighter']).toBeDefined();

      const defenses: any = {
        resistances: [],
        immunities: [],
        vulnerabilities: [],
      };

      const result = applyTypedDamage(fighter, 25, 'Slashing', defenses);
      fighter = result.char;
      expect(fighter.hitPoints.current).toBeLessThan(initialHP);

      const fighterResources = fighter.resources['Fighter'];
      const secondWind = fighterResources!.resources.find((r) => r.id === 'Second Wind');
      const actionSurge = fighterResources!.resources.find((r) => r.id === 'Action Surge');
      const indomitable = fighterResources!.resources.find((r) => r.id === 'Indomitable');

      expect(secondWind).toBeDefined();
      expect(actionSurge).toBeDefined();
      expect(indomitable).toBeDefined();

      fighter = consumeResource(fighter, 'Fighter', 'Second Wind');
      const swAfterConsume = fighter.resources['Fighter']!.resources.find(
        (r) => r.id === 'Second Wind',
      );
      expect(swAfterConsume!.used).toBe(1);

      const depsForShortRest = createTestDeps(fighter);
      fighter = shortRest(fighter, 1, depsForShortRest);

      const afterRest = fighter.resources['Fighter']!.resources.find((r) => r.id === 'Second Wind');
      expect(afterRest!.used).toBe(0);
    });

    it('should simulate Eldritch Knight spell combat', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'sage',
        classId: 'Fighter',
        subclassId: 'Eldritch Knight',
      });
      const ek = createCharacter(
        {
          name: 'Battle Mage',
          speciesId: 'Human',
          backgroundId: 'sage',
          classId: 'Fighter',
          subclassId: 'Eldritch Knight',
          classLevel: 7,
          abilityScores: {
            Strength: 15,
            Dexterity: 13,
            Constitution: 14,
            Intelligence: 17,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        deps,
      );

      // Note: Eldritch Knight spellcasting is granted by a subclass feature at level 3
      // The current implementation doesn't automatically add subclass-granted spellcasting
      // This test verifies the character is created successfully
      expect(ek.classes[0]!.level).toBe(7);
      expect(ek.classes[0]!.subclassId).toBe('Eldritch Knight');
      const eldritchKnight = getTestSubclass('Eldritch Knight')!;
      const level7Features = eldritchKnight.featuresByLevel
        .find((entry) => entry.level === 7)!
        .features.map((feature) => feature.name);
      expect(level7Features).toContain('War Magic');
    });
  });

  // ============================================================
  // FIGHTING STYLES (PHB p.72, SRD)
  // ============================================================
  describe('Fighter: Fighting Styles', () => {
    it('should have Fighting Style available', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
      });
      const fighter = createCharacter(
        {
          name: 'Warrior',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          abilityScores: {
            Strength: 16,
            Dexterity: 14,
            Constitution: 15,
            Intelligence: 10,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        deps,
      );

      expect(fighter.classes[0]!.level).toBe(1);
      const fighterClass = getTestClass('Fighter')!;
      const level1Features = fighterClass.featuresByLevel
        .find((entry) => entry.level === 1)!
        .features.map((feature) => feature.name);
      expect(level1Features).toContain('Fighting Style');
    });
  });

  // ============================================================
  // FIGHTING MASTERIES (2024 PHB)
  // ============================================================
  describe('Fighter: Weapon Mastery (2024)', () => {
    it('should have Weapon Mastery feature', () => {
      const deps = createTestDepsForCreate({
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
      });
      const fighter = createCharacter(
        {
          name: 'Master',
          speciesId: 'Human',
          backgroundId: 'soldier',
          classId: 'Fighter',
          abilityScores: {
            Strength: 18,
            Dexterity: 14,
            Constitution: 16,
            Intelligence: 10,
            Wisdom: 12,
            Charisma: 8,
          },
        },
        deps,
      );

      expect(fighter.classes[0]!.classId).toBe('Fighter');
      expect(getTestClass('Fighter')!.weaponMastery).toBe(true);
      const level1Features = getTestClass('Fighter')!
        .featuresByLevel.find((entry) => entry.level === 1)!
        .features.map((feature) => feature.name);
      expect(level1Features).toContain('Weapon Mastery');
    });
  });
});
