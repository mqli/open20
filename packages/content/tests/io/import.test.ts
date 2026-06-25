import { describe, it, expect } from 'vitest';
import {
  importPack,
  parsePackJson,
  mergePack,
  detectImportFormat,
  importSingleType,
} from '../../src/io/import';
import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../../src/types/content-pack';

function makeValidSpell(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['You hurl a ball of fire...'],
    source: 'SRD 5.2',
    ...overrides,
  };
}

function makeValidPack(overrides: Record<string, unknown> = {}): ContentPack {
  return {
    meta: {
      id: 'test-pack',
      name: 'Test Pack',
      version: '1.0.0',
      source: 'Test',
    },
    spells: [makeValidSpell()],
    ...overrides,
  } as ContentPack;
}

describe('parsePackJson', () => {
  it('parses valid ContentPack JSON', () => {
    const pack = makeValidPack();
    const json = JSON.stringify(pack);
    const result = parsePackJson(json);
    expect(result.meta.id).toBe('test-pack');
  });

  it('throws on invalid JSON', () => {
    expect(() => parsePackJson('not json')).toThrow('Invalid JSON');
  });

  it('throws on non-object JSON (array)', () => {
    expect(() => parsePackJson('[1,2,3]')).toThrow('must be an object');
  });

  it('throws on missing meta', () => {
    const json = JSON.stringify({ spells: [] });
    expect(() => parsePackJson(json)).toThrow('missing or invalid meta');
  });

  it('throws on missing meta.id', () => {
    const json = JSON.stringify({ meta: { name: 'No ID' } });
    expect(() => parsePackJson(json)).toThrow('meta.id is required');
  });
});

describe('importPack', () => {
  it('returns EditableContentPack with spells array', () => {
    const pack = makeValidPack();
    const json = JSON.stringify(pack);
    const result = importPack(json);
    expect(result.meta.id).toBe('test-pack');
    expect(result.spells).toBeDefined();
    expect(result.spells![0].id).toBe('fireball');
  });

  it('validates spells against SpellSchema, throws on invalid', () => {
    const pack = makeValidPack({
      spells: [{ id: '', name: '' }], // missing required fields
    });
    const json = JSON.stringify(pack);
    expect(() => importPack(json)).toThrow();
  });

  it('accepts pack without spells', () => {
    const pack = makeValidPack({ spells: undefined });
    const json = JSON.stringify(pack);
    const result = importPack(json);
    expect(result.meta.id).toBe('test-pack');
    expect(result.spells).toBeUndefined();
  });

  it('validates species against SpeciesSchema, throws on invalid', () => {
    const pack = makeValidPack({
      spells: undefined,
      species: [{ id: '' }],
    });
    const json = JSON.stringify(pack);
    expect(() => importPack(json)).toThrow(/Invalid species/);
  });

  it('accepts valid species without throwing', () => {
    const pack = makeValidPack({
      spells: undefined,
      species: [
        {
          id: 'dwarf',
          source: 'SRD',
          description: 'Dwarves.',
          size: 'Medium',
          speed: 30,
          languages: [],
          abilityBonuses: {},
          baseTraits: [],
        },
      ],
    });
    const json = JSON.stringify(pack);
    const result = importPack(json);
    expect(result.species).toBeDefined();
    expect(result.species![0].id).toBe('dwarf');
  });

  it('validates backgrounds against BackgroundSchema, throws on invalid', () => {
    const pack = makeValidPack({
      spells: undefined,
      backgrounds: [{ id: '' }],
    });
    const json = JSON.stringify(pack);
    expect(() => importPack(json)).toThrow(/Invalid background/);
  });

  it('validates feats against FeatSchema, throws on invalid', () => {
    const pack = makeValidPack({
      spells: undefined,
      feats: [{ id: '' }],
    });
    const json = JSON.stringify(pack);
    expect(() => importPack(json)).toThrow(/Invalid feat/);
  });

  it('accepts all content types together', () => {
    const pack = makeValidPack({
      species: [
        {
          id: 'dwarf',
          source: 'SRD',
          description: 'Dwarves.',
          size: 'Medium',
          speed: 30,
          languages: [],
          abilityBonuses: {},
          baseTraits: [],
        },
      ],
      backgrounds: [
        {
          id: 'acolyte',
          source: 'SRD',
          skillProficiencies: [],
          toolProficiencies: [],
          languages: [],
          originFeatId: 'test',
          startingGold: 0,
        },
      ],
      feats: [{ id: 'alert', source: 'SRD', description: 'Test', category: 'General' }],
    });
    const json = JSON.stringify(pack);
    const result = importPack(json);
    expect(result.species).toBeDefined();
    expect(result.backgrounds).toBeDefined();
    expect(result.feats).toBeDefined();
  });

  it('throws on invalid JSON', () => {
    expect(() => importPack('not json')).toThrow('Invalid JSON');
  });
});

describe('mergePack', () => {
  it('concatenates content arrays correctly', () => {
    const target = makeValidPack() as EditableContentPack;
    const source = makeValidPack({
      spells: [makeValidSpell({ id: 'magic-missile', name: 'Magic Missile' })],
    }) as ContentPack;

    mergePack(target, source);
    expect(target.spells!.length).toBe(2);
    expect(target.spells![1].id).toBe('magic-missile');
  });

  it('does not duplicate when source has no new content', () => {
    const target = makeValidPack() as EditableContentPack;
    const source = makeValidPack({ spells: [] }) as ContentPack;

    mergePack(target, source);
    expect(target.spells!.length).toBe(1);
  });

  it('initializes target array if undefined', () => {
    const target = {
      meta: { id: 't', name: 'T', version: '1', source: 'T' },
    } as EditableContentPack;
    const source = makeValidPack() as ContentPack;

    mergePack(target, source);
    expect(target.spells).toBeDefined();
    expect(target.spells!.length).toBe(1);
  });
});

describe('detectImportFormat', () => {
  it('detects full-pack format', () => {
    const pack = makeValidPack();
    const json = JSON.stringify(pack);
    const result = detectImportFormat(json);
    expect(result.format).toBe('full-pack');
    if (result.format === 'full-pack') {
      expect(result.packName).toBe('Test Pack');
      expect(result.version).toBe('1.0.0');
    }
  });

  it('detects spells array as single-type', () => {
    const json = JSON.stringify([makeValidSpell()]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('spells');
      expect(result.itemCount).toBe(1);
    }
  });

  it('detects armors array as single-type', () => {
    const json = JSON.stringify([
      {
        id: 'leather',
        name: 'Leather',
        type: 'armor',
        source: 'SRD',
        category: 'Light',
        ac: 11,
        dexBonus: true,
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('armors');
    }
  });

  it('detects weapons array as single-type', () => {
    const json = JSON.stringify([
      {
        id: 'longsword',
        name: 'Longsword',
        type: 'weapon',
        source: 'SRD',
        category: 'Martial',
        damage: { entries: [{ dice: '1d8', type: 'Slashing' }], ability: 'Strength', bonus: 0 },
        properties: ['Versatile'],
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('weapons');
    }
  });

  it('detects monsters array as single-type', () => {
    const json = JSON.stringify([
      {
        id: 'goblin',
        name: 'Goblin',
        source: 'SRD',
        size: 'Small',
        type: 'Humanoid',
        alignment: 'neutral evil',
        armorClass: [{ value: 15, type: 'leather' }],
        hitPoints: { value: 7 },
        speed: { walk: 30 },
        abilityScores: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 8 },
        challengeRating: { rating: '1/4', xp: 50 },
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('monsters');
    }
  });

  it('detects gears array as single-type', () => {
    const json = JSON.stringify([
      { id: 'backpack', name: 'Backpack', type: 'gears', source: 'SRD', weight: 5 },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('gears');
    }
  });

  it('detects species array as single-type', () => {
    const json = JSON.stringify([
      {
        id: 'human',
        source: 'SRD',
        description: 'Test',
        size: 'Medium',
        speed: 30,
        languages: [],
        abilityBonuses: {},
        baseTraits: [],
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('species');
    }
  });

  it('detects backgrounds array as single-type', () => {
    const json = JSON.stringify([
      {
        id: 'acolyte',
        source: 'SRD',
        skillProficiencies: [],
        toolProficiencies: [],
        languages: [],
        originFeatId: 'test',
        startingGold: 0,
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('backgrounds');
    }
  });

  it('detects feats array as single-type', () => {
    const json = JSON.stringify([
      { id: 'alert', source: 'SRD', description: 'Test', category: 'General', grants: [] },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('feats');
    }
  });

  it('throws for empty array', () => {
    expect(() => detectImportFormat('[]')).toThrow('empty array');
  });

  it('throws for unrecognized object without meta', () => {
    const json = JSON.stringify({ some: 'data' });
    expect(() => detectImportFormat(json)).toThrow('Unknown JSON format');
  });

  it('spells detected before monsters when item has both', () => {
    // An item with school+level+castingTime, but also challengeRating — spells take priority
    const json = JSON.stringify([
      {
        id: 'test',
        name: 'Test',
        level: 3,
        school: 'Evocation',
        castingTime: '1 action',
        challengeRating: { rating: 1, xp: 200 },
        hitPoints: { value: 10 },
        armorClass: [{ value: 10, type: 'natural' }],
      },
    ]);
    const result = detectImportFormat(json);
    expect(result.format).toBe('single-type');
    if (result.format === 'single-type') {
      expect(result.detectedType).toBe('spells');
    }
  });

  it('throws on invalid JSON', () => {
    expect(() => detectImportFormat('not json')).toThrow('Invalid JSON');
  });
});

describe('importSingleType', () => {
  it('imports spells array and validates', () => {
    const json = JSON.stringify([makeValidSpell()]);
    const result = importSingleType(json, 'spells', { name: 'My Spells', id: 'my-spells' });
    expect(result.meta.name).toBe('My Spells');
    expect(result.spells).toBeDefined();
    expect(result.spells!.length).toBe(1);
    expect(result.spells![0].id).toBe('fireball');
  });

  it('imports armors array and validates', () => {
    const json = JSON.stringify([
      {
        id: 'leather',
        name: 'Leather',
        type: 'armor',
        source: 'SRD',
        category: 'Light',
        ac: 11,
        dexBonus: true,
      },
    ]);
    const result = importSingleType(json, 'armors');
    expect(result.armors).toBeDefined();
    expect(result.armors!.length).toBe(1);
  });

  it('imports weapons array and validates', () => {
    const json = JSON.stringify([
      {
        id: 'longsword',
        name: 'Longsword',
        type: 'weapon',
        source: 'SRD',
        category: 'Martial',
        damage: { entries: [{ dice: '1d8', type: 'Slashing' }], ability: 'Strength', bonus: 0 },
        properties: ['Versatile'],
      },
    ]);
    const result = importSingleType(json, 'weapons');
    expect(result.weapons).toBeDefined();
    expect(result.weapons!.length).toBe(1);
  });

  it('imports monsters array and validates', () => {
    const json = JSON.stringify([
      {
        id: 'goblin',
        name: 'Goblin',
        source: 'SRD',
        size: 'Small',
        type: 'Humanoid',
        alignment: 'neutral evil',
        armorClass: [{ value: 15, type: 'leather' }],
        hitPoints: { value: 7 },
        speed: { walk: 30 },
        abilityScores: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 8 },
        challengeRating: { rating: '1/4', xp: 50 },
      },
    ]);
    const result = importSingleType(json, 'monsters');
    expect(result.monsters).toBeDefined();
    expect(result.monsters!.length).toBe(1);
  });

  it('imports gears array and validates', () => {
    const json = JSON.stringify([
      { id: 'backpack', name: 'Backpack', type: 'gears', source: 'SRD', weight: 5 },
    ]);
    const result = importSingleType(json, 'gears');
    expect(result.gears).toBeDefined();
    expect(result.gears!.length).toBe(1);
  });

  it('imports species array and validates', () => {
    const json = JSON.stringify([
      {
        id: 'human',
        source: 'SRD',
        description: 'Test',
        size: 'Medium',
        speed: 30,
        languages: [],
        abilityBonuses: {},
        baseTraits: [],
      },
    ]);
    const result = importSingleType(json, 'species');
    expect(result.species).toBeDefined();
    expect(result.species!.length).toBe(1);
  });

  it('imports backgrounds array and validates', () => {
    const json = JSON.stringify([
      {
        id: 'acolyte',
        source: 'SRD',
        skillProficiencies: [],
        toolProficiencies: [],
        languages: [],
        originFeatId: 'test',
        startingGold: 0,
      },
    ]);
    const result = importSingleType(json, 'backgrounds');
    expect(result.backgrounds).toBeDefined();
    expect(result.backgrounds!.length).toBe(1);
  });

  it('imports feats array and validates', () => {
    const json = JSON.stringify([
      { id: 'alert', source: 'SRD', description: 'Test', category: 'General' },
    ]);
    const result = importSingleType(json, 'feats');
    expect(result.feats).toBeDefined();
    expect(result.feats!.length).toBe(1);
  });

  it('throws on invalid spell', () => {
    const json = JSON.stringify([{ id: '', name: '' }]);
    expect(() => importSingleType(json, 'spells')).toThrow(/Invalid spells/);
  });

  it('throws on non-array JSON for single-type import', () => {
    const json = JSON.stringify({ not: 'array' });
    expect(() => importSingleType(json, 'spells')).toThrow('Expected a JSON array');
  });

  it('uses default meta values when none provided', () => {
    const json = JSON.stringify([makeValidSpell()]);
    const result = importSingleType(json, 'spells');
    expect(result.meta.name).toContain('Imported');
    expect(result.meta.id).toContain('imported-spells-');
    expect(result.meta.version).toBe('1.0.0');
  });

  it('round-trip: exportContentType → detectImportFormat → importSingleType', () => {
    // Export single type (simulated)
    const exportJson = JSON.stringify([makeValidSpell()]);

    // Detect
    const detected = detectImportFormat(exportJson);
    expect(detected.format).toBe('single-type');

    // Import
    if (detected.format === 'single-type') {
      const result = importSingleType(exportJson, detected.detectedType, {
        name: 'Round Trip',
        id: 'round-trip',
      });
      expect(result.spells).toBeDefined();
      expect(result.spells![0].id).toBe('fireball');
    }
  });
});
