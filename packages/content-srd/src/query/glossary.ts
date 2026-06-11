// query/glossary.ts
// Glossary lookup helpers.
// All functions take a ContentPack (the merged pack), NOT DataLoader.

import type { ContentPack } from 'open20-core/content';
import type {
  GlossaryEntry,
  GlossaryEntryTag,
  GlossaryAbbreviation,
  RulesGlossary,
} from 'open20-core';

/** Get the full RulesGlossary object from a pack. */
export function getRulesGlossary(pack: ContentPack): RulesGlossary | undefined {
  return pack.glossary;
}

/** Get all glossary entries from a pack (readonly). */
export function getAllGlossaryEntries(pack: ContentPack): readonly GlossaryEntry[] {
  return pack.glossary?.entries ?? [];
}

/** Find a glossary entry by ID. */
export function getGlossaryEntry(id: string, pack: ContentPack): GlossaryEntry | undefined {
  return pack.glossary?.entries.find((e) => e.id === id);
}

/** Find a glossary entry by name (case-insensitive). */
export function getGlossaryEntryByName(name: string, pack: ContentPack): GlossaryEntry | undefined {
  const lower = name.toLowerCase();
  return pack.glossary?.entries.find((e) => e.name.toLowerCase() === lower);
}

/**
 * Resolve a glossary term by trying:
 *   1. Exact ID match
 *   2. Exact name match (case-insensitive)
 *   3. Partial name match (case-insensitive, includes)
 */
export function resolveGlossaryTerm(term: string, pack: ContentPack): GlossaryEntry | undefined {
  // Try exact ID match
  const byId = getGlossaryEntry(term, pack);
  if (byId) return byId;

  // Try exact name match
  const byName = getGlossaryEntryByName(term, pack);
  if (byName) return byName;

  // Try partial match
  const lower = term.toLowerCase();
  return pack.glossary?.entries.find(
    (e: GlossaryEntry) =>
      e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase()),
  );
}

/** Search glossary entries by name (partial match). */
export function searchGlossaryEntries(term: string, pack: ContentPack): GlossaryEntry[] {
  const lower = term.toLowerCase();
  return (
    pack.glossary?.entries.filter((e: GlossaryEntry) => e.name.toLowerCase().includes(lower)) ?? []
  );
}

/** Get all glossary entries matching a tag. */
export function getGlossaryEntriesByTag(tag: GlossaryEntryTag, pack: ContentPack): GlossaryEntry[] {
  return pack.glossary?.entries.filter((e: GlossaryEntry) => e.tag === tag) ?? [];
}

/** Get all glossary abbreviations (readonly). */
export function getGlossaryAbbreviations(pack: ContentPack): readonly GlossaryAbbreviation[] {
  return pack.glossary?.abbreviations ?? [];
}

/** Find a glossary abbreviation by abbreviation string. */
export function getGlossaryAbbreviation(
  abbr: string,
  pack: ContentPack,
): GlossaryAbbreviation | undefined {
  return pack.glossary?.abbreviations.find((a: GlossaryAbbreviation) => a.abbr === abbr);
}
