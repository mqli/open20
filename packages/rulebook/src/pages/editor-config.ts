import type { ComponentType } from 'react';

export interface EditorConfig {
  label: string;
  stateKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EditorComponent: ComponentType<any>;
  saveFn: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  loadFn: (packId: string, contentId: string) => Promise<void>;
  extraProps?: Record<string, unknown>;
}

export interface EditorComponents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpellEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MonsterEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeciesEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BackgroundEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FeatEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WeaponEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ArmorEditor: ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GearEditor: ComponentType<any>;
}

export interface EditorStoreFns {
  saveSpell: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveMonster: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveSpecies: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveBackground: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveFeat: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveWeapon: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveArmor: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveGear: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  loadSpell: (packId: string, contentId: string) => Promise<void>;
  loadMonster: (packId: string, contentId: string) => Promise<void>;
  loadSpecies: (packId: string, contentId: string) => Promise<void>;
  loadBackground: (packId: string, contentId: string) => Promise<void>;
  loadFeat: (packId: string, contentId: string) => Promise<void>;
  loadWeapon: (packId: string, contentId: string) => Promise<void>;
  loadArmor: (packId: string, contentId: string) => Promise<void>;
  loadGear: (packId: string, contentId: string) => Promise<void>;
}

export function buildEditorConfigs(
  components: EditorComponents,
  fns: EditorStoreFns,
): Record<string, EditorConfig> {
  return {
    spell: {
      label: 'Spell',
      stateKey: 'spell',
      EditorComponent: components.SpellEditor,
      saveFn: fns.saveSpell,
      loadFn: fns.loadSpell,
    },
    monster: {
      label: 'Monster',
      stateKey: 'monster',
      EditorComponent: components.MonsterEditor,
      saveFn: fns.saveMonster,
      loadFn: fns.loadMonster,
      extraProps: { showPreview: true, mode: 'simple' },
    },
    species: {
      label: 'Species',
      stateKey: 'species',
      EditorComponent: components.SpeciesEditor,
      saveFn: fns.saveSpecies,
      loadFn: fns.loadSpecies,
    },
    background: {
      label: 'Background',
      stateKey: 'background',
      EditorComponent: components.BackgroundEditor,
      saveFn: fns.saveBackground,
      loadFn: fns.loadBackground,
    },
    feat: {
      label: 'Feat',
      stateKey: 'feat',
      EditorComponent: components.FeatEditor,
      saveFn: fns.saveFeat,
      loadFn: fns.loadFeat,
    },
    weapon: {
      label: 'Weapon',
      stateKey: 'weapon',
      EditorComponent: components.WeaponEditor,
      saveFn: fns.saveWeapon,
      loadFn: fns.loadWeapon,
    },
    armor: {
      label: 'Armor',
      stateKey: 'armor',
      EditorComponent: components.ArmorEditor,
      saveFn: fns.saveArmor,
      loadFn: fns.loadArmor,
    },
    gear: {
      label: 'Gear',
      stateKey: 'gear',
      EditorComponent: components.GearEditor,
      saveFn: fns.saveGear,
      loadFn: fns.loadGear,
    },
  };
}
