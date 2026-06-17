import { create } from 'zustand';
import type { Spell } from 'open20-core';
import manager from './content-manager';

interface ContentEditorStore {
  // Route params
  packId: string | null;
  contentType: string | null;
  contentId: string | null;

  // Editor state
  spell: Partial<Spell>;
  isDirty: boolean;
  isPreviewOpen: boolean;
  isSaving: boolean;

  // Actions
  setParams: (packId: string, contentType: string, contentId?: string) => void;
  setSpell: (spell: Partial<Spell>) => void;
  markClean: () => void;
  togglePreview: () => void;
  saveSpell: (intent: 'stay' | 'new' | 'close') => Promise<void>;
  loadSpell: (packId: string, contentId: string) => Promise<void>;
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

export const useContentEditorStore = create<ContentEditorStore>((set, get) => ({
  // Route params
  packId: null,
  contentType: null,
  contentId: null,

  // Editor state
  spell: { ...DEFAULT_SPELL },
  isDirty: false,
  isPreviewOpen: false,
  isSaving: false,

  // Actions
  setParams: (packId: string, contentType: string, contentId?: string) => {
    set({
      packId,
      contentType,
      contentId: contentId || null,
      spell: contentId ? { ...DEFAULT_SPELL } : { ...DEFAULT_SPELL },
      isDirty: false,
    });
  },

  setSpell: (spell: Partial<Spell>) => {
    set({ spell, isDirty: true });
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
      // Load the pack
      const pack = await manager.loadPack(packId);
      if (!pack) throw new Error(`Pack not found: ${packId}`);

      // Create ContentEditor instance
      const { ContentEditor } = await import('@open20/content/editor');
      const editor = new ContentEditor(pack as any);

      // Save spell
      if (contentId) {
        // Update existing spell
        editor.updateSpell(contentId, spell as Spell);
      } else {
        // Add new spell
        editor.addSpell(spell as Spell);
      }

      // Save pack
      await manager.savePack(pack);

      set({ isDirty: false });

      // Handle intent
      if (intent === 'new') {
        set({ spell: { ...DEFAULT_SPELL }, contentId: null });
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
}));
