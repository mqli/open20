import type { Spell } from 'open20-core';

type RawComponents = readonly string[] | string | Record<string, unknown>;

export interface RawSpell extends Partial<Omit<Spell, 'components' | 'classes' | 'level' | 'description'>> {
  id?: string;
  name: string;
  level?: number | string;
  components?: RawComponents;
  classes?: readonly string[] | string;
  description?: string | string[];
}

/**
 * Service dedicated to validating and transforming raw SRD data into 
 * strict open20-core types. This ensures the rest of the application 
 * can operate with full type safety without 'as any' hacks.
 */
export class SchemaService {
  private static readonly ALL_SPELLCASTING_CLASSES = [
    'Artificer',
    'Bard',
    'Cleric',
    'Druid',
    'Paladin',
    'Ranger',
    'Sorcerer',
    'Warlock',
    'Wizard',
  ];

  private static normalizeClasses(classes: string[]): string[] {
    return classes
      .map(c => {
        const found = this.ALL_SPELLCASTING_CLASSES.find(ac => ac.toLowerCase() === c.trim().toLowerCase());
        return found;
      })
      .filter((c): c is string => !!c);
  }

  private static inferClassesFromDescription(description: string | string[]): string[] {
    const desc = Array.isArray(description) ? description.join(' ') : (description || '');

    // Most 2024 entries start with "Level 3 Evocation (Sorcerer, Wizard)".
    const headerMatch = desc.match(/^(?:level\s+\d+\s+|[\d\w-]+-level\s+)?[a-z]+\s+(?:cantrip\s+)?\(([^)]+)\)/i);
    if (headerMatch?.[1]) {
      return this.normalizeClasses(headerMatch[1].split(','));
    }

    const lowerDesc = desc.toLowerCase();
    return this.ALL_SPELLCASTING_CLASSES.filter(c => lowerDesc.includes(c.toLowerCase()));
  }

  static transformSpells(rawSpells: RawSpell[]): Spell[] {
    return rawSpells.map(raw => {
      // 1. Normalize Components
      let components: string[] = [];
      if (Array.isArray(raw.components)) {
        components = [...raw.components];
      } else if (typeof raw.components === 'string') {
        components = raw.components.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (typeof raw.components === 'object' && raw.components !== null) {
        // Handle {V: true, S: true, M: true} or {v: true, s: true, m: true} or {material: "..."}
        const componentMap = raw.components as Record<string, unknown>;
        components = Object.keys(componentMap).filter(key => !!componentMap[key]);
      }

      // 2. Normalize Classes (Handle arrays, strings, or inference)
      let classes: string[] = [];
      
      if (Array.isArray(raw.classes)) {
        classes = [...raw.classes];
      } else if (typeof raw.classes === 'string') {
        classes = raw.classes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      classes = this.normalizeClasses(classes);

      // If still empty, infer from description
      if (classes.length === 0) {
        classes = this.inferClassesFromDescription(raw.description || '');
      }

      // Keep spells usable even when upstream data omits a class list entirely.
      if (classes.length === 0) {
        classes = [...this.ALL_SPELLCASTING_CLASSES];
      }

      // 3. Normalize description to readonly string[]
      let description: readonly string[] = [];
      if (typeof raw.description === 'string') {
        description = raw.description ? [raw.description] : [];
      } else if (Array.isArray(raw.description)) {
        description = [...raw.description];
      }

      // 4. Return strictly typed Spell
      return {
        ...raw,
        id: raw.id || raw.name.toLowerCase().replace(/\s+/g, '-'),
        level: (parseInt(String(raw.level ?? 0)) || 0) as Spell['level'],
        components,
        classes,
        ritual: !!raw.ritual,
        concentration: !!raw.concentration,
        source: raw.source || 'SRD',
        description,
      } as Spell;
    });
  }
}
