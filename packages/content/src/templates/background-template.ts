import type { Background } from 'open20-core';

/**
 * Returns an empty Background template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new backgrounds.
 */
export function getBackgroundTemplate(): Background {
  return {
    id: '',
    source: '',
    skillProficiencies: [],
    toolProficiencies: [],
    languages: [],
    originFeatId: '',
    startingGold: 0,
  };
}
