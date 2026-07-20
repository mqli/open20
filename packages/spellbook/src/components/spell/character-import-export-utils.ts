import type { Character, ContentPack } from 'open20-core';
import { detectImportFormat } from '@open20/content/io';
import { ContentValidator } from '@open20/content/validator';
import type { AppCharacter } from '@/core/types';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { useCustomClassStore } from '@/stores/customClassStore';
import type {
  CharacterBundle,
  CharacterBundleMeta,
  CharacterBundleParseResult,
} from './character-import-export-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract all spell IDs referenced by a character (known cantrips, known spells,
 * prepared spells, and feat spell entries).
 */
function collectCharacterSpellIds(character: Character): string[] {
  const ids = new Set<string>();

  // Class spellcasting entries
  for (const data of Object.values(character.spells.classSpellcasting ?? {})) {
    data.knownCantrips?.forEach((id) => ids.add(id));
    data.knownSpells?.forEach((id) => ids.add(id));
    data.preparedSpells?.forEach((id) => ids.add(id));
  }

  // Feat spell entries (e.g. Magic Initiate)
  for (const entry of Object.values(character.spells.featSpells ?? {})) {
    entry.cantrips?.forEach((id) => ids.add(id));
    entry.preparedSpells?.forEach((id) => ids.add(id));
  }

  return Array.from(ids);
}

/**
 * Collect all subclass IDs referenced by the character's classes.
 */
function collectCharacterSubclassIds(character: Character): string[] {
  return character.classes.map((c) => c.subclassId).filter((id): id is string => id !== null);
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** App version stored in package.json — kept as a constant for bundler compat. */
const APP_VERSION = '0.0.0';

/**
 * Export the active character and its referenced custom content (spells + subclasses)
 * as a CharacterBundle JSON file download.
 */
export function exportCharacter(character: AppCharacter): void {
  // 1. Find custom spells referenced by the character
  const spellIds = new Set(collectCharacterSpellIds(character));
  const customSpells = useCustomSpellStore.getState().spells.filter((s) => spellIds.has(s.id));

  // 2. Find custom subclasses referenced by the character
  const subclassIds = new Set(collectCharacterSubclassIds(character));
  const classStore = useCustomClassStore.getState();

  // Custom classes (which include their subclasses)
  const customClassEntries: typeof classStore.classes = [];
  // Standalone subclasses (on SRD parent classes)
  const standaloneSubclasses = classStore.standaloneSubclasses.filter((s) => subclassIds.has(s.id));

  for (const entry of classStore.classes) {
    const matchingSubclasses = entry.subclasses.filter((s) => subclassIds.has(s.id));
    if (matchingSubclasses.length > 0) {
      customClassEntries.push({ ...entry, subclasses: matchingSubclasses });
    }
  }

  // 3. Build the ContentPack
  const contentPack: ContentPack = {
    meta: {
      id: `character-export-${character.id}`,
      name: `Custom Content for ${character.name}`,
      version: '1.0.0',
      source: 'open20-spellbook',
      priority: 0,
    },
  };

  if (customSpells.length > 0) {
    contentPack.spells = customSpells;
  }
  if (customClassEntries.length > 0 || standaloneSubclasses.length > 0) {
    contentPack.classes = customClassEntries.map((e) => e.class);
    contentPack.subclasses = [
      ...customClassEntries.flatMap((e) => e.subclasses),
      ...standaloneSubclasses,
    ];
  }

  // 4. Build the CharacterBundle (strip AppCharacter.id)
  const { id: _id, ...characterData } = character;
  const meta: CharacterBundleMeta = {
    exportedFrom: 'open20-spellbook',
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
  };

  const bundle: CharacterBundle = {
    schemaVersion: '1.0.0',
    character: characterData as Character,
    content: contentPack,
    meta,
  };

  // 5. Download as JSON
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `open20-character-${character.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Parse & Validate
// ---------------------------------------------------------------------------

/**
 * Parse and validate a JSON string as a potential CharacterBundle import.
 *
 * Detection order:
 * 1. CharacterBundle: has `schemaVersion` + `character` + `content` + `meta`
 * 2. ContentPack / Spell[]: fall through for existing spell import dialog
 * 3. Invalid JSON / unrecognized format
 */
export function parseAndValidateCharacterBundle(json: string): CharacterBundleParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { type: 'error', errors: ['Invalid JSON file.'] };
  }

  // Check for CharacterBundle format
  if (isCharacterBundle(parsed)) {
    const bundle = parsed as CharacterBundle;
    const warnings: string[] = [];

    // Validate spells in the content pack
    const errors: string[] = [];
    if (bundle.content.spells && bundle.content.spells.length > 0) {
      const validator = new ContentValidator();
      for (let i = 0; i < bundle.content.spells.length; i++) {
        const spell = bundle.content.spells[i];
        const result = validator.validateSpell(spell);
        if (!result.valid) {
          const msgs = result.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
          errors.push(`Spell "${String(spell.name || spell.id)}": ${msgs}`);
        }
      }
    }

    if (errors.length > 0) {
      return { type: 'error', errors };
    }

    return { type: 'character-bundle', bundle, warnings };
  }

  // Not a CharacterBundle — try detecting as spells or content pack
  try {
    const detectResult = detectImportFormat(json);
    if (detectResult.format === 'full-pack') {
      return {
        type: 'spells-or-pack',
        message: 'This appears to be a content pack. Use "Import Custom Spells" instead.',
      };
    }
    if (detectResult.format === 'single-type' && detectResult.detectedType === 'spells') {
      return {
        type: 'spells-or-pack',
        message: 'This appears to be a spell list. Use "Import Custom Spells" instead.',
      };
    }
  } catch {
    // Detection failed, continue to error
  }

  return {
    type: 'error',
    errors: ['Unrecognized file format. Expected a character export file.'],
  };
}

/**
 * Type guard: checks if a parsed JSON object matches the CharacterBundle shape.
 */
function isCharacterBundle(obj: unknown): obj is CharacterBundle {
  if (!obj || typeof obj !== 'object') return false;

  const bundle = obj as Record<string, unknown>;

  return (
    typeof bundle.schemaVersion === 'string' &&
    bundle.character != null &&
    typeof bundle.character === 'object' &&
    bundle.content != null &&
    typeof bundle.content === 'object' &&
    bundle.meta != null &&
    typeof bundle.meta === 'object' &&
    (bundle.meta as Record<string, unknown>).exportedFrom === 'open20-spellbook'
  );
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export interface CharacterImportResult {
  characterId: string;
  characterName: string;
  importedSpells: number;
  skippedSpells: number;
  importedSubclasses: number;
  errors: string[];
}

/**
 * Import a validated CharacterBundle into the application stores.
 *
 * Steps:
 * 1. Import spells via customSpellStore.importSpells() (dedup by ID)
 * 2. Import custom classes/subclasses via customClassStore
 * 3. Reinitialize content to rebuild merged pack
 * 4. Generate a new ID for the character
 * 5. Create the character and set as active
 */
export async function importCharacterBundle(
  bundle: CharacterBundle,
): Promise<CharacterImportResult> {
  const errors: string[] = [];
  let importedSpells = 0;
  let skippedSpells = 0;
  let importedSubclasses = 0;

  // 1. Import spells
  if (bundle.content.spells && bundle.content.spells.length > 0) {
    const result = useCustomSpellStore.getState().importSpells(bundle.content.spells);
    importedSpells = result.imported;
    skippedSpells = result.skipped;
  }

  // 2. Import custom classes and subclasses
  const classStore = useCustomClassStore.getState();

  if (bundle.content.classes && bundle.content.classes.length > 0) {
    const existingEntries = classStore.classes;

    for (const customClass of bundle.content.classes) {
      // Find matching subclasses for this class in the bundle
      const bundleSubclasses =
        bundle.content.subclasses?.filter((s) => s.parentClass === customClass.id) ?? [];

      const existing = existingEntries.find((e) => e.class.id === customClass.id);
      if (existing) {
        // Merge subclasses
        for (const sub of bundleSubclasses) {
          if (!existing.subclasses.some((s) => s.id === sub.id)) {
            existing.subclasses = [...existing.subclasses, sub];
            importedSubclasses++;
          }
        }
        classStore.saveClass(existing);
      } else {
        classStore.saveClass({ class: customClass, subclasses: bundleSubclasses });
        importedSubclasses += bundleSubclasses.length;
      }
    }
  }

  // Handle standalone subclasses (on SRD parent classes)
  if (bundle.content.subclasses) {
    const existingStandalone = classStore.standaloneSubclasses;
    const existingClassEntries = classStore.classes;

    for (const sub of bundle.content.subclasses) {
      // Skip if this subclass is already part of a custom class entry
      const belongsToCustomClass = existingClassEntries.some((e) =>
        e.subclasses.some((s) => s.id === sub.id),
      );
      if (belongsToCustomClass) continue;

      // Check if it's a standalone subclass (parent is an SRD class)
      const existsStandalone = existingStandalone.some((s) => s.id === sub.id);
      if (!existsStandalone) {
        classStore.addStandaloneSubclass(sub.parentClass, sub);
        importedSubclasses++;
      }
    }
  }

  // 3. Reinitialize content to rebuild merged pack
  const { reinitContent } = await import('@/core/content-resolver');
  await reinitContent();

  // 4. Import character
  const { useCharacterStore } = await import('@/stores/characterStore');
  const { characterService } = await import('@/core/character-service');

  // Generate a new ID (use crypto-based UUID)
  const newId = crypto.randomUUID();
  const newCharacter: AppCharacter = {
    ...bundle.character,
    id: newId,
    updatedAt: new Date().toISOString(),
    // Keep original createdAt if it exists
    createdAt: bundle.character.createdAt || new Date().toISOString(),
  };

  // Recompute derived stats with the newly merged content pack
  let recomputed: AppCharacter;
  try {
    recomputed = characterService.recompute(newCharacter);
  } catch (e) {
    errors.push(`Character recompute failed: ${e instanceof Error ? e.message : String(e)}`);
    // Use the character as-is if recompute fails
    recomputed = newCharacter;
  }

  // Save and set as active
  const charStoreState = useCharacterStore.getState();
  useCharacterStore.setState({
    characters: [...charStoreState.characters, recomputed],
    activeCharacter: recomputed,
  });
  localStorage.setItem('spellbook-active-character', recomputed.id);

  // Persist
  const { storageService } = await import('@/core/storage-service');
  storageService.saveCharacter(recomputed);

  return {
    characterId: newId,
    characterName: bundle.character.name,
    importedSpells,
    skippedSpells,
    importedSubclasses,
    errors,
  };
}
