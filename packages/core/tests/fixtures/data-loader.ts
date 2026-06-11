// tests/fixtures/data-loader.ts
// Shared mock RecomputeDerivedStatsDeps factory for tests
// Eliminates ~200 lines of duplication across test files

import type { RecomputeDerivedStatsDeps } from '../../src/types/deps';
import type { Species } from '../../src/types/species';
import type { Background } from '../../src/types/background';
import type { Class, Subclass } from '../../src/types/class';
import type { Feat } from '../../src/types/feat';
import type { Weapon, Armor, GearItem } from '../../src/types/equipment';
import type { Spell } from '../../src/types/spell';

/**
 * Creates a mock RecomputeDerivedStatsDeps with sensible defaults.
 * Only override the properties you need for your test.
 *
 * @param overrides - Partial RecomputeDerivedStatsDeps with only the data you need to mock
 * @returns A RecomputeDerivedStatsDeps with defaults for all unused properties
 *
 * @example
 * const deps = createMockDeps({
 *   classes: { fighter: FIGHTER_CLASS },
 *   species: HUMAN_SPECIES,
 * });
 */
export function createMockDeps(
  overrides: Partial<RecomputeDerivedStatsDeps> = {},
): RecomputeDerivedStatsDeps {
  const defaults: RecomputeDerivedStatsDeps = {
    // Required property
    classes: {},

    // Optional properties (undefined by default)
    species: undefined,
    background: undefined,
    subclasses: undefined,
    feats: undefined,
    weapons: undefined,
    armors: undefined,
    gear: undefined,
    spells: undefined,
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock RecomputeDerivedStatsDeps with common test data pre-loaded.
 * Use this for tests that need standard species, backgrounds, and classes.
 */
export function createExtendedMockDeps(
  speciesMap: Record<string, Species>,
  backgroundMap: Record<string, Background>,
  classMap: Record<string, Class>,
  subclassMap: Record<string, Subclass> = {},
  featMap: Record<string, Feat> = {},
  weaponMap: Record<string, Weapon> = {},
  armorMap: Record<string, Armor> = {},
  gearMap: Record<string, GearItem> = {},
  spellMap: Record<string, Spell> = {},
): RecomputeDerivedStatsDeps {
  return {
    classes: classMap,
    species: speciesMap['Human'] ?? undefined,
    background: backgroundMap['Soldier'] ?? undefined,
    subclasses: subclassMap,
    feats: featMap,
    weapons: weaponMap,
    armors: armorMap,
    gear: gearMap,
    spells: spellMap,
  };
}
