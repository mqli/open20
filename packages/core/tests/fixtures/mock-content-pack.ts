import type { ContentPack } from '../../src/content/types';
import type { Species } from '../../src/types/species';
import type { Background } from '../../src/types/background';
import type { Class, Subclass } from '../../src/types/class';
import type { Feat } from '../../src/types/feat';
import type { Spell } from '../../src/types/spell';
import type { Weapon, Armor, GearItem } from '../../src/types/equipment';
import type { Monster } from '../../src/monster/types';

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
    abilityBonuses: { DEX: 2 },
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
    abilityBonuses: { CON: 2 },
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
    source: 'Mock',
    description: 'Acolyte mock data for testing',
    skillProficiencies: ['Insight', 'Religion'],
    languages: 2,
    startingEquipment: [],
    feature: {
      name: 'Acolyte of the Faith',
      description: 'Test feature',
    },
  },
  {
    id: 'soldier',
    source: 'Mock',
    description: 'Soldier mock data for testing',
    skillProficiencies: ['Athletics', 'Intimidation'],
    languages: 0,
    startingEquipment: [],
    feature: {
      name: 'Military Rank',
      description: 'Test feature',
    },
  },
  {
    id: 'sage',
    source: 'Mock',
    description: 'Sage mock data for testing',
    skillProficiencies: ['Arcana', 'History'],
    languages: 2,
    startingEquipment: [],
    feature: {
      name: 'Researcher',
      description: 'Test feature',
    },
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
    description: 'Fighter mock data for testing',
    hitDie: 'd10',
    primaryAbility: 'STR',
    savingThrowProficiencies: ['STR', 'CON'],
    armorProficiencies: ['Light', 'Medium', 'Heavy', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: 2,
    skillOptions: ['Athletics', 'Acrobatics', 'Perception', 'Survival'],
    spellcasting: undefined,
    featuresByLevel: [
      {
        level: 1,
        features: [
          {
            name: 'Fighting Style',
            description: 'You gain a fighting style.',
            level: 1,
          },
          {
            name: 'Second Wind',
            description: 'You can use a bonus action to regain hit points.',
            level: 1,
            resourceMax: 1,
            resourceResetOn: 'Long Rest',
          },
        ],
      },
      {
        level: 2,
        features: [
          {
            name: 'Action Surge',
            description: 'You can push yourself beyond your normal limits.',
            level: 2,
            resourceMax: 1,
            resourceResetOn: 'Short Rest',
          },
        ],
      },
      {
        level: 5,
        features: [
          {
            name: 'Extra Attack',
            description: 'You can attack twice instead of once.',
            level: 5,
          },
        ],
      },
      {
        level: 9,
        features: [
          {
            name: 'Indomitable',
            description: 'You can reroll a saving throw.',
            level: 9,
            resourceMax: 1,
            resourceResetOn: 'Long Rest',
          },
        ],
      },
      {
        level: 11,
        features: [
          {
            name: 'Extra Attack (2)',
            description: 'You can attack three times.',
            level: 11,
          },
        ],
      },
      {
        level: 13,
        features: [
          {
            name: 'Indomitable (2)',
            description: 'You can reroll a saving throw twice.',
            level: 13,
            resourceMax: 2,
            resourceResetOn: 'Long Rest',
          },
        ],
      },
      {
        level: 17,
        features: [
          {
            name: 'Indomitable (3)',
            description: 'You can reroll a saving throw three times.',
            level: 17,
            resourceMax: 3,
            resourceResetOn: 'Long Rest',
          },
        ],
      },
      {
        level: 20,
        features: [
          {
            name: 'Extra Attack (3)',
            description: 'You can attack four times.',
            level: 20,
          },
        ],
      },
    ],
  },
  {
    id: 'Wizard',
    name: 'Wizard',
    source: 'Mock',
    description: 'Wizard mock data for testing',
    hitDie: 'd6',
    primaryAbility: 'INT',
    savingThrowProficiencies: ['INT', 'WIS'],
    armorProficiencies: [],
    weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
    skillChoices: 2,
    skillOptions: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
    spellcasting: {
      ability: 'INT',
      knownSource: 'spellbook',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
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
  },
  {
    id: 'Barbarian',
    name: 'Barbarian',
    source: 'Mock',
    description: 'Barbarian mock data for testing',
    hitDie: 'd12',
    primaryAbility: 'STR',
    savingThrowProficiencies: ['STR', 'CON'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    skillChoices: 2,
    skillOptions: [
      'Animal Handling',
      'Athletics',
      'Intimidation',
      'Nature',
      'Perception',
      'Survival',
    ],
    spellcasting: undefined,
    featuresByLevel: [
      {
        level: 1,
        features: [
          {
            name: 'Rage',
            description:
              'You can enter a rage. You have resistance to bludgeoning, piercing, and slashing damage.',
            level: 1,
          },
        ],
      },
    ],
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
    description: 'Champion mock data',
    source: 'Mock',
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
  {
    id: 'Battle Master',
    parentClass: 'Fighter',
    grantedAtLevel: 3,
    description: 'Battle Master mock data',
    source: 'Mock',
    featuresByLevel: [
      {
        level: 3,
        features: [
          {
            name: 'Combat Superiority',
            description: 'You gain superiority dice.',
            level: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'Eldritch Knight',
    parentClass: 'Fighter',
    grantedAtLevel: 3,
    description: 'Eldritch Knight mock data',
    source: 'Mock',
    featuresByLevel: [
      {
        level: 3,
        features: [
          {
            name: 'Spellcasting',
            description: 'You gain the ability to cast wizard spells.',
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
    source: 'Mock',
    description: 'Alert mock data for testing',
    prerequisites: [],
    benefits: {
      description: 'You gain a +5 bonus to initiative.',
    },
  },
];

/**
 * Minimal mock spells for testing
 */
const mockSpells: Spell[] = [
  {
    id: 'Acid Splash',
    source: 'Mock',
    level: 0,
    school: 'Evocation',
    castingTime: 'Action',
    range: '60 feet',
    components: {
      verbal: true,
      somatic: true,
      material: false,
    },
    duration: 'Instantaneous',
    description: 'Test spell',
    classes: ['Wizard'],
  },
  {
    id: 'Magic Missile',
    source: 'Mock',
    level: 1,
    school: 'Evocation',
    castingTime: 'Action',
    range: '120 feet',
    components: {
      verbal: true,
      somatic: true,
      material: false,
    },
    duration: 'Instantaneous',
    description: 'Test spell',
    classes: ['Wizard'],
  },
];

/**
 * Minimal mock weapons for testing
 */
const mockWeapons: Weapon[] = [
  {
    id: 'Longsword',
    source: 'Mock',
    name: 'Longsword',
    category: 'Martial',
    damage: { dice: '1d8', type: 'Slashing' },
    weight: 3,
    cost: 15,
    properties: [],
  },
];

/**
 * Minimal mock armor for testing
 */
const mockArmor: Armor[] = [
  {
    id: 'Leather',
    source: 'Mock',
    name: 'Leather Armor',
    category: 'Light',
    ac: 11,
    dexBonus: true,
    weight: 10,
    cost: 10,
    stealthDisadvantage: false,
  },
];

/**
 * Minimal mock gear for testing
 */
const mockGear: GearItem[] = [
  {
    id: 'Backpack',
    source: 'Mock',
    name: 'Backpack',
    weight: 5,
    cost: 2,
  },
];

/**
 * Minimal mock monsters for testing
 */
const mockMonsters: Monster[] = [
  {
    id: 'Goblin',
    source: 'Mock',
    name: 'Goblin',
    size: 'Small',
    type: 'Humanoid',
    alignment: 'Neutral Evil',
    armorClass: 15,
    hitPoints: { average: 7, formula: '2d6' },
    speed: { walk: 30 },
    abilities: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 8 },
    challengeRating: 0.25,
    xp: 50,
  },
];

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
  armor: mockArmor,
  gear: mockGear,
  monsters: mockMonsters,
};
