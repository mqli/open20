import type { Character } from 'open20-core';
import type { ContentPack } from 'open20-core';

/** Metadata about the export source and timing */
export interface CharacterBundleMeta {
  exportedFrom: 'open20-spellbook';
  exportedAt: string; // ISO 8601
  version: string; // app version at export time
}

/**
 * A self-contained character export that bundles the character data
 * with all custom content (spells, classes, subclasses) it references.
 *
 * The `content` field uses the standard ContentPack format,
 * making it compatible with rulebook import/editing.
 */
export interface CharacterBundle {
  /** Bundle format version for future migrations */
  schemaVersion: string;
  /** The character data (without AppCharacter.id — id is regenerated on import) */
  character: Character;
  /** Standard ContentPack containing only the custom content referenced by the character */
  content: ContentPack;
  /** Export metadata */
  meta: CharacterBundleMeta;
}

/** Result of parsing a JSON file for character import */
export type CharacterBundleParseResult =
  | { type: 'character-bundle'; bundle: CharacterBundle; warnings: string[] }
  | { type: 'spells-or-pack'; message: string }
  | { type: 'error'; errors: string[] };
