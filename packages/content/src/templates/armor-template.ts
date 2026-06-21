import type { Armor } from 'open20-core';

/**
 * Returns an empty Armor template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new armors.
 */
export function getArmorTemplate(): Armor {
  return {
    id: '',
    name: '',
    source: 'Homebrew',
    category: 'Light',
    ac: 11,
    dexBonus: true,
    weight: 0,
  } as Armor;
}
