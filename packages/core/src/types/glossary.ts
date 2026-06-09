// types/glossary.ts
// Rules Glossary types (SRD 5.2 "Rules Glossary" section)
//
// Supports:
// - ~156 rule definition entries (#### headings in srd-5.2-glossary.md)
// - Bracket tags (Action, Area of Effect, Attitude, Condition, Hazard)
// - Subsections (e.g. **_Can't See._** blocks)
// - Embedded data tables (Object AC, Damage Types, etc.)
// - See-also cross-references (glossary entries and external document sections)
// - Abbreviations table (AC, DC, HP, etc.)

import type { ConditionName } from './conditions';

// ── Entry families (bracket tags) ─────────────────────────

/** Tag shown in brackets after some entry names, e.g. "Attack [Action]". */
export type GlossaryEntryTag = 'Action' | 'Area of Effect' | 'Attitude' | 'Condition' | 'Hazard';

export const GLOSSARY_ENTRY_TAGS: readonly GlossaryEntryTag[] = [
  'Action',
  'Area of Effect',
  'Attitude',
  'Condition',
  'Hazard',
] as const;

// ── Cross-references ──────────────────────────────────────

/** Reference to another glossary entry or an external rules document section. */
export type GlossaryReference =
  | {
      readonly type: 'entry';
      /** Target glossary entry id (kebab-case slug). */
      readonly id: string;
    }
  | {
      readonly type: 'document';
      /** Document title, e.g. "Playing the Game", "Equipment". */
      readonly document: string;
      /** Optional section names within the document, e.g. ["D20 Tests", "Proficiency"]. */
      readonly sections?: readonly string[];
    };

// ── Structured content blocks ─────────────────────────────

/** Named subsection within an entry (italic-bold headers in the SRD). */
export interface GlossarySubsection {
  readonly title: string;
  readonly content: readonly string[];
}

/** Data table embedded in an entry definition. */
export interface GlossaryTable {
  /** Optional table caption, e.g. "Object Armor Class", "Damage Types". */
  readonly title?: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** Row in the glossary-wide abbreviations table. */
export interface GlossaryAbbreviation {
  readonly abbr: string;
  readonly expansion: string;
}

// ── Entry & glossary document ─────────────────────────────

/**
 * A single rules glossary term.
 *
 * `id` is kebab-case derived from `name` (e.g. "ability-check", "attack-roll").
 * `name` is the display title without the bracket tag (e.g. "Attack", not "Attack [Action]").
 */
export interface GlossaryEntry {
  readonly id: string;
  readonly source: string;
  readonly name: string;
  readonly tag?: GlossaryEntryTag;

  /** Main definition paragraphs (excluding subsection bodies). */
  readonly content: readonly string[];

  readonly subsections?: readonly GlossarySubsection[];
  readonly tables?: readonly GlossaryTable[];
  readonly seeAlso?: readonly GlossaryReference[];

  /**
   * Other glossary entry ids listed in index grids within this entry
   * (e.g. actions listed under "Action", conditions under "Condition").
   */
  readonly relatedEntryIds?: readonly string[];

  /**
   * Alternate names for lookup (e.g. "AC" → "armor-class").
   * Populated from abbreviations and common shorthand.
   */
  readonly aliases?: readonly string[];

  /**
   * When `tag` is "Condition", links to the engine's ConditionName
   * for integration with combat/character state.
   */
  readonly condition?: ConditionName;
}

/**
 * Complete Rules Glossary document for a content source.
 * Stored as `glossary.json` in content packs.
 */
export interface RulesGlossary {
  readonly source: string;
  readonly abbreviations: readonly GlossaryAbbreviation[];
  readonly entries: readonly GlossaryEntry[];
}
