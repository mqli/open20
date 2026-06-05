// tests/fixtures/characters.ts
// Shared mock data for character-related tests
// Eliminates duplication across create.test.ts, mutate.test.ts, recompute.test.ts, etc.

import { ResetType } from '../../src/types/resource';
import type { Species } from '../../src/types/species';
import type { Background } from '../../src/types/background';
import type { Class, Feature, Subclass } from '../../src/types/class';
import type { Character } from '../../src/types/character';
import type { SpellLevel, SpellSlotEntry } from '../../src/types/spell';

// ── Mock Character Factory ──────────────────────────────────────

/**
 * Create a mock Character with all required fields.
 * Accepts partial overrides for test-specific customizations.
 *
 * @example
 * const char = createMockCharacter({ name: 'My Hero' });
 * const charWithOverrides = createMockCharacter({ classes: [wizardClass] });
 */
export function createMockCharacter(overrides: Partial<Character> = {}): Character {
  const defaultChar: Character = {
    schemaVersion: '2024.1',
    name: 'Test Hero',
    species: 'Human',
    speciesSubtype: null,
    background: 'Soldier',
    classes: [
      {
        classId: 'Fighter',
        level: 1,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd10', used: 0 },
      },
    ],
    abilityScores: {
      base: {
        Strength: 18,
        Dexterity: 14,
        Constitution: 16,
        Intelligence: 10,
        Wisdom: 12,
        Charisma: 8,
      },
      racialBonuses: {},
      featBonuses: {},
      temporaryBonuses: {},
    },
    skills: {},
    feats: [],
    equipment: [],
    spells: {
      classSpellcasting: {},
      spellSlots: {
        0: { total: 0, used: 0 },
        1: { total: 0, used: 0 },
        2: { total: 0, used: 0 },
        3: { total: 0, used: 0 },
        4: { total: 0, used: 0 },
        5: { total: 0, used: 0 },
        6: { total: 0, used: 0 },
        7: { total: 0, used: 0 },
        8: { total: 0, used: 0 },
        9: { total: 0, used: 0 },
      } as Record<SpellLevel, SpellSlotEntry>,
      pactMagicSlots: null,
    },
    resources: {},
    hitPoints: {
      max: 10,
      current: 10,
      temporary: 0,
      deathSaves: { successes: 0, failures: 0, isStable: false },
    },
    combatStats: {
      AC: 14,
      initiative: 2,
      speed: 30,
      passivePerception: 11,
      proficiencyBonus: 3,
      attacks: [],
    },
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    conditions: [],
    concentration: null,
    activeEffects: [],
    damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
    notes: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  return { ...defaultChar, ...overrides };
}

// ── Species ──────────────────────────────────────────────────

export const HUMAN_SPECIES: Species = {
  id: 'Human',
  source: '2024 PHB',
  description: 'Versatile and ambitious',
  size: 'Medium',
  speed: 30,
  languages: ['Common'],
  abilityBonuses: {},
  baseTraits: [],
};

export const DWARF_SPECIES: Species = {
  id: 'Dwarf',
  source: '2024 PHB',
  description: 'Stout and resilient',
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Dwarvish'],
  abilityBonuses: { Constitution: 2 },
  baseTraits: [],
  darkvision: 60,
};

export const ELF_SPECIES: Species = {
  id: 'Elf',
  source: '2024 PHB',
  description: 'Graceful and long-lived',
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Elvish'],
  abilityBonuses: { Dexterity: 2 },
  baseTraits: [],
  darkvision: 60,
  subtypes: [
    {
      id: 'High Elf',
      name: 'High Elf',
      description: 'Scholarly elf',
      traits: [],
    },
  ],
};

// ── Backgrounds ──────────────────────────────────────────────

export const SOLDIER_BACKGROUND: Background = {
  id: 'Soldier',
  source: '2024 PHB',
  name: 'Soldier',
  description: 'Military veteran',
  skillProficiencies: ['Athletics', 'Intimidation'],
  toolProficiencies: ['Land Vehicles'],
  languages: [],
  originFeatId: 'Savage Attacker',
  startingGold: 10,
};

export const SAGE_BACKGROUND: Background = {
  id: 'Sage',
  source: '2024 PHB',
  name: 'Sage',
  description: 'Scholarly researcher',
  skillProficiencies: ['Arcana', 'History'],
  toolProficiencies: [],
  languages: [],
  originFeatId: 'Magic Initiate',
  startingGold: 10,
};

// ── Features ─────────────────────────────────────────────────

export const FIGHTER_FEATURES_L1: Feature[] = [
  { name: 'Fighting Style', description: 'Choose a fighting style', level: 1 },
  {
    name: 'Second Wind',
    description: 'Heal yourself',
    resourceId: 'Second Wind',
    resourceScaleWithPB: true,
    resourceResetOn: ResetType.ShortRest,
    level: 1,
  },
  { name: 'Weapon Mastery', description: 'Master weapons', level: 1 },
];

export const FIGHTER_FEATURES_L2: Feature[] = [
  {
    name: 'Action Surge',
    description: 'Take an extra action',
    resourceId: 'Action Surge',
    level: 2,
  },
  { name: 'Tactical Mind', description: 'Turn failure to success', level: 2 },
];

export const FIGHTER_FEATURES_L5: Feature[] = [
  { name: 'Extra Attack', description: 'Attack twice', level: 5 },
  { name: 'Fighting Style II', description: 'Choose another fighting style', level: 5 },
];

export const BARBARIAN_FEATURES_L1: Feature[] = [
  {
    name: 'Rage',
    description: 'Enter a rage',
    resourceId: 'Rage',
    resourceMaxByLevel: { '1': 2, '3': 3, '6': 4, '9': 4, '12': 5, '15': 5, '17': 6, '20': 6 },
    resourceResetOn: ResetType.LongRest,
    level: 1,
  },
  {
    name: 'Unarmored Defense',
    description: 'AC = 10 + Dex + Con',
    level: 1,
    featureType: 'acFormula',
    acFormula: { baseAC: 10, addModifiers: ['Dexterity', 'Constitution'], requires: ['noArmor'] },
  },
  { name: 'Weapon Mastery', description: 'Master weapons', level: 1 },
];

export const WIZARD_FEATURES_L1: Feature[] = [
  { name: 'Spellcasting', description: 'Cast wizard spells', level: 1 },
  {
    name: 'Arcane Recovery',
    description: 'Recover spell slots',
    resourceId: 'Arcane Recovery',
    level: 1,
  },
];

// ── Classes ──────────────────────────────────────────────────

export const FIGHTER_CLASS: Class = {
  id: 'Fighter',
  name: 'Fighter',
  source: '2024 PHB',
  hitDie: 'd10',
  savingThrowProficiencies: ['Strength', 'Constitution'],
  armorTraining: ['Light', 'Medium', 'Heavy', 'Shield'],
  weaponMastery: true,
  featuresByLevel: [
    { level: 1, features: FIGHTER_FEATURES_L1 },
    { level: 2, features: FIGHTER_FEATURES_L2 },
  ],
  spellcasting: null,
};

export const BARBARIAN_CLASS: Class = {
  id: 'Barbarian',
  name: 'Barbarian',
  source: '2024 PHB',
  hitDie: 'd12',
  savingThrowProficiencies: ['Strength', 'Constitution'],
  armorTraining: ['Light', 'Medium', 'Shield'],
  weaponMastery: true,
  featuresByLevel: [{ level: 1, features: BARBARIAN_FEATURES_L1 }],
  spellcasting: null,
};

export const WIZARD_CLASS: Class = {
  id: 'Wizard',
  name: 'Wizard',
  source: '2024 PHB',
  hitDie: 'd6',
  savingThrowProficiencies: ['Intelligence', 'Wisdom'],
  armorTraining: [],
  weaponMastery: false,
  featuresByLevel: [{ level: 1, preparedSpells: 4, features: WIZARD_FEATURES_L1 }],
  spellcasting: {
    ability: 'Intelligence',
    knownSource: 'spellbook',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
};

export const ROGUE_CLASS: Class = {
  id: 'Rogue',
  name: 'Rogue',
  source: '2024 PHB',
  hitDie: 'd8',
  savingThrowProficiencies: ['Dexterity', 'Intelligence'],
  armorTraining: ['Light'],
  weaponMastery: true,
  featuresByLevel: [
    {
      level: 1,
      features: [
        { name: 'Sneak Attack', description: 'Extra damage', level: 1 },
        { name: 'Cunning Action', description: 'Bonus action dash/disengage/hide', level: 1 },
      ],
    },
  ],
  spellcasting: null,
};

// ── Subclasses ──────────────────────────────────────────────

export const CHAMPION_SUBCLASS: Subclass = {
  id: 'Champion',
  parentClass: 'Fighter',
  grantedAtLevel: 3,
  featuresByLevel: [
    { level: 3, features: [{ name: 'Improved Critical', description: 'Crit on 19-20', level: 3 }] },
    {
      level: 7,
      features: [
        {
          name: 'Remarkable Athlete',
          description: 'Add half proficiency to Str/Dex/Con checks',
          level: 7,
        },
      ],
    },
  ],
};

// ── Cleric Class (for spell testing) ─────────────────────────

export const CLERIC_FEATURES_L1: Feature[] = [
  { name: 'Spellcasting', description: 'Cast cleric spells', level: 1 },
  { name: 'Blessing of the Trickster', description: 'Grant Stealth advantage', level: 1 },
];

export const CLERIC_CLASS: Class = {
  id: 'Cleric',
  name: 'Cleric',
  source: '2024 PHB',
  hitDie: 'd8',
  savingThrowProficiencies: ['Wisdom', 'Charisma'],
  armorTraining: ['Light', 'Medium', 'Shield'],
  weaponProficiencies: ['Simple'],
  weaponMastery: false,
  featuresByLevel: [{ level: 1, preparedSpells: 4, features: CLERIC_FEATURES_L1 }],
  spellcasting: {
    ability: 'Wisdom',
    knownSource: 'class_list',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
};

export const LIFE_DOMAIN_SUBCLASS: Subclass = {
  id: 'Life Domain',
  parentClass: 'Cleric',
  grantedAtLevel: 1,
  featuresByLevel: [
    {
      level: 1,
      features: [
        { name: 'Disciple of Life', description: 'Healing spells are more effective', level: 1 },
      ],
    },
    {
      level: 2,
      features: [
        { name: 'Channel Divinity: Preserve Life', description: 'Heal nearby creatures', level: 2 },
      ],
    },
  ],
  alwaysPreparedSpells: [
    { level: 1, spells: ['bless', 'cure-wounds'] },
    { level: 3, spells: ['lesser-restoration', 'spiritual-weapon'] },
    { level: 5, spells: ['beacon-of-hope', 'revivify'] },
  ],
};
