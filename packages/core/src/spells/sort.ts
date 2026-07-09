// src/spells/sort.ts
// Shared spell sorting — single source of truth for spell order across all packages.
// Default: level ascending, then name alphabetical (D&D 5e standard).

import type { Spell } from '../types';

export type SpellSortField = 'name' | 'level' | 'school';
export type SortOrder = 'asc' | 'desc';

export interface SortSpellsOptions {
  sortBy?: SpellSortField;
  sortOrder?: SortOrder;
}

/**
 * Sort spells deterministically.
 *
 * Default (no options): level ascending, then name alphabetical.
 * This matches the official D&D 5e spell list ordering.
 *
 * When `sortBy` is provided, the primary key direction follows `sortOrder`
 * (default `'asc'`), and tiebreakers use fixed ascending order:
 *   level  -> name
 *   name   -> level
 *   school -> level -> name
 *
 * Returns a new array; does not mutate the input.
 */
export function sortSpells(spells: Spell[], options: SortSpellsOptions = {}): Spell[] {
  const { sortBy, sortOrder = 'asc' } = options;
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return [...spells].sort((a, b) => {
    switch (sortBy) {
      case 'level':
        return multiplier * (a.level - b.level) || a.name.localeCompare(b.name);
      case 'name':
        return multiplier * a.name.localeCompare(b.name) || a.level - b.level;
      case 'school':
        return (
          multiplier * a.school.localeCompare(b.school) ||
          a.level - b.level ||
          a.name.localeCompare(b.name)
        );
      default:
        // D&D standard: level ascending, then name alphabetical
        return multiplier * (a.level - b.level) || a.name.localeCompare(b.name);
    }
  });
}
