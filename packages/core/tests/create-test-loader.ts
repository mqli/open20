import type { RecomputeDerivedStatsDeps } from '../src/types/deps';
import { mockContentPack } from './fixtures/mock-content-pack';

/**
 * Creates a RecomputeDerivedStatsDeps with mock data for testing.
 * Use this in tests instead of the old DataLoader.
 *
 * @param speciesId - Which species the character will use (default: 'Human')
 * @param backgroundId - Which background the character will use (default: 'Soldier')
 */
export function createTestLoader(
  speciesId: string = 'Human',
  backgroundId: string = 'soldier',
): RecomputeDerivedStatsDeps {
  // Convert arrays to maps (with null checks for optional arrays)
  const speciesMap = Object.fromEntries((mockContentPack.species ?? []).map((s) => [s.id, s]));

  const backgroundMap = Object.fromEntries(
    (mockContentPack.backgrounds ?? []).map((b) => [b.id, b]),
  );

  const classMap = Object.fromEntries((mockContentPack.classes ?? []).map((c) => [c.id, c]));

  const subclassMap = Object.fromEntries((mockContentPack.subclasses ?? []).map((s) => [s.id, s]));

  const featMap = Object.fromEntries((mockContentPack.feats ?? []).map((f) => [f.id, f]));

  const spellMap = Object.fromEntries((mockContentPack.spells ?? []).map((s) => [s.id, s]));

  const weaponMap = Object.fromEntries((mockContentPack.weapons ?? []).map((w) => [w.id, w]));

  const armorMap = Object.fromEntries((mockContentPack.armors ?? []).map((a) => [a.id, a]));

  const gearMap = Object.fromEntries((mockContentPack.gears ?? []).map((g) => [g.id, g]));

  return {
    classes: classMap,
    species: speciesMap[speciesId] ?? undefined,
    background: backgroundMap[backgroundId] ?? undefined,
    subclasses: subclassMap,
    feats: featMap,
    spells: spellMap,
    weapons: weaponMap,
    armors: armorMap,
    gears: gearMap,
  };
}
