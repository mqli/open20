import { describe, it, expect } from 'vitest';
import { exportPack, exportPackToJson } from '../../src/io/export';
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
