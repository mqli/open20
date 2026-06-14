export type SpellSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';

export interface SpellQuery {
  name?: string; // Case-insensitive substring match
  level?: number; // Exact match (0-9). Mutually exclusive with levelRange.
  levelRange?: { min: number; max: number };
  school?: SpellSchool; // Exact match
  classes?: string[]; // Spell's classes array intersects with this
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'level' | 'school';
  sortOrder?: 'asc' | 'desc';
}
