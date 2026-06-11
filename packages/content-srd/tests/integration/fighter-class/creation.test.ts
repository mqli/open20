import { describe, it, expect } from 'vitest';
import { createTestDepsForCreate, createTestDeps, getTestClass } from '../../create-test-loader';
import { createCharacter, validateCharacter } from 'open20-core/character';

describe('D&D SRD 5.2 - Fighter Class: Character Creation', () => {
  it('should create a level 1 Human Fighter', () => {
    const deps = createTestDepsForCreate({
      speciesId: 'Human',
      backgroundId: 'soldier',
      classId: 'Fighter',
    });
    const fighter = createCharacter(
      {
        name: 'Sir Roland',
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
        abilityScores: {
          Strength: 16,
          Dexterity: 13,
          Constitution: 15,
          Intelligence: 10,
          Wisdom: 12,
          Charisma: 8,
        },
      },
      deps,
    );

    expect(fighter.name).toBe('Sir Roland');
    expect(fighter.species).toBe('Human');
    expect(fighter.classes[0]!.classId).toBe('Fighter');
    expect(fighter.classes[0]!.level).toBe(1);
    expect(fighter.combatStats.proficiencyBonus).toBe(2);

    expect(fighter.hitPoints.current).toBeGreaterThanOrEqual(10);
    expect(fighter.hitPoints.max).toBeGreaterThanOrEqual(10);
  });

  it('should create a Dwarven Fighter with racial bonuses', () => {
    const deps = createTestDepsForCreate({
      speciesId: 'Dwarf',
      backgroundId: 'soldier',
      classId: 'Fighter',
    });
    const fighter = createCharacter(
      {
        name: 'Thorin',
        speciesId: 'Dwarf',
        speciesSubtypeId: 'Hill Dwarf',
        backgroundId: 'soldier',
        classId: 'Fighter',
        abilityScores: {
          Strength: 16,
          Dexterity: 10,
          Constitution: 16,
          Intelligence: 8,
          Wisdom: 13,
          Charisma: 11,
        },
      },
      deps,
    );

    expect(fighter.species).toBe('Dwarf');
    expect(fighter.speciesSubtype).toBe('Hill Dwarf');
    expect(fighter.abilityScores.racialBonuses.Constitution).toBe(2);
    expect(fighter.classes[0]!.classId).toBe('Fighter');
  });

  it('should create a Fighter 5 with Extra Attack feature', () => {
    const deps = createTestDepsForCreate({
      speciesId: 'Human',
      backgroundId: 'soldier',
      classId: 'Fighter',
    });
    const fighter = createCharacter(
      {
        name: 'Aldric',
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
        classLevel: 5,
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

    expect(fighter.classes[0]!.level).toBe(5);
    expect(fighter.combatStats.proficiencyBonus).toBe(3);
    const level5Features = getTestClass('Fighter')!
      .featuresByLevel.find((entry) => entry.level === 5)!
      .features.map((feature) => feature.name);
    expect(level5Features).toContain('Extra Attack');
  });

  it('should validate a Fighter character', () => {
    const deps = createTestDepsForCreate({
      speciesId: 'Human',
      backgroundId: 'soldier',
      classId: 'Fighter',
    });
    const fighter = createCharacter(
      {
        name: 'Valeros',
        speciesId: 'Human',
        backgroundId: 'soldier',
        classId: 'Fighter',
        abilityScores: {
          Strength: 16,
          Dexterity: 13,
          Constitution: 15,
          Intelligence: 10,
          Wisdom: 12,
          Charisma: 8,
        },
      },
      deps,
    );

    const depsForValidate = createTestDeps(fighter);
    const validation = validateCharacter(fighter, depsForValidate);
    expect(validation.valid).toBe(true);
  });
});
