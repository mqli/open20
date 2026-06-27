import type { Subclass, Class } from 'open20-core';

// ── Storage keys (match StorageService) ──
export const CUSTOM_CLASSES_KEY = 'open20-spellbook-custom-classes';
export const STANDALONE_SUBCLASSES_KEY = 'open20-spellbook-standalone-subclasses';

// ── A complete custom class entry with one subclass ──
export const TEST_CUSTOM_CLASS: Class = {
  id: 'my-wizard',
  name: 'My Wizard',
  source: 'Homebrew',
  hitDie: 'd8',
  savingThrowProficiencies: [],
  armorTraining: [],
  weaponMastery: false,
  featuresByLevel: [
    {
      level: 1,
      cantripsKnown: 3,
      preparedSpells: 4,
      features: [],
    },
  ],
  spellcasting: {
    ability: 'Intelligence',
    knownSource: 'class_list',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
  spellSlotsByLevel: {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

export const TEST_CUSTOM_SUBCLASS: Subclass = {
  id: 'custom-evoker',
  parentClass: 'my-wizard',
  grantedAtLevel: 1,
  featuresByLevel: [],
  source: 'Homebrew',
};

export const TEST_CUSTOM_CLASS_ENTRY = {
  class: TEST_CUSTOM_CLASS,
  subclasses: [TEST_CUSTOM_SUBCLASS],
};

// ── A standalone subclass for an SRD Wizard ──
export const TEST_STANDALONE_SUBCLASS: Subclass = {
  id: 'my-bladesinger',
  parentClass: 'Wizard',
  grantedAtLevel: 1,
  featuresByLevel: [],
  alwaysPreparedSpells: [
    {
      level: 3,
      spells: ['fireball' as const, 'lightning-bolt' as const],
    },
  ],
  source: 'Homebrew',
};

/** Pre-seeded custom class entries ready for localStorage injection. */
export const SEED_CUSTOM_CLASSES = [TEST_CUSTOM_CLASS_ENTRY];

/** Pre-seeded standalone subclasses ready for localStorage injection. */
export const SEED_STANDALONE_SUBCLASSES: Subclass[] = [TEST_STANDALONE_SUBCLASS];
