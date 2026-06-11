// character/utils.ts
// Shared pure helpers used by create.ts, recompute.ts, level-up.ts.
// Breaking circular dependencies between character/ modules.

import type { Feature, Class, Subclass } from '@/types/class';
import type { RecomputeDerivedStatsDeps } from '@/types/deps';

// ── Re-exports from engine (single source of truth) ──────────────
export { getMaxSpellLevel, getAlwaysPreparedSpellsFromSubclass } from '../engine/spell-data';

// ── Feature Helpers ──────────────────────────────────

/** Extract features at a specific level from a class or subclass definition. */
export function getFeaturesAtLevel(classData: Class | Subclass, level: number): readonly Feature[] {
  const entry = classData.featuresByLevel.find((f) => f.level === level);
  return entry?.features ?? [];
}

// ── Feature Gathering ──────────────────────────────────

/** Gather all features across all classes and subclasses. */
export function gatherAllFeatures(
  classes: readonly import('../types/character').CharacterClass[],
  deps: RecomputeDerivedStatsDeps,
): Feature[] {
  const features: Feature[] = [];
  for (const charClass of classes) {
    const classData = deps.classes?.[charClass.classId];
    if (!classData) continue;

    for (let lv = 1; lv <= charClass.level; lv++) {
      features.push(...getFeaturesAtLevel(classData, lv));
    }

    if (charClass.subclassId) {
      const subclass = deps.subclasses?.[charClass.subclassId];
      if (subclass) {
        for (const entry of subclass.featuresByLevel) {
          if (entry.level <= charClass.level) {
            features.push(...entry.features);
          }
        }
      }
    }
  }
  return features;
}
