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
 * Output is a clean ContentPack JSON string compatible with `@open20/content` io functions.
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

// ── Per-content-type export ─────────────────────────────────────

/**
 * Content types that can be exported individually as pure arrays.
 * Each exported file is a plain JSON array (no meta wrapper),
 * matching the `content-srd/data/` layout.
 */
export const EXPORTABLE_CONTENT_KEYS = [
  'spells',
  'monsters',
  'species',
  'backgrounds',
  'classes',
  'subclasses',
  'feats',
  'weapons',
  'armors',
  'gears',
] as const;

export type ExportableContentKey = (typeof EXPORTABLE_CONTENT_KEYS)[number];

/**
 * Export a single content type as a pure JSON array string.
 *
 * @param pack      The editable content pack to export from.
 * @param contentType  Which content type to export (e.g. 'spells', 'armors').
 * @returns JSON array string — `"[]"` if the type is empty/missing.
 *
 * ### Format
 * The output is a plain JSON array — no meta wrapper — so it matches
 * the per-file layout of `packages/content-srd/data/`:
 *
 * ```json
 * [
 *   { "id": "acid-splash", "name": "Acid Splash", ... },
 *   { "id": "fireball", "name": "Fireball", ... }
 * ]
 * ```
 */
export function exportContentType(
  pack: EditableContentPack,
  contentType: ExportableContentKey,
): string {
  const items = pack[contentType] ?? [];
  return JSON.stringify(items, null, 2);
}

/**
 * Export only monsters from a pack as JSON string.
 * Returns a ContentPack with only meta + monsters.
 *
 * @deprecated Prefer `exportContentType(pack, 'monsters')` for pure-array output.
 */
export function exportMonsters(_packId: string, pack: EditableContentPack): string {
  const cleanMeta = {
    id: pack.meta.id,
    name: pack.meta.name,
    version: pack.meta.version,
    source: pack.meta.source,
    author: pack.meta.author,
    priority: pack.meta.priority,
    url: pack.meta.url,
  };

  const result: Partial<EditableContentPack> & { meta: typeof cleanMeta } = {
    meta: cleanMeta,
    monsters: pack.monsters ? [...pack.monsters] : [],
  };

  return JSON.stringify(result, null, 2);
}
