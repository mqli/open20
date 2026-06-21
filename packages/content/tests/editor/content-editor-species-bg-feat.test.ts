import { describe, it, expect } from 'vitest';
import { ContentEditor } from '../../src/editor/content-editor';
import type { Species, Background, Feat } from 'open20-core';
import type { EditableContentPack } from '../../src/types/content-pack';

function makePack(): EditableContentPack {
  return {
    id: 'test-pack',
    name: 'Test Pack',
    version: '1.0.0',
    author: 'Test Author',
    source: 'Test',
    meta: { description: '' },
  } as EditableContentPack;
}

function makeSpecies(overrides: Partial<Species> = {}): Species {
  return {
    id: 'dwarf',
    source: 'SRD 5.2',
    description: 'Dwarves are short and stout.',
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Dwarvish'],
    abilityBonuses: { CON: 2 },
    baseTraits: [{ name: 'Darkvision', description: 'Accustomed to life underground.' }],
    ...overrides,
  };
}

function makeBackground(overrides: Partial<Background> = {}): Background {
  return {
    id: 'acolyte',
    source: 'SRD 5.2',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: [],
    languages: [],
    originFeatId: 'magic-initiate',
    startingGold: 50,
    ...overrides,
  };
}

function makeFeat(overrides: Partial<Feat> = {}): Feat {
  return {
    id: 'alert',
    source: 'SRD 5.2',
    description: 'Always on the lookout for danger.',
    category: 'Origin',
    ...overrides,
  };
}

// ── Species CRUD ──

describe('ContentEditor — Species CRUD', () => {
  it('addSpecies adds species to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    expect(editor.listSpecies()).toHaveLength(1);
    expect(editor.getSpecies('dwarf')).toBeDefined();
  });

  it('addSpecies initializes species array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    expect(pack.species).toBeDefined();
    expect(pack.species).toHaveLength(1);
  });

  it('updateSpecies partially updates existing species', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    editor.updateSpecies('dwarf', { speed: 25 });
    expect(editor.getSpecies('dwarf')?.speed).toBe(25);
    expect(editor.getSpecies('dwarf')?.size).toBe('Medium');
  });

  it('updateSpecies throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateSpecies('nonexistent', { speed: 25 })).toThrow();
  });

  it('removeSpecies removes species by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    editor.removeSpecies('dwarf');
    expect(editor.listSpecies()).toHaveLength(0);
  });

  it('removeSpecies throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeSpecies('nonexistent')).toThrow();
  });

  it('duplicateSpecies returns new species with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    const copy = editor.duplicateSpecies('dwarf');
    expect(copy.id).toBe('dwarf-copy');
    expect(copy.size).toBe('Medium');
    expect(editor.listSpecies()).toHaveLength(2);
  });

  it('duplicateSpecies throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateSpecies('nonexistent')).toThrow();
  });

  it('getSpecies returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getSpecies('nonexistent')).toBeUndefined();
  });

  it('listSpecies returns empty array if no species', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listSpecies()).toEqual([]);
  });
});

// ── Background CRUD ──

describe('ContentEditor — Background CRUD', () => {
  it('addBackground adds background to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    expect(editor.listBackgrounds()).toHaveLength(1);
    expect(editor.getBackground('acolyte')).toBeDefined();
  });

  it('addBackground initializes backgrounds array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    expect(pack.backgrounds).toBeDefined();
    expect(pack.backgrounds).toHaveLength(1);
  });

  it('updateBackground partially updates existing background', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    editor.updateBackground('acolyte', { startingGold: 100 });
    expect(editor.getBackground('acolyte')?.startingGold).toBe(100);
    expect(editor.getBackground('acolyte')?.skillProficiencies).toEqual(['Insight', 'Religion']);
  });

  it('updateBackground throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateBackground('nonexistent', { startingGold: 100 })).toThrow();
  });

  it('removeBackground removes background by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    editor.removeBackground('acolyte');
    expect(editor.listBackgrounds()).toHaveLength(0);
  });

  it('removeBackground throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeBackground('nonexistent')).toThrow();
  });

  it('duplicateBackground returns new background with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    const copy = editor.duplicateBackground('acolyte');
    expect(copy.id).toBe('acolyte-copy');
    expect(copy.skillProficiencies).toEqual(['Insight', 'Religion']);
    expect(editor.listBackgrounds()).toHaveLength(2);
  });

  it('duplicateBackground throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateBackground('nonexistent')).toThrow();
  });

  it('getBackground returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getBackground('nonexistent')).toBeUndefined();
  });

  it('listBackgrounds returns empty array if no backgrounds', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listBackgrounds()).toEqual([]);
  });
});

// ── Feat CRUD ──

describe('ContentEditor — Feat CRUD', () => {
  it('addFeat adds feat to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    expect(editor.listFeats()).toHaveLength(1);
    expect(editor.getFeat('alert')).toBeDefined();
  });

  it('addFeat initializes feats array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    expect(pack.feats).toBeDefined();
    expect(pack.feats).toHaveLength(1);
  });

  it('updateFeat partially updates existing feat', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    editor.updateFeat('alert', { description: 'Updated description.' });
    expect(editor.getFeat('alert')?.description).toBe('Updated description.');
    expect(editor.getFeat('alert')?.category).toBe('Origin');
  });

  it('updateFeat throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateFeat('nonexistent', { description: 'x' })).toThrow();
  });

  it('removeFeat removes feat by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    editor.removeFeat('alert');
    expect(editor.listFeats()).toHaveLength(0);
  });

  it('removeFeat throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeFeat('nonexistent')).toThrow();
  });

  it('duplicateFeat returns new feat with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    const copy = editor.duplicateFeat('alert');
    expect(copy.id).toBe('alert-copy');
    expect(copy.category).toBe('Origin');
    expect(editor.listFeats()).toHaveLength(2);
  });

  it('duplicateFeat throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateFeat('nonexistent')).toThrow();
  });

  it('getFeat returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getFeat('nonexistent')).toBeUndefined();
  });

  it('listFeats returns empty array if no feats', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listFeats()).toEqual([]);
  });
});

// ── Undo tests ──

describe('ContentEditor — Undo for new types', () => {
  it('undo restores species to state before addSpecies', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    expect(editor.listSpecies()).toHaveLength(1);
    editor.undo();
    expect(editor.listSpecies()).toHaveLength(0);
  });

  it('undo restores species to state before updateSpecies', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addSpecies(makeSpecies());
    editor.updateSpecies('dwarf', { speed: 25 });
    editor.undo();
    expect(editor.getSpecies('dwarf')?.speed).toBe(30);
  });

  it('undo restores backgrounds to state before removeBackground', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addBackground(makeBackground());
    editor.removeBackground('acolyte');
    expect(editor.listBackgrounds()).toHaveLength(0);
    editor.undo();
    expect(editor.listBackgrounds()).toHaveLength(1);
  });

  it('undo restores feats to state before duplicateFeat', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addFeat(makeFeat());
    editor.duplicateFeat('alert');
    expect(editor.listFeats()).toHaveLength(2);
    editor.undo();
    expect(editor.listFeats()).toHaveLength(1);
  });

  it('snapshot captures all 5 types independently', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);

    // Add all types
    editor.addSpecies(makeSpecies());
    editor.addBackground(makeBackground());
    editor.addFeat(makeFeat());

    // Modify only species
    editor.updateSpecies('dwarf', { speed: 25 });

    // Undo should only restore species
    editor.undo();
    expect(editor.getSpecies('dwarf')?.speed).toBe(30);
    expect(editor.listBackgrounds()).toHaveLength(1);
    expect(editor.listFeats()).toHaveLength(1);
  });
});
