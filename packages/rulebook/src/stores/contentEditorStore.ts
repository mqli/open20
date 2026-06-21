import { create } from 'zustand';
import type { Spell, Monster } from 'open20-core';
import { getMonsterTemplate } from '@open20/content/templates';
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
  isDirty: boolean;
  isPreviewOpen: boolean;
  isSaving: boolean;

  // Actions
  setParams: (packId: string, contentType: string, contentId?: string) => void;
  setSpell: (spell: Partial<Spell>) => void;
  setMonster: (monster: Partial<Monster>) => void;
  markClean: () => void;
  togglePreview: () => void;
  saveSpell: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  saveMonster: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  loadSpell: (packId: string, contentId: string) => Promise<void>;
  loadMonster: (packId: string, contentId: string) => Promise<void>;
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

export const useContentEditorStore = create<ContentEditorStore>((set, get) => ({
  // Route params
  packId: null,
  contentType: null,
  contentId: null,

  // Editor state
  spell: { ...DEFAULT_SPELL },
  monster: { ...DEFAULT_MONSTER },
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
      isDirty: false,
    });
  },

  setSpell: (spell: Partial<Spell>) => {
    set({ spell, isDirty: true });
  },

  setMonster: (monster: Partial<Monster>) => {
    set({ monster, isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  togglePreview: () => {
    set((state) => ({ isPreviewOpen: !state.isPreviewOpen }));
  },

  saveSpell: async (intent: 'stay' | 'new' | 'close') => {
    const { packId, contentId, spell } = get();
    if (!packId || !spell.id) return;

    set({ isSaving: true });
    try {
      const pack = await manager.loadPack(packId);
      if (!pack) throw new Error(`Pack not found: ${packId}`);

      const { ContentEditor } = await import('@open20/content/editor');
      const editor = new ContentEditor(pack as any);

      if (contentId) {
        editor.updateSpell(contentId, spell as Spell);
      } else {
        editor.addSpell(spell as Spell);
      }

      await manager.savePack(pack);
      set({ isDirty: false });

      if (intent === 'new') {
        set({ spell: { ...DEFAULT_SPELL }, contentId: null });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  saveMonster: async (intent: 'stay' | 'new' | 'close') => {
    const { packId, contentId, monster } = get();
    if (!packId || !monster.id) return;

    set({ isSaving: true });
    try {
      const pack = await manager.loadPack(packId);
      if (!pack) throw new Error(`Pack not found: ${packId}`);

      const { ContentEditor } = await import('@open20/content/editor');
      const editor = new ContentEditor(pack as any);

      if (contentId) {
        editor.updateMonster(contentId, monster as Monster);
      } else {
        editor.addMonster(monster as Monster);
      }

      await manager.savePack(pack);
      set({ isDirty: false });

      if (intent === 'new') {
        set({ monster: { ...DEFAULT_MONSTER }, contentId: null });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  loadSpell: async (packId: string, contentId: string) => {
    try {
      const pack = await manager.loadPack(packId);
      if (!pack) throw new Error(`Pack not found: ${packId}`);

      const spell = pack.spells?.find((s: Spell) => s.id === contentId);
      if (spell) {
        set({ spell: { ...spell }, contentId, isDirty: false });
      }
    } catch (error) {
      console.error('Failed to load spell:', error);
    }
  },

  loadMonster: async (packId: string, contentId: string) => {
    try {
      const pack = await manager.loadPack(packId);
      if (!pack) throw new Error(`Pack not found: ${packId}`);

      const monster = (pack.monsters as Monster[] | undefined)?.find(
        (m: Monster) => m.id === contentId,
      );
      if (monster) {
        set({ monster: { ...monster }, contentId, isDirty: false });
      }
    } catch (error) {
      console.error('Failed to load monster:', error);
    }
  },
}));
