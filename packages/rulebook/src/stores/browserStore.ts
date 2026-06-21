import { create } from 'zustand';
import type {
  SpellQuery,
  MonsterQuery,
  SpeciesQuery,
  BackgroundQuery,
  FeatQuery,
} from '@open20/content/types';
import type { Spell, Monster, Species, Background, Feat } from 'open20-core';
import { ContentBrowser } from '@open20/content/browser';
import manager from './contentManager';

// 初始化 ContentBrowser
const contentBrowser = new ContentBrowser(manager);

export type ContentBrowserTab = 'spells' | 'monsters' | 'species' | 'backgrounds' | 'feats';

interface BrowserStore {
  activeTab: ContentBrowserTab;
  spellFilters: SpellQuery;
  monsterFilters: MonsterQuery;
  speciesFilters: SpeciesQuery;
  backgroundFilters: BackgroundQuery;
  featFilters: FeatQuery;
  results: (Spell | Monster | Species | Background | Feat)[];
  loading: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: ContentBrowserTab) => void;
  setSpellFilter: (key: keyof SpellQuery, value: unknown) => void;
  setMonsterFilter: (key: keyof MonsterQuery, value: unknown) => void;
  setSpeciesFilter: (key: keyof SpeciesQuery, value: unknown) => void;
  setBackgroundFilter: (key: keyof BackgroundQuery, value: unknown) => void;
  setFeatFilter: (key: keyof FeatQuery, value: unknown) => void;
  clearFilters: () => void;
  search: () => Promise<void>;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  activeTab: 'spells',
  spellFilters: {},
  monsterFilters: {},
  speciesFilters: {},
  backgroundFilters: {},
  featFilters: {},
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

  setSpeciesFilter: (key, value) => {
    set((state) => ({ speciesFilters: { ...state.speciesFilters, [key]: value } }));
    get().search();
  },

  setBackgroundFilter: (key, value) => {
    set((state) => ({ backgroundFilters: { ...state.backgroundFilters, [key]: value } }));
    get().search();
  },

  setFeatFilter: (key, value) => {
    set((state) => ({ featFilters: { ...state.featFilters, [key]: value } }));
    get().search();
  },

  clearFilters: () => {
    set({
      spellFilters: {},
      monsterFilters: {},
      speciesFilters: {},
      backgroundFilters: {},
      featFilters: {},
    });
    get().search();
  },

  search: async () => {
    set({ loading: true, error: null });
    try {
      const {
        activeTab,
        spellFilters,
        monsterFilters,
        speciesFilters,
        backgroundFilters,
        featFilters,
      } = get();
      switch (activeTab) {
        case 'spells': {
          const results = await contentBrowser.searchSpells(spellFilters);
          set({ results, loading: false });
          break;
        }
        case 'monsters': {
          const results = await contentBrowser.searchMonsters(monsterFilters);
          set({ results, loading: false });
          break;
        }
        case 'species': {
          const results = await contentBrowser.searchSpecies(speciesFilters);
          set({ results, loading: false });
          break;
        }
        case 'backgrounds': {
          const results = await contentBrowser.searchBackgrounds(backgroundFilters);
          set({ results, loading: false });
          break;
        }
        case 'feats': {
          const results = await contentBrowser.searchFeats(featFilters);
          set({ results, loading: false });
          break;
        }
      }
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
}));
