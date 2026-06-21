import type { Feat } from 'open20-core';

/**
 * Returns an empty Feat template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new feats.
 */
export function getFeatTemplate(): Feat {
  return {
    id: '',
    source: '',
    description: '',
    category: 'General',
  };
}
