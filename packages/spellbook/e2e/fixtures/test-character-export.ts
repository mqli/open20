import type { CharacterBundle } from '../../src/components/spell/character-import-export-types';

/**
 * A minimal but valid CharacterBundle for e2e import testing.
 * Character is a Cleric named "Exported Cleric" with a custom spell and subclass.
 */
export const EXPORTED_CHARACTER_BUNDLE: CharacterBundle = {
  schemaVersion: '1.0.0',
  character: {
    schemaVersion: '2024.1',
    name: 'Exported Cleric',
    species: 'Human',
    speciesSubtype: null,
    background: 'Acolyte',
    classes: [
      {
        classId: 'Cleric',
        level: 3,
        subclassId: 'custom-life-domain',
        subclassLevel: 1,
        hitDice: { die: 'd8', used: 0 },
      },
    ],
    abilityScores: {
      base: {
        Strength: 10,
        Dexterity: 10,
        Constitution: 12,
        Intelligence: 10,
        Wisdom: 16,
        Charisma: 14,
      },
      racialBonuses: {},
    },
    skills: {},
    feats: [],
    equipment: [],
    resources: {},
    spells: {
      classSpellcasting: {
        Cleric: {
          classId: 'Cleric',
          spellcastingAbility: 'Wisdom',
          spellSaveDC: 13,
          spellAttackBonus: 5,
          knownCantrips: ['light', 'sacred-flame', 'thaumaturgy'],
          maxCantripsKnown: 3,
          knownSpells: ['custom-heal', 'bless', 'cure-wounds'],
          preparedSpells: ['custom-heal'],
          maxPrepared: 6,
        },
      },
      spellSlots: {
        0: { total: 0, used: 0 },
        1: { total: 4, used: 0 },
        2: { total: 2, used: 0 },
        3: { total: 0, used: 0 },
        4: { total: 0, used: 0 },
        5: { total: 0, used: 0 },
        6: { total: 0, used: 0 },
        7: { total: 0, used: 0 },
        8: { total: 0, used: 0 },
        9: { total: 0, used: 0 },
      },
      pactMagicSlots: null,
    },
    hitPoints: {
      max: 24,
      current: 24,
      temporary: 0,
      deathSaves: { successes: 0, failures: 0, isStable: false },
    },
    combatStats: {
      AC: 12,
      initiative: 0,
      speed: 30,
      passivePerception: 13,
      proficiencyBonus: 2,
      attacks: [],
    },
    currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 },
    conditions: [],
    concentration: null,
    activeEffects: [],
    damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
    notes: '',
    createdAt: '2025-07-01T00:00:00.000Z',
    updatedAt: '2025-07-01T00:00:00.000Z',
  },
  content: {
    meta: {
      id: 'exported-cleric-content',
      name: 'Custom Content for Exported Cleric',
      version: '1.0.0',
      source: 'open20-spellbook',
      priority: 0,
    },
    spells: [
      {
        id: 'custom-heal',
        name: 'Custom Heal',
        level: 1,
        school: 'Evocation',
        castingTime: 'Action',
        range: 'Touch',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        concentration: false,
        ritual: false,
        description: [
          'A custom healing spell. The target regains 1d8 + your spellcasting ability modifier hit points.',
        ],
        source: 'Homebrew',
        classes: ['Cleric'],
      },
    ],
    subclasses: [
      {
        id: 'custom-life-domain',
        name: 'Life Domain',
        parentClass: 'Cleric',
        description: ['A custom life domain subclass for testing.'],
        features: [
          {
            id: 'custom-life-bonus',
            name: 'Bonus Proficiency',
            level: 1,
            description: ['Gain proficiency with heavy armor.'],
          },
        ],
      } as any, // Subclass type from open20-core
    ],
  },
  meta: {
    exportedFrom: 'open20-spellbook',
    exportedAt: '2025-07-09T00:00:00.000Z',
    version: '0.0.0',
  },
};

/** Invalid JSON content for error testing */
export const INVALID_JSON_CONTENT = 'this is not json at all';

/** A ContentPack JSON (not a CharacterBundle) for format error testing */
export const CONTENT_PACK_JSON = JSON.stringify({
  meta: { id: 'test', name: 'Test Pack', version: '1.0.0', source: 'test', priority: 0 },
  spells: [
    {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'Evocation',
      castingTime: 'Action',
      range: '150 feet',
      components: ['V', 'S', 'M'],
      duration: 'Instantaneous',
      concentration: false,
      ritual: false,
      description: ['A bright streak flashes...'],
      source: 'PHB',
      classes: ['Wizard', 'Sorcerer'],
    },
  ],
});

/**
 * Create a Playwright-compatible file upload payload from a string.
 */
export function createUploadFile(
  content: string,
  fileName: string = 'character-export.json',
): { name: string; mimeType: string; buffer: Buffer } {
  return {
    name: fileName,
    mimeType: 'application/json',
    buffer: Buffer.from(content, 'utf-8'),
  };
}
