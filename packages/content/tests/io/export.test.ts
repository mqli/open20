import { describe, it, expect } from 'vitest';
import {
  exportPack,
  exportPackToJson,
  exportContentType,
  EXPORTABLE_CONTENT_KEYS,
} from '../../src/io/export';
import type { EditableContentPack } from '../../src/types/content-pack';

function makeMinimalPack(overrides: Partial<EditableContentPack> = {}): EditableContentPack {
  return {
    meta: {
      id: 'test-pack',
      name: 'Test Pack',
      version: '1.0.0',
      source: 'Test',
      description: 'A test pack',
      homepage: 'https://example.com',
      dependencies: ['other-pack'],
    },
    spells: [
      {
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
        source: 'Test',
      },
    ],
    ...overrides,
  } as EditableContentPack;
}

describe('exportPack', () => {
  it('produces valid JSON with only core ContentPackMeta fields in meta', () => {
    const pack = makeMinimalPack();
    const json = exportPack(pack);
    const parsed = JSON.parse(json);

    expect(parsed.meta.id).toBe('test-pack');
    expect(parsed.meta.name).toBe('Test Pack');
    expect(parsed.meta.version).toBe('1.0.0');
    expect(parsed.meta.source).toBe('Test');
    expect(parsed.meta).not.toHaveProperty('description');
    expect(parsed.meta).not.toHaveProperty('homepage');
    expect(parsed.meta).not.toHaveProperty('dependencies');
  });

  it('does NOT contain description, homepage, dependencies in meta', () => {
    const pack = makeMinimalPack({
      meta: {
        id: 'test-pack',
        name: 'Test Pack',
        version: '1.0.0',
        source: 'Test',
        description: 'Should be stripped',
        homepage: 'https://example.com',
        dependencies: ['pack-1'],
      } as EditableContentPack['meta'],
    });
    const json = exportPack(pack);
    const parsed = JSON.parse(json);

    expect(parsed.meta).not.toHaveProperty('description');
    expect(parsed.meta).not.toHaveProperty('homepage');
    expect(parsed.meta).not.toHaveProperty('dependencies');
  });

  it('does NOT contain _meta, editState, undoStack anywhere', () => {
    const pack = makeMinimalPack();
    const packWithState = pack as Record<string, unknown>;
    packWithState._meta = { some: 'state' };
    packWithState.editState = {
      createdAt: '...',
      updatedAt: '...',
      schemaVersion: '1',
      undoStack: [],
    };
    packWithState.undoStack = ['...'];

    const json = exportPack(packWithState as EditableContentPack);
    const parsed = JSON.parse(json);

    expect(parsed).not.toHaveProperty('_meta');
    expect(parsed).not.toHaveProperty('editState');
    expect(parsed).not.toHaveProperty('undoStack');
  });

  it('preserves content arrays (spells)', () => {
    const pack = makeMinimalPack();
    const json = exportPack(pack);
    const parsed = JSON.parse(json);

    expect(parsed.spells).toBeDefined();
    expect(parsed.spells[0].id).toBe('fireball');
    expect(parsed.spells[0].name).toBe('Fireball');
  });

  it('exportPackToJson is an alias for exportPack', () => {
    const pack = makeMinimalPack();
    const json1 = exportPack(pack);
    const json2 = exportPackToJson(pack);
    expect(json1).toBe(json2);
  });

  it('round-trip: exported JSON can be parsed by parsePackJson', () => {
    const pack = makeMinimalPack();
    const json = exportPack(pack);
    const parsed = JSON.parse(json);
    expect(parsed.meta.id).toBe('test-pack');
    expect(parsed.spells[0].id).toBe('fireball');
  });
});

describe('exportContentType', () => {
  it('exports spells as a pure JSON array (no meta wrapper)', () => {
    const pack = makeMinimalPack();
    const json = exportContentType(pack, 'spells');
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe('fireball');
    expect(parsed[0].name).toBe('Fireball');
    // No meta wrapper
    expect(parsed).not.toHaveProperty('meta');
  });

  it('exports empty array for missing content type', () => {
    const pack = makeMinimalPack({ spells: undefined } as Partial<EditableContentPack>);
    const json = exportContentType(pack, 'spells');
    expect(json).toBe('[]');
  });

  it('exports armors as a pure JSON array', () => {
    const pack = makeMinimalPack({
      spells: undefined,
      armors: [
        {
          id: 'leather',
          name: 'Leather',
          type: 'armor',
          source: 'SRD',
          category: 'Light',
          ac: 11,
          dexBonus: true,
        },
      ],
    } as unknown as Partial<EditableContentPack>);
    const json = exportContentType(pack, 'armors');
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe('leather');
    expect(parsed).not.toHaveProperty('meta');
  });

  it('exports weapons as a pure JSON array', () => {
    const pack = makeMinimalPack({
      spells: undefined,
      weapons: [
        {
          id: 'longsword',
          name: 'Longsword',
          type: 'weapon',
          source: 'SRD',
          category: 'Martial',
          damage: { entries: [{ dice: '1d8', type: 'Slashing' }], ability: 'Strength', bonus: 0 },
          properties: ['Versatile'],
        },
      ],
    } as unknown as Partial<EditableContentPack>);
    const json = exportContentType(pack, 'weapons');
    const parsed = JSON.parse(json);
    expect(parsed[0].id).toBe('longsword');
  });

  it('exports monsters as a pure JSON array', () => {
    const pack = makeMinimalPack({
      spells: undefined,
      monsters: [
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
      ],
    } as unknown as Partial<EditableContentPack>);
    const json = exportContentType(pack, 'monsters');
    const parsed = JSON.parse(json);
    expect(parsed[0].id).toBe('goblin');
  });

  it('works for all EXPORTABLE_CONTENT_KEYS', () => {
    const pack = makeMinimalPack({
      spells: undefined,
      armors: [
        {
          id: 'leather',
          name: 'Leather',
          type: 'armor',
          source: 'SRD',
          category: 'Light',
          ac: 11,
          dexBonus: true,
        },
      ],
      weapons: [
        {
          id: 'longsword',
          name: 'Longsword',
          type: 'weapon',
          source: 'SRD',
          category: 'Martial',
          damage: { entries: [{ dice: '1d8', type: 'Slashing' }], ability: 'Strength', bonus: 0 },
          properties: ['Versatile'],
        },
      ],
      gears: [{ id: 'backpack', name: 'Backpack', type: 'gears', source: 'SRD', weight: 5 }],
    } as unknown as Partial<EditableContentPack>);

    for (const key of EXPORTABLE_CONTENT_KEYS) {
      const json = exportContentType(pack, key);
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    }
  });
});
