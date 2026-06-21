import { describe, it, expect } from 'vitest';
import { importPack, parsePackJson, mergePack } from '../../src/io/import';
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
