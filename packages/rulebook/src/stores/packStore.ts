import { create } from 'zustand';
import type { ContentPackMeta } from 'open20-core';
import manager from './contentManager';

interface PackStore {
  packs: ContentPackMeta[];
  loading: boolean;
  error: string | null;
  contentCounts: Record<string, number>;
  fetchPacks: () => Promise<void>;
  createAndSavePack: (meta: ContentPackMeta) => Promise<void>;
  deletePackAndStorage: (id: string) => Promise<void>;
  togglePackEnabled: (id: string) => void;
  isPackEnabled: (id: string) => boolean;
  isBuiltInPack: (id: string) => boolean;
}

export const usePackStore = create<PackStore>((set, get) => ({
  packs: [],
  loading: false,
  error: null,
  contentCounts: {},

  fetchPacks: async () => {
    set({ loading: true, error: null });
    try {
      const packs = await manager.listPacks();
      // Load content counts for each pack
      const counts: Record<string, number> = {};
      for (const pack of packs) {
        try {
          const loaded = await manager.loadPack(pack.id);
          if (loaded) {
            let total = 0;
            const contentKeys = [
              'spells',
              'monsters',
              'species',
              'backgrounds',
              'classes',
              'subclasses',
              'feats',
              'weapons',
              'armors',
              'gears',
            ] as const;
            for (const key of contentKeys) {
              const items = (loaded as any)[key];
              if (Array.isArray(items)) total += items.length;
            }
            counts[pack.id] = total;
          }
        } catch {
          counts[pack.id] = 0;
        }
      }
      set({ packs, contentCounts: counts, loading: false });
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

  /**
   * Check if a pack is a built-in pack (read-only, cannot be edited or deleted).
   */
  isBuiltInPack: (id: string) => {
    return manager.isBuiltInPack(id);
  },
}));
