// tests/character/validate.test.ts
// Character validation tests

import { describe, it, expect } from 'vitest';
import { validateCharacter } from '../../src/character/validate';
import { createCharacter } from '../../src/character/create';
import type { RecomputeDerivedStatsDeps } from '../../src/types/deps';
import type { Species } from '../../src/types/species';
import type { Background } from '../../src/types/background';
import type { Class, Feature, Subclass } from '../../src/types/class';
import type { Feat } from '../../src/types/feat';
import { ResetType } from '../../src/types/resource';
import type { Character } from '../../src/types/character';
import type { CreateCharacterParams } from '../../src/character/create';

// ── Mock Data ──────────────────────────────────────────────────

const HUMAN_SPECIES: Species = {
  id: 'Human',
  source: '2024 PHB',
  description: 'Versatile and ambitious',
  size: 'Medium',
  speed: 30,
  languages: ['Common'],
  abilityBonuses: {},
  baseTraits: [],
};

const SOLDIER_BACKGROUND: Background = {
  id: 'Soldier',
  source: '2024 PHB',
  name: 'Soldier',
  description: 'Military veteran',
  skillProficiencies: ['Athletics', 'Intimidation'],
  toolProficiencies: ['Land Vehicles'],
  languages: [],
  originFeatId: 'Savage Attacker',
  startingGold: 10,
};

const FIGHTER_FEATURES_L1: Feature[] = [
  { name: 'Fighting Style', description: 'Choose a fighting style', level: 1 },
  { name: 'Second Wind', description: 'Heal yourself', resourceId: 'Second Wind', level: 1 },
  { name: 'Weapon Mastery', description: 'Master weapons', level: 1 },
];

const FIGHTER_CLASS: Class = {
  id: 'Fighter',
  name: 'Fighter',
  source: '2024 PHB',
  hitDie: 'd10',
  savingThrowProficiencies: ['Strength', 'Constitution'],
  armorTraining: ['Light', 'Medium', 'Heavy', 'Shield'],
  weaponMastery: true,
  featuresByLevel: [{ level: 1, features: FIGHTER_FEATURES_L1 }],
  spellcasting: null,
};

const WIZARD_FEATURES_L1: Feature[] = [
  { name: 'Spellcasting', description: 'Cast wizard spells', level: 1 },
  {
    name: 'Arcane Recovery',
    description: 'Recover spell slots',
    resourceId: 'Arcane Recovery',
    level: 1,
  },
];

const WIZARD_CLASS: Class = {
  id: 'Wizard',
  name: 'Wizard',
  source: '2024 PHB',
  hitDie: 'd6',
  savingThrowProficiencies: ['Intelligence', 'Wisdom'],
  armorTraining: [],
  weaponMastery: false,
  featuresByLevel: [{ level: 1, features: WIZARD_FEATURES_L1 }],
  spellcasting: {
    ability: 'Intelligence',
    knownSource: 'spellbook',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
};

const ALERT_FEAT: Feat = {
  id: 'Alert',
  name: 'Alert',
  category: 'General',
  description: '+5 Initiative',
  source: '2024 PHB',
};

const CHAMPION_SUBCLASS: Subclass = {
  id: 'Champion',
  parentClass: 'Fighter',
  grantedAtLevel: 3,
  featuresByLevel: [
    { level: 3, features: [{ name: 'Improved Critical', description: 'Crit on 19-20', level: 3 }] },
  ],
};

// ── Mock Deps ──────────────────────────────────────────────────

function createMockDeps(overrides?: {
  feats?: Record<string, Feat>;
  subclasses?: Record<string, Subclass>;
}): RecomputeDerivedStatsDeps {
  const speciesMap: Record<string, Species> = { Human: HUMAN_SPECIES };
  const backgroundMap: Record<string, Background> = { Soldier: SOLDIER_BACKGROUND };
  const classMap: Record<string, Class> = { Fighter: FIGHTER_CLASS, Wizard: WIZARD_CLASS };
  const featMap: Record<string, Feat> = overrides?.feats ?? { Alert: ALERT_FEAT };
  const subclassMap: Record<string, Subclass> = overrides?.subclasses ?? {
    Champion: CHAMPION_SUBCLASS,
  };

  return {
    species: HUMAN_SPECIES,
    background: SOLDIER_BACKGROUND,
    classes: classMap,
    subclasses: subclassMap,
    feats: featMap,
  };
}

// ── Helper: create valid character ─────────────────────────────

function createValidCharacter(deps: RecomputeDerivedStatsDeps): Character {
  const params: CreateCharacterParams = {
    name: 'Aragorn',
    speciesId: 'Human',
    backgroundId: 'Soldier',
    classId: 'Fighter',
    abilityScores: {
      Strength: 15,
      Dexterity: 14,
      Constitution: 15,
      Intelligence: 8,
      Wisdom: 12,
      Charisma: 10,
    },
  };
  return createCharacter(params, deps);
}

// ── Helper: mutate character (bypass readonly) ─────────────────

function mutate<T extends object>(obj: T): { -readonly [K in keyof T]: T[K] } {
  return obj as { -readonly [K in keyof T]: T[K] };
}

// ── Tests ──────────────────────────────────────────────────────

describe('validateCharacter', () => {
  const deps = createMockDeps();

  it('returns valid=true with no errors for a valid character', () => {
    const char = createValidCharacter(deps);
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(true);
    expect(result.errors.filter((e) => e.severity === 'error')).toEqual([]);
  });

  it('returns error for empty name', () => {
    const char = createValidCharacter(deps);
    mutate(char).name = '';
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'name', severity: 'error' }),
    );
  });

  it('returns error for invalid species', () => {
    const char = createValidCharacter(deps);
    mutate(char).species = 'Dragonborn';
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'species', severity: 'error' }),
    );
  });

  it('returns error for invalid background', () => {
    const char = createValidCharacter(deps);
    mutate(char).background = 'Pirate';
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'background', severity: 'error' }),
    );
  });

  it('returns error for invalid class', () => {
    const char = createValidCharacter(deps);
    mutate(char).classes = [{ ...char.classes[0]!, classId: 'Artificer' }];
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'classes[0].classId', severity: 'error' }),
    );
  });

  it('returns error for level 0', () => {
    const char = createValidCharacter(deps);
    mutate(char).classes = [{ ...char.classes[0]!, level: 0 }];
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'classes[0].level',
        severity: 'error',
        message: expect.stringContaining('>= 1'),
      }),
    );
  });

  it('returns error for level 21', () => {
    const char = createValidCharacter(deps);
    mutate(char).classes = [{ ...char.classes[0]!, level: 21 }];
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'classes[0].level',
        severity: 'error',
        message: expect.stringContaining('<= 20'),
      }),
    );
  });

  it('returns error for total level > 20', () => {
    const char = createValidCharacter(deps);
    mutate(char).classes = [
      {
        classId: 'Fighter',
        level: 15,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd10', used: 0 },
      },
      {
        classId: 'Wizard',
        level: 10,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd6', used: 0 },
      },
    ];
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'classes',
        severity: 'error',
        message: expect.stringContaining('Total level'),
      }),
    );
  });

  it('returns error for base ability < 1', () => {
    const char = createValidCharacter(deps);
    const scores = mutate(char.abilityScores);
    scores.base = { ...scores.base, Strength: 0 };
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'abilityScores.base.Strength', severity: 'error' }),
    );
  });

  it('returns error for base ability > 30', () => {
    const char = createValidCharacter(deps);
    const scores = mutate(char.abilityScores);
    scores.base = { ...scores.base, Strength: 31 };
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'abilityScores.base.Strength', severity: 'error' }),
    );
  });

  it('returns warning for base ability 7 (below typical range)', () => {
    const char = createValidCharacter(deps);
    const scores = mutate(char.abilityScores);
    scores.base = { ...scores.base, Intelligence: 7 };
    const result = validateCharacter(char, deps);
    // Should have a warning but still be valid
    expect(result.valid).toBe(true);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'abilityScores.base.Intelligence', severity: 'warning' }),
    );
  });

  it('returns error for HP current > max', () => {
    const char = createValidCharacter(deps);
    mutate(char).hitPoints = { ...char.hitPoints, current: 999 };
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'hitPoints.current', severity: 'error' }),
    );
  });

  it('returns error for resource used > max', () => {
    const char = createValidCharacter(deps);
    mutate(char).resources = {
      Fighter: {
        classId: 'Fighter',
        resources: [
          { id: 'Second Wind', name: 'Second Wind', max: 1, used: 3, resetOn: ResetType.ShortRest },
        ],
      },
    };
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'resources.Fighter.resources[0].used', severity: 'error' }),
    );
  });

  it('returns warning for invalid feat', () => {
    const char = createValidCharacter(deps);
    mutate(char).feats = [{ featId: 'NonExistentFeat' }];
    const result = validateCharacter(char, deps);
    // Warning means valid is still true
    expect(result.valid).toBe(true);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'feats[0].featId',
        severity: 'warning',
        message: expect.stringContaining('NonExistentFeat'),
      }),
    );
  });

  it('returns multiple errors at once', () => {
    const char = createValidCharacter(deps);
    mutate(char).name = '';
    mutate(char).species = 'Invalid';
    mutate(char).background = 'Invalid';
    const result = validateCharacter(char, deps);
    expect(result.valid).toBe(false);
    const errorFields = result.errors.filter((e) => e.severity === 'error').map((e) => e.field);
    expect(errorFields).toContain('name');
    expect(errorFields).toContain('species');
    expect(errorFields).toContain('background');
    expect(result.errors.filter((e) => e.severity === 'error').length).toBeGreaterThanOrEqual(3);
  });
});
