import type { Species } from 'open20-core';

/**
 * Returns an empty Species template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new species.
 */
export function getSpeciesTemplate(): Species {
  return {
    id: '',
    source: '',
    description: '',
    size: 'Medium',
    speed: 30,
    languages: [],
    abilityBonuses: {},
    baseTraits: [],
  };
}
