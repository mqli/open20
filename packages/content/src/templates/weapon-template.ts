import type { Weapon } from 'open20-core';

/**
 * Returns an empty Weapon template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new weapons.
 */
export function getWeaponTemplate(): Weapon {
  return {
    id: '',
    name: '',
    source: 'Homebrew',
    type: 'weapon',
    category: 'Simple',
    damage: {
      entries: [{ dice: '1d6', type: 'Slashing' }],
      ability: 'Strength',
      bonus: 0,
    },
    properties: [],
    weight: 0,
    equipped: false,
  } as Weapon;
}
