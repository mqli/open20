import { describe, it, expect } from 'vitest';
import { ContentEditor } from '../../src/editor/content-editor';
import type { Spell } from 'open20-core';
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

function makeSpell(overrides: Partial<Spell> = {}): Spell {
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

describe('ContentEditor', () => {
  it('addSpell adds spell to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    const spell = makeSpell();
    editor.addSpell(spell);
    expect(editor.listSpells()).toHaveLength(1);
    expect(editor.getSpell('fireball')).toBeDefined();
  });

  it('addSpell initializes spells array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    expect(pack.spells).toBeDefined();
    expect(pack.spells).toHaveLength(1);
  });

  it('updateSpell partially updates existing spell', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    editor.updateSpell('fireball', { name: 'Fireball (Enhanced)' });
    expect(editor.getSpell('fireball')?.name).toBe('Fireball (Enhanced)');
    // level should remain unchanged
    expect(editor.getSpell('fireball')?.level).toBe(3);
  });

  it('updateSpell throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateSpell('nonexistent', { name: 'X' })).toThrow();
  });

  it('removeSpell removes spell by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    editor.removeSpell('fireball');
    expect(editor.listSpells()).toHaveLength(0);
  });

  it('removeSpell throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeSpell('nonexistent')).toThrow();
  });

  it('duplicateSpell returns new spell with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    const copy = editor.duplicateSpell('fireball');
    expect(copy.id).toBe('fireball-copy');
    expect(copy.name).toBe('Fireball');
    expect(editor.listSpells()).toHaveLength(2);
  });

  it('duplicateSpell throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateSpell('nonexistent')).toThrow();
  });

  it('undo restores pack to state before last mutation', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    expect(editor.listSpells()).toHaveLength(1);
    editor.undo();
    expect(editor.listSpells()).toHaveLength(0);
  });

  it('canUndo is false initially', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.canUndo).toBe(false);
  });

  it('canUndo is true after mutation', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    expect(editor.canUndo).toBe(true);
  });

  it('canUndo is false after undo', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    editor.undo();
    expect(editor.canUndo).toBe(false);
  });

  it('only 1 undo step kept', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpell(makeSpell());
    editor.addSpell(makeSpell({ id: 'acid-rain', name: 'Acid Rain' }));
    // Only 1 undo step, so undoing should only undo the last operation
    // After first undo, canUndo should be false (only 1 step kept)
    editor.undo();
    expect(editor.canUndo).toBe(false);
  });

  it('getSpell returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getSpell('nonexistent')).toBeUndefined();
  });

  it('listSpells returns empty array if no spells', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listSpells()).toEqual([]);
  });
});
