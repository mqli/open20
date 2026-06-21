import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { ContentTypeId } from '../types/registry';

export type ConflictType = 'same-id' | 'same-name-different-id';

export interface ConflictEntry {
  type: ConflictType;
  contentType: ContentTypeId;
  existingId: string;
  existingName: string;
  incomingId: string;
  incomingName: string;
}

export type ConflictResolution =
  | { strategy: 'keep-both'; newId: string }
  | { strategy: 'replace'; targetId: string }
  | { strategy: 'skip' };

export interface ImportResult {
  imported: number;
  skipped: number;
  replaced: number;
  conflicts: ConflictEntry[];
}

interface Identifiable {
  id: string;
  name?: string;
}

/**
 * Detect conflicts for a single content type array.
 */
function detectTypeConflicts(
  sourceItems: Identifiable[],
  targetItems: Identifiable[],
  contentType: ContentTypeId,
): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];

  for (const source of sourceItems) {
    const sameIdTarget = targetItems.find((t) => t.id === source.id);
    if (sameIdTarget) {
      conflicts.push({
        type: 'same-id',
        contentType,
        existingId: sameIdTarget.id,
        existingName: sameIdTarget.name || sameIdTarget.id,
        incomingId: source.id,
        incomingName: source.name || source.id,
      });
      continue;
    }

    const sourceName = source.name || source.id;
    const sameNameTarget = targetItems.find((t) => (t.name || t.id) === sourceName);
    if (sameNameTarget) {
      conflicts.push({
        type: 'same-name-different-id',
        contentType,
        existingId: sameNameTarget.id,
        existingName: sameNameTarget.name || sameNameTarget.id,
        incomingId: source.id,
        incomingName: sourceName,
      });
    }
  }

  return conflicts;
}

/**
 * Pre-check: detect conflicts between a source pack and target pack
 * WITHOUT performing the actual import.
 *
 * Checks spells and monsters arrays for id/name conflicts.
 */
export function checkImportConflicts(
  sourcePack: ContentPack,
  targetPack: EditableContentPack,
): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];

  // Spells
  const sourceSpells = (sourcePack.spells || []) as Identifiable[];
  const targetSpells = (targetPack.spells || []) as Identifiable[];
  conflicts.push(...detectTypeConflicts(sourceSpells, targetSpells, 'spells'));

  // Monsters
  const sourceMonsters = (sourcePack.monsters || []) as Identifiable[];
  const targetMonsters = (targetPack.monsters || []) as Identifiable[];
  conflicts.push(...detectTypeConflicts(sourceMonsters, targetMonsters, 'monsters'));

  // Species
  const sourceSpecies = (sourcePack.species || []) as Identifiable[];
  const targetSpecies = (targetPack.species || []) as Identifiable[];
  conflicts.push(...detectTypeConflicts(sourceSpecies, targetSpecies, 'species'));

  // Backgrounds
  const sourceBackgrounds = (sourcePack.backgrounds || []) as Identifiable[];
  const targetBackgrounds = (targetPack.backgrounds || []) as Identifiable[];
  conflicts.push(...detectTypeConflicts(sourceBackgrounds, targetBackgrounds, 'backgrounds'));

  // Feats
  const sourceFeats = (sourcePack.feats || []) as Identifiable[];
  const targetFeats = (targetPack.feats || []) as Identifiable[];
  conflicts.push(...detectTypeConflicts(sourceFeats, targetFeats, 'feats'));

  return conflicts;
}

/**
 * Resolve content import for a single type array.
 */
function resolveTypeImport(
  sourceItems: Identifiable[],
  targetArray: Identifiable[],
  contentType: string,
  resolutions: Map<string, ConflictResolution>,
): { imported: number; skipped: number; replaced: number } {
  let imported = 0;
  let skipped = 0;
  let replaced = 0;

  for (const source of sourceItems) {
    const key = `${contentType}:${source.id}`;
    const resolution = resolutions.get(key);

    if (!resolution) {
      targetArray.push({ ...source });
      imported++;
      continue;
    }

    switch (resolution.strategy) {
      case 'keep-both': {
        targetArray.push({ ...source, id: resolution.newId });
        imported++;
        break;
      }
      case 'replace': {
        const index = targetArray.findIndex((t) => t.id === resolution.targetId);
        if (index !== -1) {
          targetArray[index] = { ...source };
          replaced++;
        }
        break;
      }
      case 'skip': {
        skipped++;
        break;
      }
    }
  }

  return { imported, skipped, replaced };
}

/**
 * Execute import with resolution strategies.
 * resolutions key format: `${contentType}:${incomingId}`
 */
export function importWithResolutions(
  sourcePack: ContentPack,
  targetPack: EditableContentPack,
  resolutions: Map<string, ConflictResolution>,
): ImportResult {
  const conflicts = checkImportConflicts(sourcePack, targetPack);
  let imported = 0;
  let skipped = 0;
  let replaced = 0;

  // Spells
  const sourceSpells = (sourcePack.spells || []) as Identifiable[];
  if (!targetPack.spells) targetPack.spells = [];
  const targetSpells = targetPack.spells as unknown as Identifiable[];
  const spellResult = resolveTypeImport(sourceSpells, targetSpells, 'spells', resolutions);
  imported += spellResult.imported;
  skipped += spellResult.skipped;
  replaced += spellResult.replaced;

  // Monsters
  const sourceMonsters = (sourcePack.monsters || []) as Identifiable[];
  if (!targetPack.monsters) targetPack.monsters = [];
  const targetMonsters = targetPack.monsters as unknown as Identifiable[];
  const monsterResult = resolveTypeImport(sourceMonsters, targetMonsters, 'monsters', resolutions);
  imported += monsterResult.imported;
  skipped += monsterResult.skipped;
  replaced += monsterResult.replaced;

  // Species
  const sourceSpecies = (sourcePack.species || []) as Identifiable[];
  if (!targetPack.species) targetPack.species = [];
  const targetSpecies = targetPack.species as unknown as Identifiable[];
  const speciesResult = resolveTypeImport(sourceSpecies, targetSpecies, 'species', resolutions);
  imported += speciesResult.imported;
  skipped += speciesResult.skipped;
  replaced += speciesResult.replaced;

  // Backgrounds
  const sourceBackgrounds = (sourcePack.backgrounds || []) as Identifiable[];
  if (!targetPack.backgrounds) targetPack.backgrounds = [];
  const targetBackgrounds = targetPack.backgrounds as unknown as Identifiable[];
  const backgroundResult = resolveTypeImport(
    sourceBackgrounds,
    targetBackgrounds,
    'backgrounds',
    resolutions,
  );
  imported += backgroundResult.imported;
  skipped += backgroundResult.skipped;
  replaced += backgroundResult.replaced;

  // Feats
  const sourceFeats = (sourcePack.feats || []) as Identifiable[];
  if (!targetPack.feats) targetPack.feats = [];
  const targetFeats = targetPack.feats as unknown as Identifiable[];
  const featResult = resolveTypeImport(sourceFeats, targetFeats, 'feats', resolutions);
  imported += featResult.imported;
  skipped += featResult.skipped;
  replaced += featResult.replaced;

  return { imported, skipped, replaced, conflicts };
}
