import { create } from 'zustand';
import type { Spell, Monster, Species, Background, Feat } from 'open20-core';
import {
  getMonsterTemplate,
  getSpeciesTemplate,
  getBackgroundTemplate,
  getFeatTemplate,
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
  markClean: () => void;
  togglePreview: () => void;
  saveSpell: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveMonster: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveSpecies: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveBackground: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveFeat: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  loadSpell: (packId: string, contentId: string) => Promise<void>;
  loadMonster: (packId: string, contentId: string) => Promise<void>;
  loadSpecies: (packId: string, contentId: string) => Promise<void>;
  loadBackground: (packId: string, contentId: string) => Promise<void>;
  loadFeat: (packId: string, contentId: string) => Promise<void>;
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
    const editor = new ContentEditor(pack as any);

    if (contentId) {
      (editor as any)[updateFn](contentId, item as T);
    } else {
      (editor as any)[addFn](item as T);
    }

    await manager.savePack(pack);
    set({ isDirty: false });

    if (intent === 'new') {
      set({ [type]: { ...defaultItem }, contentId: null } as any);
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

    const items = (pack as any)[arrayKey] as T[] | undefined;
    const item = items?.find((i: T) => i.id === contentId);
    if (item) {
      set({ [typeKey]: { ...item }, contentId, isDirty: false } as any);
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
      get().spell as any,
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
      get().monster as any,
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
      get().species as any,
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
      get().background as any,
      'addBackground',
      'updateBackground',
      DEFAULT_BACKGROUND,
      intent,
    );
  },

  saveFeat: async (intent) => {
    await genericSave(
      get,
      set,
      'feat',
      get().feat as any,
      'addFeat',
      'updateFeat',
      DEFAULT_FEAT,
      intent,
    );
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
}));
