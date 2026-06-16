import { create } from 'zustand';

interface BrowserFilters {
  name?: string;
  level?: number;
  levelRange?: { min: number; max: number };
  school?: string;
  classes?: string[];
  source?: string;
}

interface BrowserStore {
  filters: BrowserFilters;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: {} }),
}));
