// glossary/index.ts

export type { GlossaryFilter } from './query';
export {
  getGlossaryEntry,
  resolveGlossaryTerm,
  getGlossaryEntryByName,
  searchGlossaryEntries,
  getGlossaryEntriesByTag,
  getAllGlossaryEntries,
  getRulesGlossary,
  getGlossaryAbbreviation,
  getGlossaryAbbreviations,
} from './query';
