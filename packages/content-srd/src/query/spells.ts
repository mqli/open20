// query/spells.ts
// Spell lookup helpers.
// All functions take a ContentPack (the merged pack), NOT DataLoader.

import type { ContentPack } from 'open20-core/content';
import type { Spell, SpellFilter } from 'open20-core';

/** Find a spell by ID. */
export function findSpell(id: string, pack: ContentPack): Spell | undefined {
  return pack.spells?.find((s) => s.id === id);
}

/**
 * Search spells matching a filter.
 * Filter fields are ALL optional; omitted fields are not filtered.
 */
export function searchSpells(filter: SpellFilter, pack: ContentPack): Spell[] {
  const spells = pack.spells ?? [];
  return spells.filter((s) => {
    if (filter.name) {
      if (!s.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
    }
    if (filter.level && filter.level.length > 0) {
      if (!filter.level.includes(s.level)) return false;
    }
    if (filter.school && filter.school.length > 0) {
      if (!filter.school.includes(s.school)) return false;
    }
    if (filter.class && filter.class.length > 0) {
      if (!s.classes?.some((c: string) => filter.class!.includes(c))) return false;
    }
    if (filter.source && filter.source.length > 0) {
      if (!filter.source.includes(s.source)) return false;
    }
    if (filter.concentration !== undefined) {
      if (s.concentration !== filter.concentration) return false;
    }
    if (filter.ritual !== undefined) {
      if (s.ritual !== filter.ritual) return false;
    }
    return true;
  });
}

/** Get all spells for a given class ID. */
export function getSpellsByClass(classId: string, pack: ContentPack): Spell[] {
  return pack.spells?.filter((s) => s.classes?.includes(classId)) ?? [];
}

/** Get all spells from a pack. */
export function getSpells(pack: ContentPack): Spell[] {
  return pack.spells ?? [];
}

/** Get all spells of a given level. */
export function getSpellsByLevel(level: number, pack: ContentPack): Spell[] {
  return pack.spells?.filter((s) => s.level === level) ?? [];
}

/** Get all spells matching a source tag. */
export function getSpellsBySource(source: string, pack: ContentPack): Spell[] {
  return pack.spells?.filter((s) => s.source === source) ?? [];
}
