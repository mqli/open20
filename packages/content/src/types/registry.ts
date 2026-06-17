import type { ZodSchema } from 'zod';
import { SpellSchema, MonsterSchema } from '../validator/schemas';
import { getSpellTemplate } from '../templates/spell-template';
import { getMonsterTemplate } from '../templates/monster-template';

export type ContentTypeId =
  | 'species'
  | 'backgrounds'
  | 'classes'
  | 'subclasses'
  | 'feats'
  | 'spells'
  | 'weapons'
  | 'armors'
  | 'gears'
  | 'monsters'
  | 'glossary';

export interface ContentTypeDescriptor {
  id: ContentTypeId;
  name: string; // Display name (e.g., 'Spells')
  schema: ZodSchema; // Zod validation schema (defined by rulebook)
  template: () => unknown; // Factory function for empty template
}

// Phase 2: Spells and Monsters are registered.
export const contentTypes: ContentTypeDescriptor[] = [
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
  { id: 'monsters', name: 'Monsters', schema: MonsterSchema, template: getMonsterTemplate },
];
