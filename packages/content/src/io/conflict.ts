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
  name: string;
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
        existingName: sameIdTarget.name,
        incomingId: source.id,
        incomingName: source.name,
      });
      continue;
    }

    const sameNameTarget = targetItems.find((t) => t.name === source.name);
    if (sameNameTarget) {
      conflicts.push({
        type: 'same-name-different-id',
        contentType,
        existingId: sameNameTarget.id,
        existingName: sameNameTarget.name,
        incomingId: source.id,
        incomingName: source.name,
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

  return { imported, skipped, replaced, conflicts };
}
