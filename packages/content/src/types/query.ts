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

export interface MonsterQuery {
  name?: string; // Case-insensitive substring (fuzzy) match
  type?: string; // Exact match (e.g. 'Dragon', 'Humanoid')
  cr?: number; // Exact challenge rating
  crRange?: { min: number; max: number };
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'cr' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export type SpeciesSize = 'Small' | 'Medium';

export interface SpeciesQuery {
  name?: string; // Case-insensitive substring match
  size?: SpeciesSize; // Exact match on size field
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface BackgroundQuery {
  name?: string; // Case-insensitive substring match
  source?: string; // Exact match on source field
  sortBy?: 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface FeatQuery {
  name?: string; // Case-insensitive substring match
  source?: string; // Exact match on source field
  hasPrerequisite?: boolean; // Filter by whether the feat has prerequisites
  category?: string; // Exact match on category field
  sortBy?: 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export type WeaponCategory = 'Simple' | 'Martial';

export interface WeaponQuery {
  name?: string; // Case-insensitive substring match
  category?: WeaponCategory; // Exact match
  damageType?: string; // Exact match on damage entries
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export type ArmorCategory = 'Light' | 'Medium' | 'Heavy' | 'Shield';

export interface ArmorQuery {
  name?: string; // Case-insensitive substring match
  category?: ArmorCategory; // Exact match
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface GearQuery {
  name?: string; // Case-insensitive substring match
  type?: string; // Exact match: 'gears' | 'consumable'
  source?: string; // Exact match on source field
  sortBy?: 'name' | 'type';
  sortOrder?: 'asc' | 'desc';
}
