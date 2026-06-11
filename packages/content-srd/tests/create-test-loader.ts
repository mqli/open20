import { srdContentPack } from '../src/index';
import { resolveCharacterDeps } from '../src/query/resolve';
import type {
  ContentPack,
  Class,
  Spell,
  Species,
  Background,
  Feat,
  Weapon,
  Armor,
  Gear,
  Subclass,
  RecomputeDerivedStatsDeps,
  Character,
} from 'open20-core';

/**
 * Get the SRD content pack for tests.
 * Replaces createDataLoader() from the old API.
 */
export function getTestContentPack(): ContentPack {
  return srdContentPack;
}

/**
 * Helper functions that mimic the old DataLoader API.
 * These use the content-srd query functions under the hood.
 */
export function getTestClass(id: string): Class | undefined {
  return srdContentPack.classes?.find((c) => c.id === id);
}

export function getTestSpell(id: string): Spell | undefined {
  return srdContentPack.spells?.find((s) => s.id === id);
}

export function getTestSpecies(id: string): Species | undefined {
  return srdContentPack.species?.find((s) => s.id === id);
}

export function getTestBackground(id: string): Background | undefined {
  return srdContentPack.backgrounds?.find((b) => b.id === id);
}

export function getTestFeat(id: string): Feat | undefined {
  return srdContentPack.feats?.find((f) => f.id === id);
}

export function getTestSubclass(id: string): Subclass | undefined {
  return srdContentPack.subclasses?.find((s) => s.id === id);
}

export function getTestWeapon(id: string): Weapon | undefined {
  return srdContentPack.weapons?.find((w) => w.id === id);
}

export function getTestArmor(id: string): Armor | undefined {
  return srdContentPack.armors?.find((a) => a.id === id);
}

export function getTestGear(id: string): Gear | undefined {
  return srdContentPack.gears?.find((g) => g.id === id);
}
/**
 * Create RecomputeDerivedStatsDeps for a test character.
 * Use this when calling core functions that require deps.
 */
export function createTestDeps(character: Character): RecomputeDerivedStatsDeps {
  return resolveCharacterDeps(character, srdContentPack);
}

/**
 * Create RecomputeDerivedStatsDeps for character creation.
 * Use this when calling createCharacter().
 *
 * For multiclass characters, pass additional class IDs in options.additionalClassIds.
 */
export function createTestDepsForCreate(
  params: {
    speciesId: string;
    backgroundId: string;
    classId: string;
    subclassId?: string | null;
  },
  options?: {
    additionalClassIds?: string[];
  },
): RecomputeDerivedStatsDeps {
  const deps: RecomputeDerivedStatsDeps = {
    classes: {},
    weapons: {},
    armors: {},
    gears: {},
    spells: {},
    feats: {},
  };

  // Populate species
  const species = srdContentPack.species?.find((s) => s.id === params.speciesId);
  if (species) deps.species = species;

  // Populate background
  const background = srdContentPack.backgrounds?.find((b) => b.id === params.backgroundId);
  if (background) deps.background = background;

  // Populate primary class
  const klass = srdContentPack.classes?.find((c) => c.id === params.classId);
  if (klass) {
    deps.classes[klass.id] = klass;
  }

  // Populate additional classes (for multiclass)
  if (options?.additionalClassIds) {
    for (const classId of options.additionalClassIds) {
      const additionalKlass = srdContentPack.classes?.find((c) => c.id === classId);
      if (additionalKlass) {
        deps.classes[additionalKlass.id] = additionalKlass;
      }
    }
  }

  // Populate subclass
  if (params.subclassId && klass) {
    const sub = srdContentPack.subclasses?.find((s) => s.id === params.subclassId);
    if (sub) deps.subclasses = { [sub.id]: sub };
  }

  // Populate equipment (keyed by ID)
  if (srdContentPack.weapons) {
    deps.weapons = {};
    for (const weapon of srdContentPack.weapons) {
      deps.weapons[weapon.id] = weapon;
    }
  }
  if (srdContentPack.armors) {
    deps.armors = {};
    for (const armor of srdContentPack.armors) {
      deps.armors[armor.id] = armor;
    }
  }
  if (srdContentPack.gears) {
    deps.gears = {};
    for (const gearItem of srdContentPack.gears) {
      deps.gears[gearItem.id] = gearItem;
    }
  }

  // Populate spells (keyed by ID)
  if (srdContentPack.spells) {
    deps.spells = {};
    for (const spell of srdContentPack.spells) {
      deps.spells[spell.id] = spell;
    }
  }

  // Populate feats (keyed by ID)
  if (srdContentPack.feats) {
    deps.feats = {};
    for (const feat of srdContentPack.feats) {
      deps.feats[feat.id] = feat;
    }
  }

  return deps;
}
