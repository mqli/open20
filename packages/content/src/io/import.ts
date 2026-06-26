import type { ContentPack, ContentPackMeta } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { ExportableContentKey } from './export';
import { ContentValidator } from '../validator/content-validator';

// ── Format detection ────────────────────────────────────────────

/** Result of auto-detecting the import format of a JSON string. */
export type ImportDetectResult =
  | { format: 'full-pack'; packName: string; version: string }
  | { format: 'single-type'; detectedType: ExportableContentKey; itemCount: number };

/**
 * Auto-detect the import format of a JSON string.
 *
 * - If the parsed JSON is an object with a `meta` field → `'full-pack'`
 * - If the parsed JSON is an array → try to identify the content type → `'single-type'`
 * - Otherwise throws an error.
 */
export function detectImportFormat(json: string): ImportDetectResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    const err = new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    (err as unknown as Error & { cause?: unknown }).cause = e;
    throw err;
  }

  // Full-pack: object with meta field
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if (obj.meta && typeof obj.meta === 'object') {
      const meta = obj.meta as Record<string, unknown>;
      return {
        format: 'full-pack',
        packName: String(meta.name ?? 'Unknown'),
        version: String(meta.version ?? '1.0.0'),
      };
    }
    throw new Error(
      'Unknown JSON format: object without meta field. Expected a ContentPack or a content-type array.',
    );
  }

  // Single-type: plain array
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error('Cannot detect content type from an empty array. Provide at least one item.');
    }
    const firstItem = parsed[0] as Record<string, unknown>;
    const detectedType = detectContentType(firstItem);
    return {
      format: 'single-type',
      detectedType,
      itemCount: parsed.length,
    };
  }

  throw new Error('Unknown JSON format: expected an object or array.');
}

/**
 * Infer the content type from a single item by matching distinguishing fields.
 * Check priority: spells > monsters > weapons > armors > gears > feats > backgrounds > species > classes > subclasses.
 */
function detectContentType(item: Record<string, unknown>): ExportableContentKey {
  if (typeof item !== 'object' || item === null) {
    throw new Error('Cannot detect content type: item is not an object.');
  }

  // Spells: has 'school' and 'level' fields
  if ('school' in item && 'level' in item && 'castingTime' in item) {
    return 'spells';
  }

  // Monsters: has 'challengeRating' and 'hitPoints' and 'armorClass'
  if ('challengeRating' in item && 'hitPoints' in item && 'armorClass' in item) {
    return 'monsters';
  }

  // Weapons: has type="weapon" literal, 'category' (Simple/Martial), 'damage'
  if (item.type === 'weapon' && 'damage' in item) {
    return 'weapons';
  }

  // Armors: has type="armor" literal, 'ac', 'dexBonus'
  if (item.type === 'armor' && 'ac' in item) {
    return 'armors';
  }

  // Gears: has type="gears"/"consumable", 'weight'
  if ((item.type === 'gears' || item.type === 'consumable') && 'weight' in item) {
    return 'gears';
  }

  // Feats: has 'category' field (Origin/General/etc.) and 'grants'
  if ('category' in item && 'grants' in item) {
    return 'feats';
  }

  // Backgrounds: has 'skillProficiencies' and 'originFeatId'
  if ('skillProficiencies' in item && 'originFeatId' in item) {
    return 'backgrounds';
  }

  // Species: has 'abilityBonuses' and 'baseTraits'
  if ('abilityBonuses' in item && 'baseTraits' in item) {
    return 'species';
  }

  // Classes: has 'hitDie' or 'savingThrows' and 'features'
  if (('hitDie' in item || 'savingThrows' in item) && 'features' in item) {
    return 'classes';
  }

  // Subclasses: has 'classId' (last resort — least distinct)
  if ('classId' in item) {
    return 'subclasses';
  }

  throw new Error(
    `Cannot detect content type. Item has unexpected shape. Known fields: ${Object.keys(item).join(', ')}`,
  );
}

// ── Full-pack import ────────────────────────────────────────────

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

  // Validate weapons if present
  if (pack.weapons) {
    for (const weapon of pack.weapons) {
      const result = validator.validateWeapon(weapon);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid weapon "${weapon.name || weapon.id}": ${errors}`);
      }
    }
  }

  // Validate armors if present
  if (pack.armors) {
    for (const armor of pack.armors) {
      const result = validator.validateArmor(armor);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid armor "${armor.name || armor.id}": ${errors}`);
      }
    }
  }

  // Validate gears if present
  if (pack.gears) {
    for (const gear of pack.gears) {
      const result = validator.validateGear(gear);
      if (!result.valid) {
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
        throw new Error(`Invalid gear "${gear.name || gear.id}": ${errors}`);
      }
    }
  }

  return pack as EditableContentPack;
}

// ── Single-type import ──────────────────────────────────────────

/** Map of content type → ContentValidator validation method. */
type ValidateFn = (item: unknown) => {
  valid: boolean;
  errors: { path: string; message: string }[];
};

const CONTENT_VALIDATORS: Record<ExportableContentKey, ValidateFn> = {
  spells: (item) => new ContentValidator().validateSpell(item),
  monsters: (item) => new ContentValidator().validateMonster(item),
  species: (item) => new ContentValidator().validateSpecies(item),
  backgrounds: (item) => new ContentValidator().validateBackground(item),
  classes: (): { valid: boolean; errors: never[] } => ({ valid: true, errors: [] }),
  subclasses: (): { valid: boolean; errors: never[] } => ({ valid: true, errors: [] }),
  feats: (item) => new ContentValidator().validateFeat(item),
  weapons: (item) => new ContentValidator().validateWeapon(item),
  armors: (item) => new ContentValidator().validateArmor(item),
  gears: (item) => new ContentValidator().validateGear(item),
};

/**
 * Import a single content-type array from a JSON string.
 * Validates each item against the corresponding schema.
 *
 * @param json         JSON string containing a plain array (e.g. `[{...}, {...}]`).
 * @param contentType  The expected content type (from `detectImportFormat`).
 * @param meta         Optional meta override for the generated pack.
 * @returns An EditableContentPack containing only the single type + meta.
 * @throws On invalid JSON, wrong structure, or schema validation failures.
 */
export function importSingleType(
  json: string,
  contentType: ExportableContentKey,
  meta?: Partial<ContentPackMeta>,
): EditableContentPack {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    const err = new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    (err as unknown as Error & { cause?: unknown }).cause = e;
    throw err;
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected a JSON array for single-type import (${contentType}).`);
  }

  const items = parsed as unknown[];
  const validator = CONTENT_VALIDATORS[contentType];

  for (let i = 0; i < items.length; i++) {
    const result = validator(items[i]);
    if (!result.valid) {
      const errors = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
      const name =
        (items[i] as Record<string, unknown>)?.name ||
        (items[i] as Record<string, unknown>)?.id ||
        `[${i}]`;
      throw new Error(`Invalid ${contentType} "${String(name)}": ${errors}`);
    }
  }

  const defaultName = meta?.name ?? `Imported ${contentType}`;
  const packMeta: ContentPackMeta = {
    id: meta?.id ?? `imported-${contentType}-${Date.now()}`,
    name: defaultName,
    version: meta?.version ?? '1.0.0',
    source: meta?.source ?? defaultName,
    author: meta?.author,
    priority: meta?.priority ?? 100,
    url: meta?.url,
  };

  const pack: EditableContentPack = {
    meta: packMeta,
  };
  (pack as unknown as Record<string, unknown>)[contentType] = parsed;

  return pack;
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
