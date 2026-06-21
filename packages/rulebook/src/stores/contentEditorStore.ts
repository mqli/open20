import { create } from 'zustand';
import type { Spell, Monster, Species, Background, Feat, Weapon, Armor, Gear } from 'open20-core';
import type { EditableContentPack } from '@open20/content/types';
import {
  getMonsterTemplate,
  getSpeciesTemplate,
  getBackgroundTemplate,
  getFeatTemplate,
  getWeaponTemplate,
  getArmorTemplate,
  getGearTemplate,
} from '@open20/content/templates';
import manager from './contentManager';

interface ContentEditorStore {
  // Route params
  packId: string | null;
  contentType: string | null;
  contentId: string | null;

  // Editor state (spell)
  spell: Partial<Spell>;
  // Editor state (monster)
  monster: Partial<Monster>;
  // Editor state (species)
  species: Partial<Species>;
  // Editor state (background)
  background: Partial<Background>;
  // Editor state (feat)
  feat: Partial<Feat>;
  // Editor state (weapon)
  weapon: Partial<Weapon>;
  // Editor state (armor)
  armor: Partial<Armor>;
  // Editor state (gear)
  gear: Partial<Gear>;
  isDirty: boolean;
  isPreviewOpen: boolean;
  isSaving: boolean;

  // Actions
  setParams: (packId: string, contentType: string, contentId?: string) => void;
  setSpell: (spell: Partial<Spell>) => void;
  setMonster: (monster: Partial<Monster>) => void;
  setSpecies: (species: Partial<Species>) => void;
  setBackground: (background: Partial<Background>) => void;
  setFeat: (feat: Partial<Feat>) => void;
  setWeapon: (weapon: Partial<Weapon>) => void;
  setArmor: (armor: Partial<Armor>) => void;
  setGear: (gear: Partial<Gear>) => void;
  markClean: () => void;
  togglePreview: () => void;
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

const DEFAULT_SPELL: Partial<Spell> = {
  id: '',
  name: '',
  level: 0,
  school: 'Evocation',
  castingTime: 'Action',
  range: '60 feet',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [''],
  source: 'Homebrew',
  classes: [],
};

const DEFAULT_MONSTER: Partial<Monster> = {
  ...getMonsterTemplate(),
};

const DEFAULT_SPECIES: Partial<Species> = {
  ...getSpeciesTemplate(),
};

const DEFAULT_BACKGROUND: Partial<Background> = {
  ...getBackgroundTemplate(),
};

const DEFAULT_FEAT: Partial<Feat> = {
  ...getFeatTemplate(),
};

const DEFAULT_WEAPON: Partial<Weapon> = {
  ...getWeaponTemplate(),
};

const DEFAULT_ARMOR: Partial<Armor> = {
  ...getArmorTemplate(),
};

const DEFAULT_GEAR: Partial<Gear> = {
  ...getGearTemplate(),
};

const genericSave = async <T extends { id: string }>(
  get: () => ContentEditorStore,
  set: (partial: Partial<ContentEditorStore>) => void,
  type: string,
  item: Partial<T>,
  addFn: string,
  updateFn: string,
  defaultItem: Partial<T>,
  intent: 'stay' | 'new' | 'close',
) => {
  const { packId, contentId } = get();
  if (!packId || !item.id) return;

  set({ isSaving: true });
  try {
    const pack = await manager.loadPack(packId);
    if (!pack) throw new Error(`Pack not found: ${packId}`);

    const { ContentEditor } = await import('@open20/content/editor');
    const editor = new ContentEditor(pack as EditableContentPack);

    // Dynamic method dispatch — addFn/updateFn map to typed ContentEditor methods
    const editorMethods = editor as unknown as Record<
      string,
      (idOrItem: string | object, updates?: object) => void
    >;
    if (contentId) {
      editorMethods[updateFn](contentId, item as object);
    } else {
      editorMethods[addFn](item as object);
    }

    await manager.savePack(pack);
    set({ isDirty: false });

    if (intent === 'new') {
      set({
        [type]: { ...defaultItem },
        contentId: null,
      } as unknown as Partial<ContentEditorStore>);
    }
  } finally {
    set({ isSaving: false });
  }
};

const genericLoad = async <T extends { id: string }>(
  packId: string,
  contentId: string,
  arrayKey: string,
  set: (partial: Partial<ContentEditorStore>) => void,
  typeKey: string,
) => {
  try {
    const pack = await manager.loadPack(packId);
    if (!pack) throw new Error(`Pack not found: ${packId}`);

    const items = (pack as unknown as Record<string, unknown[]>)[arrayKey] as T[] | undefined;
    const item = items?.find((i: T) => i.id === contentId);
    if (item) {
      set({
        [typeKey]: { ...item },
        contentId,
        isDirty: false,
      } as unknown as Partial<ContentEditorStore>);
    }
  } catch (error) {
    console.error(`Failed to load ${typeKey}:`, error);
  }
};

export const useContentEditorStore = create<ContentEditorStore>((set, get) => ({
  // Route params
  packId: null,
  contentType: null,
  contentId: null,

  // Editor state
  spell: { ...DEFAULT_SPELL },
  monster: { ...DEFAULT_MONSTER },
  species: { ...DEFAULT_SPECIES },
  background: { ...DEFAULT_BACKGROUND },
  feat: { ...DEFAULT_FEAT },
  weapon: { ...DEFAULT_WEAPON },
  armor: { ...DEFAULT_ARMOR },
  gear: { ...DEFAULT_GEAR },
  isDirty: false,
  isPreviewOpen: false,
  isSaving: false,

  // Actions
  setParams: (packId: string, contentType: string, contentId?: string) => {
    set({
      packId,
      contentType,
      contentId: contentId || null,
      spell: { ...DEFAULT_SPELL },
      monster: { ...DEFAULT_MONSTER },
      species: { ...DEFAULT_SPECIES },
      background: { ...DEFAULT_BACKGROUND },
      feat: { ...DEFAULT_FEAT },
      weapon: { ...DEFAULT_WEAPON },
      armor: { ...DEFAULT_ARMOR },
      gear: { ...DEFAULT_GEAR },
      isDirty: false,
    });
  },

  setSpell: (spell: Partial<Spell>) => {
    set({ spell, isDirty: true });
  },

  setMonster: (monster: Partial<Monster>) => {
    set({ monster, isDirty: true });
  },

  setSpecies: (species: Partial<Species>) => {
    set({ species, isDirty: true });
  },

  setBackground: (background: Partial<Background>) => {
    set({ background, isDirty: true });
  },

  setFeat: (feat: Partial<Feat>) => {
    set({ feat, isDirty: true });
  },

  setWeapon: (weapon: Partial<Weapon>) => {
    set({ weapon, isDirty: true });
  },

  setArmor: (armor: Partial<Armor>) => {
    set({ armor, isDirty: true });
  },

  setGear: (gear: Partial<Gear>) => {
    set({ gear, isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  togglePreview: () => {
    set((state) => ({ isPreviewOpen: !state.isPreviewOpen }));
  },

  saveSpell: async (intent) => {
    await genericSave(
      get,
      set,
      'spell',
      get().spell,
      'addSpell',
      'updateSpell',
      DEFAULT_SPELL,
      intent,
    );
  },

  saveMonster: async (intent) => {
    await genericSave(
      get,
      set,
      'monster',
      get().monster,
      'addMonster',
      'updateMonster',
      DEFAULT_MONSTER,
      intent,
    );
  },

  saveSpecies: async (intent) => {
    await genericSave(
      get,
      set,
      'species',
      get().species,
      'addSpecies',
      'updateSpecies',
      DEFAULT_SPECIES,
      intent,
    );
  },

  saveBackground: async (intent) => {
    await genericSave(
      get,
      set,
      'background',
      get().background,
      'addBackground',
      'updateBackground',
      DEFAULT_BACKGROUND,
      intent,
    );
  },

  saveFeat: async (intent) => {
    await genericSave(get, set, 'feat', get().feat, 'addFeat', 'updateFeat', DEFAULT_FEAT, intent);
  },

  saveWeapon: async (intent) => {
    await genericSave(
      get,
      set,
      'weapon',
      get().weapon,
      'addWeapon',
      'updateWeapon',
      DEFAULT_WEAPON,
      intent,
    );
  },

  saveArmor: async (intent) => {
    await genericSave(
      get,
      set,
      'armor',
      get().armor,
      'addArmor',
      'updateArmor',
      DEFAULT_ARMOR,
      intent,
    );
  },

  saveGear: async (intent) => {
    await genericSave(get, set, 'gear', get().gear, 'addGear', 'updateGear', DEFAULT_GEAR, intent);
  },

  loadSpell: async (packId, contentId) => {
    await genericLoad<Spell>(packId, contentId, 'spells', set, 'spell');
  },

  loadMonster: async (packId, contentId) => {
    await genericLoad<Monster>(packId, contentId, 'monsters', set, 'monster');
  },

  loadSpecies: async (packId, contentId) => {
    await genericLoad<Species>(packId, contentId, 'species', set, 'species');
  },

  loadBackground: async (packId, contentId) => {
    await genericLoad<Background>(packId, contentId, 'backgrounds', set, 'background');
  },

  loadFeat: async (packId, contentId) => {
    await genericLoad<Feat>(packId, contentId, 'feats', set, 'feat');
  },

  loadWeapon: async (packId, contentId) => {
    await genericLoad<Weapon>(packId, contentId, 'weapons', set, 'weapon');
  },

  loadArmor: async (packId, contentId) => {
    await genericLoad<Armor>(packId, contentId, 'armors', set, 'armor');
  },

  loadGear: async (packId, contentId) => {
    await genericLoad<Gear>(packId, contentId, 'gears', set, 'gear');
  },
}));
