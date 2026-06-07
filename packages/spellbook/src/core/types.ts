import type { Character, Spell, AbilityScores, AbilityName } from 'open20-core';

export type AppCharacter = Character & { id: string };

export interface CharacterCreationParams {
  name: string;
  speciesId: string;
  backgroundId: string;
  classId: string;
  classLevel?: number;
  subclassId?: string;
  abilityScores: Record<AbilityName, number>;
  additionalClasses?: Array<{
    classId: string;
    level: number;
    subclassId?: string;
  }>;
}

export type { Character, Spell, AbilityScores };
