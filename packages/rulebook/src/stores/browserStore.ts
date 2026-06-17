import { create } from 'zustand';
import type { SpellQuery } from '@open20/content/types';
import type { Spell } from 'open20-core';
import { ContentBrowser } from '@open20/content/browser';
import manager from './content-manager';

// 初始化 ContentBrowser
const contentBrowser = new ContentBrowser(manager);

interface BrowserStore {
  filters: SpellQuery;
  results: Spell[];
  loading: boolean;
  error: string | null;
  setFilter: (key: keyof SpellQuery, value: unknown) => void;
  clearFilters: () => void;
  searchSpells: () => Promise<void>;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  filters: {},
  results: [],
  loading: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
    // 自动触发搜索
    get().searchSpells();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().searchSpells();
  },

  searchSpells: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const results = await contentBrowser.searchSpells(filters);
      set({ results, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
}));
