import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import { ContentValidator } from '../validator/content-validator';

/**
 * Deserialize JSON string to ContentPack (core type).
 * Validates the outer structure (meta required, content arrays).
 */
export function parsePackJson(json: string): ContentPack {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    const err = new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    (err as unknown as Error & { cause?: unknown }).cause = e;
    throw err;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid ContentPack: must be an object');
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.meta || typeof obj.meta !== 'object') {
    throw new Error('Invalid ContentPack: missing or invalid meta field');
  }

  const meta = obj.meta as Record<string, unknown>;
  if (typeof meta.id !== 'string' || meta.id === '') {
    throw new Error('Invalid ContentPack: meta.id is required and must be a non-empty string');
  }

  return parsed as ContentPack;
}

/**
 * Import from a JSON string. Validates spells and monsters against their schemas.
 * Returns a new EditableContentPack (NOT persisted yet).
 * Throws on invalid content.
 */
export function importPack(json: string): EditableContentPack {
  const pack = parsePackJson(json);
  const validator = new ContentValidator();

  // Validate spells if present
  if (pack.spells) {
    for (const spell of pack.spells) {
      const result = validator.validateSpell(spell);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid spell "${spell.name || spell.id}": ${errors}`);
      }
    }
  }

  // Validate monsters if present
  if (pack.monsters) {
    for (const monster of pack.monsters) {
      const result = validator.validateMonster(monster);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid monster "${monster.name || monster.id}": ${errors}`);
      }
    }
  }

  // Validate species if present
  if (pack.species) {
    for (const species of pack.species) {
      const result = validator.validateSpecies(species);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid species "${species.id}": ${errors}`);
      }
    }
  }

  // Validate backgrounds if present
  if (pack.backgrounds) {
    for (const background of pack.backgrounds) {
      const result = validator.validateBackground(background);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid background "${background.name || background.id}": ${errors}`);
      }
    }
  }

  // Validate feats if present
  if (pack.feats) {
    for (const feat of pack.feats) {
      const result = validator.validateFeat(feat);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid feat "${feat.name || feat.id}": ${errors}`);
      }
    }
  }

  return pack as EditableContentPack;
}

/**
 * Merge source content pack into target pack.
 * Core content arrays are concatenated. Does NOT deduplicate.
 * Caller must use conflict-check functions first.
 */
export function mergePack(target: EditableContentPack, source: ContentPack): void {
  const contentTypes: (keyof ContentPack)[] = [
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
  ];

  const targetRecord = target as unknown as Record<string, unknown[] | undefined>;
  for (const key of contentTypes) {
    const sourceArray = source[key] as unknown[] | undefined;
    if (sourceArray && sourceArray.length > 0) {
      const targetArray = targetRecord[key] || [];
      targetRecord[key] = [...targetArray, ...sourceArray];
    }
  }

  // glossary is not an array — special case
  if (source.glossary && !target.glossary) {
    target.glossary = source.glossary;
  }
}

/** Alias for importPack. */
export const importPackFromJson: typeof importPack = importPack;
