// glossary/query.ts
// Rules glossary query functions

import type { DataLoader } from '@/data/loader';
import type {
  GlossaryAbbreviation,
  GlossaryEntry,
  GlossaryEntryTag,
  RulesGlossary,
} from '@/types/glossary';

export interface GlossaryFilter {
  name?: string;
  tag?: GlossaryEntryTag;
  source?: string[];
}

/**
 * Get a glossary entry by id (kebab-case slug).
 */
export function getGlossaryEntry(id: string, data: DataLoader): GlossaryEntry | undefined {
  return data.getGlossaryEntry(id);
}

/**
 * Resolve a rules term by id, display name, or abbreviation alias.
 *
 * Lookup order:
 * 1. Exact id
 * 2. slugify(term)
 * 3. Case-insensitive name
 * 4. Alias (case-sensitive, e.g. "AC")
 */
export function resolveGlossaryTerm(term: string, data: DataLoader): GlossaryEntry | undefined {
  return data.resolveGlossaryTerm(term);
}

/**
 * Get a glossary entry by exact display name.
 */
export function getGlossaryEntryByName(name: string, data: DataLoader): GlossaryEntry | undefined {
  return data.getGlossaryEntryByName(name);
}

/**
 * Search glossary entries by optional name, tag, and source filters.
 */
export function searchGlossaryEntries(filter: GlossaryFilter, data: DataLoader): GlossaryEntry[] {
  let entries = data.getAllGlossaryEntries();

  if (filter.name) {
    const search = filter.name.toLowerCase();
    entries = entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(search) ||
        entry.id.includes(search) ||
        entry.aliases?.some((alias) => alias.toLowerCase().includes(search)),
    );
  }

  if (filter.tag) {
    entries = entries.filter((entry) => entry.tag === filter.tag);
  }

  if (filter.source?.length) {
    const sources = new Set(filter.source);
    entries = entries.filter((entry) => sources.has(entry.source));
  }

  return entries;
}

/**
 * Get glossary entries with a specific bracket tag.
 */
export function getGlossaryEntriesByTag(tag: GlossaryEntryTag, data: DataLoader): GlossaryEntry[] {
  return data.getGlossaryEntriesByTag(tag);
}

/**
 * Get all glossary entries from registered content packs.
 */
export function getAllGlossaryEntries(data: DataLoader): GlossaryEntry[] {
  return data.getAllGlossaryEntries();
}

/**
 * Get the merged rules glossary document (entries + abbreviations).
 */
export function getRulesGlossary(data: DataLoader): RulesGlossary {
  return data.getRulesGlossary();
}

/**
 * Look up a single abbreviation expansion.
 */
export function getGlossaryAbbreviation(
  abbr: string,
  data: DataLoader,
): GlossaryAbbreviation | undefined {
  return data.getGlossaryAbbreviations().find((entry) => entry.abbr === abbr);
}

/**
 * Get all abbreviations from registered content packs.
 */
export function getGlossaryAbbreviations(data: DataLoader): readonly GlossaryAbbreviation[] {
  return data.getGlossaryAbbreviations();
}
