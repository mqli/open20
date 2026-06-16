import { create } from 'zustand';
import type { ContentPackMeta } from 'open20-core';
import { ContentPackManager } from '@open20/content/manager';

// Singleton ContentPackManager instance
const manager = new ContentPackManager();

interface PackStore {
  packs: ContentPackMeta[];
  loading: boolean;
  error: string | null;
  fetchPacks: () => Promise<void>;
  createAndSavePack: (meta: ContentPackMeta) => Promise<void>;
  deletePackAndStorage: (id: string) => Promise<void>;
  togglePackEnabled: (id: string) => void;
  isPackEnabled: (id: string) => boolean;
}

export const usePackStore = create<PackStore>((set, get) => ({
  packs: [],
  loading: false,
  error: null,

  fetchPacks: async () => {
    set({ loading: true, error: null });
    try {
      const packs = await manager.listPacks();
      set({ packs, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  createAndSavePack: async (meta) => {
    set({ error: null });
    try {
      const pack = manager.createPack(meta);
      await manager.savePack(pack);
      // Refresh pack list
      const packs = await manager.listPacks();
      set({ packs });
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  deletePackAndStorage: async (id) => {
    set({ error: null });
    try {
      await manager.deletePack(id);
      // Refresh pack list
      const packs = await manager.listPacks();
      set({ packs });
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  togglePackEnabled: (id) => {
    const { packs } = get();
    const pack = packs.find((p) => p.id === id);
    if (!pack) return;

    if (manager.isPackEnabled(id)) {
      manager.disablePack(id);
    } else {
      manager.enablePack(id);
    }
  },

  isPackEnabled: (id) => {
    return manager.isPackEnabled(id);
  },
}));
