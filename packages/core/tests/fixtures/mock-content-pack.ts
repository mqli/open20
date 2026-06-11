import type { ContentPack } from '../../src/content/types';
import type { Species } from '../../src/types/species';
import type { Background } from '../../src/types/background';
import type { Class, Subclass } from '../../src/types/class';
import type { Feat } from '../../src/types/feat';
import type { Spell } from '../../src/types/spell';
import type { Weapon, Armor, GearItem } from '../../src/types/equipment';
import type { Monster } from '../../src/monster/types';
import type { RulesGlossary } from '../../src/types/glossary';

/**
 * Minimal mock species for testing
 */
const mockSpecies: Species[] = [
  {
    id: 'Human',
    source: 'Mock',
    description: 'Human mock data for testing',
    size: 'Medium',
    speed: 30,
    languages: ['Common'],
    abilityBonuses: {},
    baseTraits: [
      {
        name: 'Resourceful',
        description: 'Humans gain an extra skill proficiency.',
        grants: {
          skillProficiencies: ['Perception'],
        },
      },
    ],
  },
  {
    id: 'Elf',
    source: 'Mock',
    description: 'Elf mock data for testing',
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    abilityBonuses: { Dexterity: 2 },
    baseTraits: [
      {
        name: 'Keen Senses',
        description: 'Elves have proficiency in Perception.',
        grants: {
          skillProficiencies: ['Perception'],
        },
      },
    ],
  },
  {
    id: 'Dwarf',
    source: 'Mock',
    description: 'Dwarf mock data for testing',
    size: 'Medium',
    speed: 25,
    languages: ['Common', 'Dwarvish'],
    abilityBonuses: { Constitution: 2 },
    baseTraits: [
      {
        name: 'Poison Resistance',
        description: 'Dwarves have resistance to poison damage.',
        grants: {
          damageResistances: ['Poison'],
        },
      },
    ],
    subtypes: [
      {
        id: 'Hill Dwarf',
        name: 'Hill Dwarf',
        description: 'Hill Dwarves gain extra HP per level.',
        traits: [
          {
            name: 'Dwarven Toughness',
            description:
              'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
            grants: {
              hpPerLevel: 1,
            },
          },
        ],
      },
    ],
  },
];

/**
 * Minimal mock backgrounds for testing
 */
const mockBackgrounds: Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    source: 'Mock',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: [],
    languages: [],
    originFeatId: 'Magic Initiate',
    startingGold: 15,
  },
  {
    id: 'soldier',
    name: 'Soldier',
    source: 'Mock',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: [],
    languages: [],
    originFeatId: 'Magic Initiate',
    startingGold: 15,
  },
  {
    id: 'sage',
    name: 'Sage',
    source: 'Mock',
    skillProficiencies: ['Arcana', 'History'],
    toolProficiencies: [],
    languages: [],
    originFeatId: 'Magic Initiate',
    startingGold: 15,
  },
];

/**
 * Minimal mock classes for testing
 */
const mockClasses: Class[] = [
  {
    id: 'Fighter',
    name: 'Fighter',
    source: 'Mock',
    hitDie: 'd10',
    savingThrowProficiencies: ['Strength', 'Constitution'],
    armorTraining: ['Light', 'Medium', 'Heavy', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    weaponMastery: true,
    featuresByLevel: [
      {
        level: 1,
        features: [
          {
            name: 'Fighting Style',
            description: 'You gain a fighting style.',
            level: 1,
          },
        ],
      },
    ],
    spellcasting: null,
  },
  {
    id: 'Wizard',
    name: 'Wizard',
    source: 'Mock',
    hitDie: 'd6',
    savingThrowProficiencies: ['Intelligence', 'Wisdom'],
    armorTraining: [],
    weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
    weaponMastery: false,
    featuresByLevel: [
      {
        level: 1,
        features: [
          {
            name: 'Spellcasting',
            description: 'You can cast wizard spells.',
            level: 1,
          },
        ],
      },
    ],
    spellcasting: {
      ability: 'Intelligence',
      knownSource: 'spellbook',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
  },
  {
    id: 'Barbarian',
    name: 'Barbarian',
    source: 'Mock',
    hitDie: 'd12',
    savingThrowProficiencies: ['Strength', 'Constitution'],
    armorTraining: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    weaponMastery: true,
    featuresByLevel: [
      {
        level: 1,
        features: [
          {
            name: 'Rage',
            description: 'You can enter a rage.',
            level: 1,
          },
        ],
      },
    ],
    spellcasting: null,
  },
];

/**
 * Minimal mock subclasses for testing
 */
const mockSubclasses: Subclass[] = [
  {
    id: 'Champion',
    parentClass: 'Fighter',
    grantedAtLevel: 3,
    featuresByLevel: [
      {
        level: 3,
        features: [
          {
            name: 'Improved Critical',
            description: 'Your critical hit range increases to 19-20.',
            level: 3,
          },
        ],
      },
    ],
  },
];

/**
 * Minimal mock feats for testing
 */
const mockFeats: Feat[] = [
  {
    id: 'Alert',
    name: 'Alert',
    source: 'Mock',
    description: 'Alert mock data for testing',
    category: 'General',
  },
];

/**
 * Minimal mock spells for testing
 */
const mockSpells: Spell[] = [
  {
    id: 'Acid Splash',
    name: 'Acid Splash',
    source: 'Mock',
    level: 0,
    school: 'Evocation',
    castingTime: 'Action',
    range: '60 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['Test spell'],
    classes: ['Wizard'],
  },
];

/**
 * Minimal mock weapons for testing
 */
const mockWeapons: Weapon[] = [
  {
    id: 'Longsword',
    name: 'Longsword',
    type: 'weapon',
    source: 'Mock',
    weight: 3,
    cost: '15 gp',
    equipped: false,
    quantity: 1,
    category: 'Martial',
    damage: {
      entries: [
        {
          dice: '1d8',
          type: 'Slashing',
        },
      ],
      ability: 'Strength',
      bonus: 0,
    },
    properties: [],
  },
];

/**
 * Minimal mock armor for testing
 */
const mockArmors: Armor[] = [
  {
    id: 'Leather',
    name: 'Leather Armor',
    source: 'Mock',
    weight: 10,
    cost: { quantity: 10, unit: 'gp' },
    category: 'Light',
    ac: 11,
    dexBonus: true,
  },
];

/**
 * Minimal mock gear for testing
 */
const mockGear: GearItem[] = [
  {
    id: 'Backpack',
    name: 'Backpack',
    type: 'gear',
    source: 'Mock',
    weight: 5,
    cost: '2 gp',
    equipped: false,
    quantity: 1,
  },
];

/**
 * Minimal mock monsters for testing
 */
const mockMonsters: Monster[] = [
  {
    id: 'Goblin',
    name: 'Goblin',
    source: 'Mock',
    size: 'Small',
    type: 'Humanoid',
    alignment: 'Neutral Evil',
    armorClass: [{ value: 15, type: 'natural armor' }],
    hitPoints: { value: 7, formula: '2d6' },
    speed: { walk: 30 },
    abilityScores: {
      base: {
        Strength: 8,
        Dexterity: 14,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 8,
        Charisma: 8,
      },
      racialBonuses: {},
    },
    challengeRating: { rating: 0.25, xp: 50 },
  },
];

const mockGlossary: RulesGlossary = {
  source: 'Mock',
  abbreviations: [
    { abbr: 'AC', expansion: 'Armor Class' },
    { abbr: 'DC', expansion: 'Difficulty Class' },
  ],
  entries: [
    {
      id: 'advantage',
      source: 'Mock',
      name: 'Advantage',
      content: ['If you have Advantage on a D20 Test, roll two d20s, and use the higher roll.'],
    },
    {
      id: 'armor-class',
      source: 'Mock',
      name: 'Armor Class',
      aliases: ['AC'],
      content: ['An Armor Class (AC) is the target number for an attack roll.'],
    },
    {
      id: 'blinded',
      source: 'Mock',
      name: 'Blinded',
      tag: 'Condition',
      condition: 'Blinded',
      content: ['While you have the Blinded condition, you experience the following effects.'],
      subsections: [
        {
          title: "Can't See.",
          content: ["You can't see and automatically fail any ability check that requires sight."],
        },
      ],
    },
    {
      id: 'concentration',
      source: 'Mock',
      name: 'Concentration',
      content: ['Some spells and other effects require Concentration to remain active.'],
    },
  ],
};

/**
 * Mock content pack for testing.
 * Contains minimal data needed for core package tests.
 * This avoids depending on @open20/content-srd.
 */
export const mockContentPack: ContentPack = {
  meta: {
    id: 'mock-test-data',
    name: 'Mock Test Data',
    version: '1.0.0',
    source: 'Mock',
  },
  species: mockSpecies,
  backgrounds: mockBackgrounds,
  classes: mockClasses,
  subclasses: mockSubclasses,
  feats: mockFeats,
  spells: mockSpells,
  weapons: mockWeapons,
  armors: mockArmors,
  gear: mockGear,
  monsters: mockMonsters,
  glossary: mockGlossary,
};
