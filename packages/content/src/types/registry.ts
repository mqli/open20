import type { ZodSchema } from 'zod';
import {
  SpellSchema,
  MonsterSchema,
  SpeciesSchema,
  BackgroundSchema,
  FeatSchema,
} from '../validator/schemas';
import { getSpellTemplate } from '../templates/spell-template';
import { getMonsterTemplate } from '../templates/monster-template';
import { getSpeciesTemplate } from '../templates/species-template';
import { getBackgroundTemplate } from '../templates/background-template';
import { getFeatTemplate } from '../templates/feat-template';

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
// Phase 3: Species, Backgrounds, Feats registered.
export const contentTypes: ContentTypeDescriptor[] = [
  { id: 'spells', name: 'Spells', schema: SpellSchema, template: getSpellTemplate },
  { id: 'monsters', name: 'Monsters', schema: MonsterSchema, template: getMonsterTemplate },
  { id: 'species', name: 'Species', schema: SpeciesSchema, template: getSpeciesTemplate },
  {
    id: 'backgrounds',
    name: 'Backgrounds',
    schema: BackgroundSchema,
    template: getBackgroundTemplate,
  },
  { id: 'feats', name: 'Feats', schema: FeatSchema, template: getFeatTemplate },
];
