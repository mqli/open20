import { create } from 'zustand';
import type { SpellQuery, MonsterQuery } from '@open20/content/types';
import type { Spell, Monster } from 'open20-core';
import { ContentBrowser } from '@open20/content/browser';
import manager from './contentManager';

// 初始化 ContentBrowser
const contentBrowser = new ContentBrowser(manager);

export type ContentBrowserTab = 'spells' | 'monsters';

interface BrowserStore {
  activeTab: ContentBrowserTab;
  spellFilters: SpellQuery;
  monsterFilters: MonsterQuery;
  results: (Spell | Monster)[];
  loading: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: ContentBrowserTab) => void;
  setSpellFilter: (key: keyof SpellQuery, value: unknown) => void;
  setMonsterFilter: (key: keyof MonsterQuery, value: unknown) => void;
  clearFilters: () => void;
  search: () => Promise<void>;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  activeTab: 'spells',
  spellFilters: {},
  monsterFilters: {},
  results: [],
  loading: false,
  error: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab, results: [], error: null });
    get().search();
  },

  setSpellFilter: (key, value) => {
    set((state) => ({ spellFilters: { ...state.spellFilters, [key]: value } }));
    get().search();
  },

  setMonsterFilter: (key, value) => {
    set((state) => ({ monsterFilters: { ...state.monsterFilters, [key]: value } }));
    get().search();
  },

  clearFilters: () => {
    set({ spellFilters: {}, monsterFilters: {} });
    get().search();
  },

  search: async () => {
    set({ loading: true, error: null });
    try {
      const { activeTab, spellFilters, monsterFilters } = get();
      if (activeTab === 'spells') {
        const results = await contentBrowser.searchSpells(spellFilters);
        set({ results, loading: false });
      } else {
        const results = await contentBrowser.searchMonsters(monsterFilters);
        set({ results, loading: false });
      }
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
}));
