import type { ZodSchema } from 'zod';
import { SpellSchema } from '../validator/schemas';
import { getSpellTemplate } from '../templates/spell-template';

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

// Phase 1: Only Spell is registered. Other 10 are commented out for Phase 2.
export const contentTypes: ContentTypeDescriptor[] = [
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
];
