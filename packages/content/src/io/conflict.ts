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

/**
 * Pre-check: detect conflicts between a source pack and target pack
 * WITHOUT performing the actual import.
 *
 * Phase 1: only checks `spells` array.
 */
export function checkImportConflicts(
  sourcePack: ContentPack,
  targetPack: EditableContentPack,
): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];
  const contentType: ContentTypeId = 'spells';

  const sourceSpells = sourcePack.spells || [];
  const targetSpells = targetPack.spells || [];

  for (const sourceSpell of sourceSpells) {
    // Check for same-id conflict
    const sameIdTarget = targetSpells.find((s) => s.id === sourceSpell.id);
    if (sameIdTarget) {
      conflicts.push({
        type: 'same-id',
        contentType,
        existingId: sameIdTarget.id,
        existingName: sameIdTarget.name,
        incomingId: sourceSpell.id,
        incomingName: sourceSpell.name,
      });
      continue; // same-id takes priority; skip same-name check
    }

    // Check for same-name-different-id conflict
    const sameNameTarget = targetSpells.find((s) => s.name === sourceSpell.name);
    if (sameNameTarget) {
      conflicts.push({
        type: 'same-name-different-id',
        contentType,
        existingId: sameNameTarget.id,
        existingName: sameNameTarget.name,
        incomingId: sourceSpell.id,
        incomingName: sourceSpell.name,
      });
    }
  }

  return conflicts;
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

  const sourceSpells = sourcePack.spells || [];
  if (!targetPack.spells) {
    targetPack.spells = [];
  }

  for (const sourceSpell of sourceSpells) {
    const key = `spells:${sourceSpell.id}`;
    const resolution = resolutions.get(key);

    if (!resolution) {
      // No conflict — import as new
      targetPack.spells.push({ ...sourceSpell });
      imported++;
      continue;
    }

    switch (resolution.strategy) {
      case 'keep-both': {
        const newSpell = { ...sourceSpell, id: resolution.newId };
        targetPack.spells.push(newSpell);
        imported++;
        break;
      }
      case 'replace': {
        const index = targetPack.spells.findIndex((s) => s.id === resolution.targetId);
        if (index !== -1) {
          targetPack.spells[index] = { ...sourceSpell };
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

  return { imported, skipped, replaced, conflicts };
}
