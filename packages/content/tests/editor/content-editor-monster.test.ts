import { describe, it, expect } from 'vitest';
import { ContentEditor } from '../../src/editor/content-editor';
import type { Monster } from 'open20-core';
import type { EditableContentPack } from '../../src/types/content-pack';

function makePack(): EditableContentPack {
  return {
    id: 'test-pack',
    name: 'Test Pack',
    version: '1.0.0',
    author: 'Test Author',
    source: 'Test',
    meta: {
      description: '',
    },
  } as EditableContentPack;
}

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 'goblin',
    name: 'Goblin',
    source: 'SRD 5.2',
    size: 'Small',
    type: 'Humanoid',
    alignment: 'Neutral Evil',
    armorClass: [{ value: 15, type: 'leather armor' }],
    hitPoints: { value: 7, formula: '2d6' },
    speed: { walk: 30 },
    abilityScores: {
      STR: 8,
      DEX: 14,
      CON: 10,
      INT: 10,
      WIS: 8,
      CHA: 8,
    },
    challengeRating: { rating: '1/4', xp: 50 },
    ...overrides,
  } as Monster;
}

describe('ContentEditor — Monster CRUD', () => {
  it('addMonster adds monster to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    const monster = makeMonster();
    editor.addMonster(monster);
    expect(editor.listMonsters()).toHaveLength(1);
    expect(editor.getMonster('goblin')).toBeDefined();
  });

  it('addMonster initializes monsters array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    expect(pack.monsters).toBeDefined();
    expect(pack.monsters).toHaveLength(1);
  });

  it('updateMonster partially updates existing monster', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    editor.updateMonster('goblin', { name: 'Goblin Boss' });
    expect(editor.getMonster('goblin')?.name).toBe('Goblin Boss');
    // type should remain unchanged
    expect(editor.getMonster('goblin')?.type).toBe('Humanoid');
  });

  it('updateMonster throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateMonster('nonexistent', { name: 'X' })).toThrow();
  });

  it('removeMonster removes monster by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    editor.removeMonster('goblin');
    expect(editor.listMonsters()).toHaveLength(0);
  });

  it('removeMonster throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeMonster('nonexistent')).toThrow();
  });

  it('duplicateMonster returns new monster with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    const copy = editor.duplicateMonster('goblin');
    expect(copy.id).toBe('goblin-copy');
    expect(copy.name).toBe('Goblin');
    expect(editor.listMonsters()).toHaveLength(2);
  });

  it('duplicateMonster throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateMonster('nonexistent')).toThrow();
  });

  it('getMonster returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getMonster('nonexistent')).toBeUndefined();
  });

  it('listMonsters returns empty array if no monsters', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listMonsters()).toEqual([]);
  });
});

describe('ContentEditor — Monster Undo', () => {
  it('undo restores monsters to state before addMonster', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    expect(editor.listMonsters()).toHaveLength(1);
    editor.undo();
    expect(editor.listMonsters()).toHaveLength(0);
  });

  it('undo restores monsters to state before removeMonster', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    editor.removeMonster('goblin');
    expect(editor.listMonsters()).toHaveLength(0);
    editor.undo();
    expect(editor.listMonsters()).toHaveLength(1);
    expect(editor.getMonster('goblin')).toBeDefined();
  });

  it('undo restores monsters to state before updateMonster', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    editor.updateMonster('goblin', { name: 'Goblin Boss' });
    editor.undo();
    expect(editor.getMonster('goblin')?.name).toBe('Goblin');
  });

  it('undo restores monsters to state before duplicateMonster', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addMonster(makeMonster());
    editor.duplicateMonster('goblin');
    expect(editor.listMonsters()).toHaveLength(2);
    editor.undo();
    expect(editor.listMonsters()).toHaveLength(1);
  });
});

describe('ContentEditor — Snapshot captures both spells and monsters independently', () => {
  it('undo only restores monsters when only monster was changed', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    // Add both a spell and a monster
    const spell = {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'Evocation' as const,
      castingTime: '1 action',
      range: '150 feet',
      components: ['V', 'S', 'M'] as const,
      duration: 'Instantaneous',
      concentration: false,
      ritual: false,
      description: ['boom'],
      source: 'SRD',
    };
    editor.addSpell(spell as any);
    editor.addMonster(makeMonster());
    expect(editor.listSpells()).toHaveLength(1);
    expect(editor.listMonsters()).toHaveLength(1);

    // Now modify only the monster
    editor.updateMonster('goblin', { name: 'Goblin Boss' });
    expect(editor.getMonster('goblin')?.name).toBe('Goblin Boss');

    // Undo should restore monster but spells should be untouched
    editor.undo();
    expect(editor.getMonster('goblin')?.name).toBe('Goblin');
    expect(editor.listSpells()).toHaveLength(1);
  });

  it('undo only restores spells when only spell was changed', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    const spell = {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'Evocation' as const,
      castingTime: '1 action',
      range: '150 feet',
      components: ['V', 'S', 'M'] as const,
      duration: 'Instantaneous',
      concentration: false,
      ritual: false,
      description: ['boom'],
      source: 'SRD',
    };
    editor.addSpell(spell as any);
    editor.addMonster(makeMonster());
    expect(editor.listSpells()).toHaveLength(1);
    expect(editor.listMonsters()).toHaveLength(1);

    // Modify only the spell
    editor.updateSpell('fireball', { name: 'Fireball (Enhanced)' });
    expect(editor.getSpell('fireball')?.name).toBe('Fireball (Enhanced)');

    // Undo should restore spell but monsters should be untouched
    editor.undo();
    expect(editor.getSpell('fireball')?.name).toBe('Fireball');
    expect(editor.listMonsters()).toHaveLength(1);
  });
});
