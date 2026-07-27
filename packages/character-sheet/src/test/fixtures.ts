// fixtures.ts (T-009)
// Test fixture builder. Builds valid, recomputed characters via core so
// fixtures stay correct as the schema evolves. Used across UI/store tests.

import { createCharacter, type AbilityName } from 'open20-core';
import type { AppCharacter } from '@/types';
import { initContent, buildDepsForCreate } from '@/core/content-resolver';

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
