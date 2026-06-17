import { create } from 'zustand';
import type { ContentPack } from 'open20-core';
import type { Spell } from 'open20-core';
import manager from './content-manager';

interface PackDetailStore {
  pack: ContentPack | null;
  loading: boolean;
  error: string | null;
  activeTab: string;
  selectedIds: string[];
  inlineEditSpell: Spell | null;
  isBuiltIn: boolean;

  // Actions
  loadPack: (id: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
  toggleSelectedId: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setInlineEditSpell: (spell: Spell | null) => void;
}

export const usePackDetailStore = create<PackDetailStore>((set, get) => ({
  pack: null,
  loading: false,
  error: null,
  activeTab: 'all',
  selectedIds: [],
  inlineEditSpell: null,
  isBuiltIn: false,

  loadPack: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const pack = await manager.loadPack(id);
      if (pack === null) {
        set({ error: `Pack not found: ${id}`, loading: false });
      } else {
        const isBuiltIn = manager.isBuiltInPack(id);
        set({ pack, loading: false, isBuiltIn });
      }
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  toggleSelectedId: (id: string) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((selectedId) => selectedId !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  selectAll: (ids: string[]) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  setInlineEditSpell: (spell: Spell | null) => {
    set({ inlineEditSpell: spell });
  },
}));
