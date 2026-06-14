import type { Spell } from 'open20-core';

/**
 * Returns an empty Spell template with sensible defaults.
 * Used by ContentTypeRegistry.template and ContentEditor for new spells.
 */
export function getSpellTemplate(): Spell {
  return {
    id: '',
    name: '',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: [''],
    source: '',
  };
}
