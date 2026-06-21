import { describe, it, expect } from 'vitest';
import { ContentEditor } from '../../src/editor/content-editor';
import type { Weapon, Armor, Gear } from 'open20-core';
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

function makeWeapon(overrides: Partial<Weapon> = {}): Weapon {
  return {
    id: 'longsword',
    name: 'Longsword',
    source: 'SRD 5.2',
    category: 'Martial',
    damage: {
      entries: [{ dice: '1d8', type: 'Slashing' }],
      ability: 'STR',
      bonus: 0,
    },
    properties: ['Versatile'],
    weight: 3,
    cost: '15 gp',
    ...overrides,
  };
}

function makeArmor(overrides: Partial<Armor> = {}): Armor {
  return {
    id: 'chain-mail',
    name: 'Chain Mail',
    source: 'SRD 5.2',
    category: 'Heavy',
    ac: 16,
    dexBonus: false,
    strengthRequirement: 13,
    stealthDisadvantage: true,
    weight: 55,
    ...overrides,
  };
}

function makeGear(overrides: Partial<Gear> = {}): Gear {
  return {
    id: 'backpack',
    name: 'Backpack',
    source: 'SRD 5.2',
    type: 'gears',
    weight: 5,
    cost: '2 gp',
    equipped: false,
    ...overrides,
  };
}

// ── Weapon CRUD ──

describe('ContentEditor — Weapon CRUD', () => {
  it('addWeapon adds weapon to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    expect(editor.listWeapons()).toHaveLength(1);
    expect(editor.getWeapon('longsword')).toBeDefined();
  });

  it('addWeapon initializes weapons array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    expect(pack.weapons).toBeDefined();
    expect(pack.weapons).toHaveLength(1);
  });

  it('updateWeapon partially updates existing weapon', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    editor.updateWeapon('longsword', { cost: '20 gp' });
    expect(editor.getWeapon('longsword')?.cost).toBe('20 gp');
    expect(editor.getWeapon('longsword')?.category).toBe('Martial');
  });

  it('updateWeapon throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateWeapon('nonexistent', { cost: '20 gp' })).toThrow();
  });

  it('removeWeapon removes weapon by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    editor.removeWeapon('longsword');
    expect(editor.listWeapons()).toHaveLength(0);
  });

  it('removeWeapon throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeWeapon('nonexistent')).toThrow();
  });

  it('duplicateWeapon returns new weapon with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    const copy = editor.duplicateWeapon('longsword');
    expect(copy.id).toBe('longsword-copy');
    expect(copy.category).toBe('Martial');
    expect(editor.listWeapons()).toHaveLength(2);
  });

  it('duplicateWeapon throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateWeapon('nonexistent')).toThrow();
  });

  it('getWeapon returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getWeapon('nonexistent')).toBeUndefined();
  });

  it('listWeapons returns empty array if no weapons', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listWeapons()).toEqual([]);
  });
});

// ── Armor CRUD ──

describe('ContentEditor — Armor CRUD', () => {
  it('addArmor adds armor to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    expect(editor.listArmors()).toHaveLength(1);
    expect(editor.getArmor('chain-mail')).toBeDefined();
  });

  it('addArmor initializes armors array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    expect(pack.armors).toBeDefined();
    expect(pack.armors).toHaveLength(1);
  });

  it('updateArmor partially updates existing armor', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    editor.updateArmor('chain-mail', { ac: 18 });
    expect(editor.getArmor('chain-mail')?.ac).toBe(18);
    expect(editor.getArmor('chain-mail')?.category).toBe('Heavy');
  });

  it('updateArmor throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateArmor('nonexistent', { ac: 18 })).toThrow();
  });

  it('removeArmor removes armor by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    editor.removeArmor('chain-mail');
    expect(editor.listArmors()).toHaveLength(0);
  });

  it('removeArmor throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeArmor('nonexistent')).toThrow();
  });

  it('duplicateArmor returns new armor with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    const copy = editor.duplicateArmor('chain-mail');
    expect(copy.id).toBe('chain-mail-copy');
    expect(copy.category).toBe('Heavy');
    expect(editor.listArmors()).toHaveLength(2);
  });

  it('duplicateArmor throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateArmor('nonexistent')).toThrow();
  });

  it('getArmor returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getArmor('nonexistent')).toBeUndefined();
  });

  it('listArmors returns empty array if no armors', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listArmors()).toEqual([]);
  });
});

// ── Gear CRUD ──

describe('ContentEditor — Gear CRUD', () => {
  it('addGear adds gear to pack', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    expect(editor.listGears()).toHaveLength(1);
    expect(editor.getGear('backpack')).toBeDefined();
  });

  it('addGear initializes gears array if undefined', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    expect(pack.gears).toBeDefined();
    expect(pack.gears).toHaveLength(1);
  });

  it('updateGear partially updates existing gear', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    editor.updateGear('backpack', { weight: 6 });
    expect(editor.getGear('backpack')?.weight).toBe(6);
    expect(editor.getGear('backpack')?.type).toBe('gears');
  });

  it('updateGear throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.updateGear('nonexistent', { weight: 6 })).toThrow();
  });

  it('removeGear removes gear by ID', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    editor.removeGear('backpack');
    expect(editor.listGears()).toHaveLength(0);
  });

  it('removeGear throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.removeGear('nonexistent')).toThrow();
  });

  it('duplicateGear returns new gear with -copy suffix', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    const copy = editor.duplicateGear('backpack');
    expect(copy.id).toBe('backpack-copy');
    expect(copy.type).toBe('gears');
    expect(editor.listGears()).toHaveLength(2);
  });

  it('duplicateGear throws if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(() => editor.duplicateGear('nonexistent')).toThrow();
  });

  it('getGear returns undefined if not found', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.getGear('nonexistent')).toBeUndefined();
  });

  it('listGears returns empty array if no gears', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    expect(editor.listGears()).toEqual([]);
  });
});

// ── Undo tests ──

describe('ContentEditor — Undo for weapon/armor/gear', () => {
  it('undo restores weapons to state before addWeapon', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    expect(editor.listWeapons()).toHaveLength(1);
    editor.undo();
    expect(editor.listWeapons()).toHaveLength(0);
  });

  it('undo restores weapons to state before updateWeapon', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addWeapon(makeWeapon());
    editor.updateWeapon('longsword', { cost: '20 gp' });
    editor.undo();
    expect(editor.getWeapon('longsword')?.cost).toBe('15 gp');
  });

  it('undo restores armors to state before removeArmor', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addArmor(makeArmor());
    editor.removeArmor('chain-mail');
    expect(editor.listArmors()).toHaveLength(0);
    editor.undo();
    expect(editor.listArmors()).toHaveLength(1);
  });

  it('undo restores gears to state before duplicateGear', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);
    editor.addGear(makeGear());
    editor.duplicateGear('backpack');
    expect(editor.listGears()).toHaveLength(2);
    editor.undo();
    expect(editor.listGears()).toHaveLength(1);
  });

  it('snapshot captures all 8 types independently', () => {
    const pack = makePack();
    const editor = new ContentEditor(pack);

    editor.addWeapon(makeWeapon());
    editor.addArmor(makeArmor());
    editor.addGear(makeGear());

    editor.updateWeapon('longsword', { cost: '20 gp' });

    editor.undo();
    expect(editor.getWeapon('longsword')?.cost).toBe('15 gp');
    expect(editor.listArmors()).toHaveLength(1);
    expect(editor.listGears()).toHaveLength(1);
  });
});
