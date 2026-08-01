// fixtures.ts (T-009)
// Test fixture builder. Builds valid, recomputed characters via core so
// fixtures stay correct as the schema evolves. Used across UI/store tests.

import {
  createCharacter,
  addEquipment,
  recomputeDerivedStats,
  type AbilityName,
} from 'open20-core';
import type { AppCharacter } from '@/types';
import { initContent, buildDepsForCreate, resolveDeps } from '@/core/content-resolver';

const DEFAULT_SCORES: Record<AbilityName, number> = {
  Strength: 10,
  Dexterity: 14,
  Constitution: 14,
  Intelligence: 16,
  Wisdom: 12,
  Charisma: 10,
};

export interface MakeCharacterOptions {
  id?: string;
  name?: string;
  speciesId?: string;
  backgroundId?: string;
  classId?: string;
  classLevel?: number;
  abilityScores?: Partial<Record<AbilityName, number>>;
  featIds?: string[];
}

/** Build a valid, recomputed AppCharacter (default: Level-5 High Elf Wizard). */
export function makeCharacter(options: MakeCharacterOptions = {}): AppCharacter {
  initContent();

  const speciesId = options.speciesId ?? 'Elf';
  const backgroundId = options.backgroundId ?? 'sage';
  const classId = options.classId ?? 'Wizard';
  const classLevel = options.classLevel ?? 5;

  const deps = buildDepsForCreate({ speciesId, backgroundId, classId });
  const char = createCharacter(
    {
      name: options.name ?? 'Tharion',
      speciesId,
      backgroundId,
      classId,
      classLevel,
      abilityScores: { ...DEFAULT_SCORES, ...options.abilityScores },
      featIds: options.featIds ?? [], // tests opt-in to feats; default empty for back-compat
    },
    deps,
  );

  return { ...char, id: options.id ?? 'test-character-1' };
}

/** A Level-9 Fighter/Wizard multiclass fixture. */
export function makeMulticlassCharacter(): AppCharacter {
  return makeCharacter({
    id: 'test-multiclass-1',
    name: 'Vex',
    classId: 'Fighter',
    classLevel: 6,
  });
}

const MONK_SCORES: Record<AbilityName, number> = {
  Strength: 12,
  Dexterity: 18,
  Constitution: 14,
  Intelligence: 10,
  Wisdom: 16,
  Charisma: 8,
};

/** A Level-5 Human Monk with Spear + Dagger equipped (for testing weapon attacks). */
export function makeMonkCharacter(): AppCharacter {
  initContent();

  const deps = buildDepsForCreate({
    speciesId: 'Human',
    backgroundId: 'acolyte',
    classId: 'Monk',
  });

  let char = createCharacter(
    {
      name: 'Lian',
      speciesId: 'Human',
      backgroundId: 'acolyte',
      classId: 'Monk',
      classLevel: 5,
      abilityScores: MONK_SCORES,
    },
    deps,
  );

  // Equip monk weapons
  char = addEquipment(char, {
    id: 'spear',
    name: 'Spear',
    type: 'weapon',
    weight: 3,
    equipped: true,
    quantity: 1,
  });
  char = addEquipment(char, {
    id: 'dagger',
    name: 'Dagger',
    type: 'weapon',
    weight: 1,
    equipped: true,
    quantity: 5,
  });

  // Recompute derived stats so attacks include the newly equipped weapons
  const depsWithWeapons = resolveDeps(char);
  char = recomputeDerivedStats(char, depsWithWeapons);

  return { ...char, id: 'test-monk-1' };
}
