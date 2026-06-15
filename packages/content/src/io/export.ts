import type { EditableContentPack } from '../types/content-pack';
import type { EditState } from '../types/edit-state';
import type { ContentPack, ContentPackMeta } from 'open20-core';

/**
 * Export an EditableContentPack to a clean ContentPack JSON string.
 *
 * STRIPPING RULES (critical — do NOT include in output):
 * - meta.description, meta.homepage, meta.dependencies → DELETED
 * - EditState (createdAt, updatedAt, undoStack, schemaVersion) → NOT INCLUDED
 * - Any non-core fields → DELETED
 *
 * Output must be valid input for open20-core's importContentPack().
 */
const CORE_CONTENT_KEYS: (keyof ContentPack)[] = [
  'species',
  'backgrounds',
  'classes',
  'subclasses',
  'feats',
  'spells',
  'weapons',
  'armors',
  'gears',
  'monsters',
  'glossary',
];

export function exportPack(pack: EditableContentPack, _editState?: EditState): string {
  // Strip extended meta fields — keep only core ContentPackMeta fields
  const cleanMeta: ContentPackMeta = {
    id: pack.meta.id,
    name: pack.meta.name,
    version: pack.meta.version,
    source: pack.meta.source,
    author: pack.meta.author,
    priority: pack.meta.priority,
    url: pack.meta.url,
  };

  const cleanPack: ContentPack = {
    meta: cleanMeta,
  };

  // Only include core content keys
  const cleanRecord = cleanPack as unknown as Record<string, unknown>;
  for (const key of CORE_CONTENT_KEYS) {
    if (pack[key] !== undefined) {
      cleanRecord[key] = pack[key];
    }
  }

  return JSON.stringify(cleanPack, null, 2);
}

/** Alias for exportPack — returns the same JSON string. */
export const exportPackToJson: typeof exportPack = exportPack;
