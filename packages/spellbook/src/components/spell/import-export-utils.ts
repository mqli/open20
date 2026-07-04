import type { Spell } from 'open20-core';
import { detectImportFormat } from '@open20/content/io';
import { ContentValidator } from '@open20/content/validator';

/**
 * Export custom spells as a JSON file download.
 * Produces a plain Spell[] array, compatible with content-srd's spells.json format.
 */
export function exportCustomSpells(spells: readonly Spell[]): void {
  const json = JSON.stringify(spells, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'open20-custom-spells.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate spells from a JSON string.
 *
 * Supports both formats:
 * - Plain Spell[] array (from content-srd or exportCustomSpells)
 * - ContentPack with a "meta" + "spells" field (from rulebook exports)
 *
 * Uses `detectImportFormat()` for auto-detection and
 * `ContentValidator.validateSpell()` for Zod schema validation.
 *
 * @returns Valid spells and any validation errors encountered.
 */
export function parseAndValidateSpells(json: string): {
  spells: Spell[];
  errors: string[];
} {
  // Step 1: Detect the import format
  let detectResult;
  try {
    detectResult = detectImportFormat(json);
  } catch (e) {
    return { spells: [], errors: [e instanceof Error ? e.message : String(e)] };
  }

  // Step 2: Extract raw spell data
  let rawItems: unknown[];

  if (detectResult.format === 'full-pack') {
    const pack = JSON.parse(json) as Record<string, unknown>;
    const packSpells = pack.spells;
    if (!Array.isArray(packSpells) || packSpells.length === 0) {
      return {
        spells: [],
        errors: ['The loaded content pack contains no spells.'],
      };
    }
    rawItems = packSpells;
  } else {
    // single-type
    if (detectResult.detectedType !== 'spells') {
      return {
        spells: [],
        errors: [
          `Expected spells but detected "${detectResult.detectedType}". Please select a spells JSON file.`,
        ],
      };
    }
    rawItems = JSON.parse(json) as unknown[];
  }

  // Step 3: Validate each spell
  const validator = new ContentValidator();
  const spells: Spell[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const result = validator.validateSpell(rawItems[i]);
    if (result.valid) {
      spells.push(rawItems[i] as Spell);
    } else {
      const errorMessages = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
      const name =
        (rawItems[i] as Record<string, unknown>)?.name ||
        (rawItems[i] as Record<string, unknown>)?.id;
      errors.push(
        name ? `"${String(name)}": ${errorMessages}` : `Spell #${i + 1}: ${errorMessages}`,
      );
    }
  }

  return { spells, errors };
}
