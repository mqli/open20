import type { Gear } from 'open20-core';

/**
 * Returns an empty Gear template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new gears.
 */
export function getGearTemplate(): Gear {
  return {
    id: '',
    name: '',
    source: 'Homebrew',
    type: 'gears',
    weight: 0,
    equipped: false,
  } as Gear;
}
