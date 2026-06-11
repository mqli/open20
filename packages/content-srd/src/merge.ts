// merge.ts
// Merge multiple ContentPacks into a single ContentPack.
// Implements the merge semantics specified in the refactor plan.
//
// Rules:
//   - Input order = priority: later packs override earlier packs for same `id`.
//   - Optional: sort inputs by `meta.priority` (ascending) before merging so
//     higher-priority packs win. Default: use input order as-is.
//   - Array fields: concatenate all arrays, then dedup by `id` (keep last occurrence).
//   - `meta`: keep from highest-priority pack.
//   - `version`: keep from highest-priority pack.

import type { ContentPack } from 'open20-core/content';

/**
 * Merge multiple ContentPacks into a single ContentPack.
 *
 * @param packs - ContentPacks to merge. Later packs override earlier packs
 *                for entities with the same `id`.
 * @param sortByPriority - If true, sort packs by `meta.priority` (ascending)
 *                        before merging so higher-priority packs win.
 *                        Default: false (use input order as-is).
 */
export function mergeContentPacks(packs: ContentPack[], sortByPriority = false): ContentPack {
  if (packs.length === 0) {
    throw new Error('mergeContentPacks: must provide at least one ContentPack');
  }

  const sorted = sortByPriority
    ? [...packs].sort((a, b) => (a.meta.priority ?? 0) - (b.meta.priority ?? 0))
    : packs;

  // Start with the highest-priority pack's meta/version as base
  const lastPack = sorted[sorted.length - 1]!;
  const merged: ContentPack = {
    meta: { ...lastPack.meta },
    species: [],
    backgrounds: [],
    classes: [],
    subclasses: [],
    feats: [],
    spells: [],
    weapons: [],
    armors: [],
    gear: [],
    monsters: [],
    glossary: undefined,
  };

  // Gather all entity arrays then dedup
  const allSpecies: NonNullable<ContentPack['species']> = [];
  const allBackgrounds: NonNullable<ContentPack['backgrounds']> = [];
  const allClasses: NonNullable<ContentPack['classes']> = [];
  const allSubclasses: NonNullable<ContentPack['subclasses']> = [];
  const allFeats: NonNullable<ContentPack['feats']> = [];
  const allSpells: NonNullable<ContentPack['spells']> = [];
  const allWeapons: NonNullable<ContentPack['weapons']> = [];
  const allArmors: NonNullable<ContentPack['armors']> = [];
  const allGear: NonNullable<ContentPack['gear']> = [];
  const allMonsters: NonNullable<ContentPack['monsters']> = [];

  for (const pack of sorted) {
    if (pack.species) allSpecies.push(...pack.species);
    if (pack.backgrounds) allBackgrounds.push(...pack.backgrounds);
    if (pack.classes) allClasses.push(...pack.classes);
    if (pack.subclasses) allSubclasses.push(...pack.subclasses);
    if (pack.feats) allFeats.push(...pack.feats);
    if (pack.spells) allSpells.push(...pack.spells);
    if (pack.weapons) allWeapons.push(...pack.weapons);
    if (pack.armors) allArmors.push(...pack.armors);
    if (pack.gear) allGear.push(...pack.gear);
    if (pack.monsters) allMonsters.push(...pack.monsters);

    // Glossary: last pack wins (no merge)
    if (pack.glossary) {
      merged.glossary = pack.glossary;
    }
  }

  // Dedup by `id` — keep last occurrence (O(n) with map)
  merged.species = dedupById(allSpecies);
  merged.backgrounds = dedupById(allBackgrounds);
  merged.classes = dedupById(allClasses);
  merged.subclasses = dedupById(allSubclasses);
  merged.feats = dedupById(allFeats);
  merged.spells = dedupById(allSpells);
  merged.weapons = dedupById(allWeapons);
  merged.armors = dedupById(allArmors);
  merged.gear = dedupById(allGear);
  merged.monsters = dedupById(allMonsters);

  return merged;
}

/**
 * Dedup an array of objects with `id` fields.
 * Keeps the LAST occurrence of each `id` (so later packs win).
 */
function dedupById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    seen.set(item.id, item);
  }
  return Array.from(seen.values());
}
