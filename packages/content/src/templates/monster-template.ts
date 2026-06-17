import type { Monster } from 'open20-core';

/**
 * Returns an empty Monster template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new monsters.
 */
export function getMonsterTemplate(): Monster {
  return {
    id: '',
    name: '',
    source: '',
    size: 'Medium',
    type: 'Humanoid',
    alignment: 'neutral',
    armorClass: [{ value: 10, type: 'natural armor' }],
    hitPoints: { value: 1, formula: '1d8' },
    speed: { walk: 30 },
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    } as any,
    challengeRating: { rating: 0, xp: 10 },
    traits: [],
    actions: [],
    environments: [],
  };
}
